#!/usr/bin/env python3
"""
Fetch top 500 Seoul clinics from Google Places API (English) and import to Supabase.

Searches multiple clinic types across Seoul, deduplicates by place_id,
ranks by user_ratings_total, and inserts the top 500 into Supabase as drafts.

Required env:
  GOOGLE_PLACES_API_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Usage:
  GOOGLE_PLACES_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/fetch_clinics_google.py
"""

from __future__ import annotations

import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

PLACES_BASE = "https://maps.googleapis.com/maps/api/place"
TOP_N = 500
BATCH_SIZE = 50

SEARCH_QUERIES = [
    # Dermatology — major districts
    "dermatology clinic Gangnam Seoul",
    "dermatology clinic Apgujeong Seoul",
    "dermatology clinic Sinsa Seoul",
    "dermatology clinic Cheongdam Seoul",
    "dermatology clinic Myeongdong Seoul",
    "dermatology clinic Hongdae Seoul",
    "dermatology clinic Itaewon Seoul",
    "dermatology clinic Dongdaemun Seoul",
    "dermatology clinic Mapo Seoul",
    "dermatology clinic Yeoksam Seoul",
    "dermatology clinic Seocho Seoul",
    "dermatology clinic Jamsil Seoul",
    "dermatology clinic Bundang Seoul",
    # Plastic surgery — major districts
    "plastic surgery clinic Gangnam Seoul",
    "plastic surgery clinic Apgujeong Seoul",
    "plastic surgery clinic Cheongdam Seoul",
    "plastic surgery clinic Sinsa Seoul",
    "plastic surgery clinic Hongdae Seoul",
    "plastic surgery clinic Myeongdong Seoul",
    "plastic surgery clinic Seocho Seoul",
    "plastic surgery clinic Mapo Seoul",
    # Skin / aesthetic / laser
    "skin clinic Gangnam Seoul",
    "skin care clinic Apgujeong Seoul",
    "laser skin clinic Seoul Korea",
    "aesthetic clinic Seoul Korea",
    "anti-aging clinic Gangnam Seoul",
    "botox filler clinic Gangnam Seoul",
    "Ultherapy laser clinic Seoul",
    "PRP skin treatment Seoul",
    # Hair transplant
    "hair transplant clinic Seoul Korea",
    "hair loss clinic Gangnam Seoul",
    # Dental
    "dental clinic Gangnam Seoul",
    "dental clinic Apgujeong Seoul",
    "cosmetic dentistry Seoul Korea",
    # Eye surgery
    "LASIK eye surgery Seoul Korea",
    "eye surgery clinic Gangnam Seoul",
    # Health check / wellness
    "health screening clinic Seoul Korea",
    "medical check-up Seoul Korea",
    "wellness clinic Seoul Korea",
    # Catch-all foreign-friendly
    "English speaking clinic Seoul Korea",
    "foreigner friendly clinic Seoul",
    "medical tourism clinic Seoul Korea",
]


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required env: {name}")
    return value.rstrip("/")


def slugify(value: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).lower()
    normalized = re.sub(r"[^a-z0-9]+", "-", normalized)
    normalized = re.sub(r"-+", "-", normalized).strip("-")
    return normalized or fallback


def google_get(path: str, params: dict[str, str]) -> dict[str, Any]:
    url = f"{PLACES_BASE}/{path}/json?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"Google API error: {exc.code} {exc.read().decode()}") from exc


def text_search(query: str, api_key: str, page_token: str | None = None) -> dict[str, Any]:
    params: dict[str, str] = {
        "query": query,
        "language": "en",
        "region": "kr",
        "key": api_key,
    }
    if page_token:
        params["pagetoken"] = page_token
    return google_get("textsearch", params)


def place_details(place_id: str, api_key: str) -> dict[str, Any]:
    return google_get("details", {
        "place_id": place_id,
        "language": "en",
        "fields": (
            "name,formatted_address,formatted_phone_number,international_phone_number,"
            "website,rating,user_ratings_total,geometry,address_components,types,url,"
            "reviews,photos,opening_hours,price_level,business_status,editorial_summary"
        ),
        "key": api_key,
    })


def collect_candidates(api_key: str) -> dict[str, dict[str, Any]]:
    candidates: dict[str, dict[str, Any]] = {}

    for query in SEARCH_QUERIES:
        print(f"  Searching: {query}")
        page_token = None

        for page in range(3):  # max 3 pages = 60 results per query
            if page > 0:
                time.sleep(2.5)  # Google requires delay before using next_page_token

            data = text_search(query, api_key, page_token)
            status = data.get("status")

            if status not in ("OK", "ZERO_RESULTS"):
                print(f"    Warning: status={status}")
                break

            for place in data.get("results", []):
                pid = place["place_id"]
                if pid not in candidates:
                    candidates[pid] = place

            page_token = data.get("next_page_token")
            if not page_token:
                break

        print(f"    Total unique so far: {len(candidates)}")

    return candidates


def detect_clinic_type(name: str, types: list[str]) -> str:
    name_lower = name.lower()
    types_str = " ".join(types).lower()
    combined = f"{name_lower} {types_str}"

    if any(t in combined for t in ["plastic surgery", "cosmetic surgery", "rhinoplasty", "blepharoplasty", "facelift"]):
        return "plastic_surgery"
    if "dental" in combined or "dentist" in combined or "orthodont" in combined:
        return "dental"
    if any(t in combined for t in ["hair transplant", "hair loss", "hair restoration"]):
        return "hair"
    if any(t in combined for t in ["lasik", "eye surgery", "ophthalmol"]):
        return "eye"
    if any(t in combined for t in ["health screening", "check-up", "checkup", "wellness"]):
        return "wellness"
    if any(t in combined for t in ["dermatology", "skin clinic", "skin care", "aesthetic", "laser", "botox", "filler"]):
        return "dermatology"
    return "dermatology"  # default for aesthetic clinics


def extract_district(address_components: list[dict]) -> str | None:
    for comp in address_components:
        if "sublocality_level_1" in comp.get("types", []):
            return comp.get("long_name")
        if "locality" in comp.get("types", []):
            return comp.get("long_name")
    return None


def supabase_request(
    base_url: str,
    service_key: str,
    method: str,
    path: str,
    payload: Any = None,
    prefer: str | None = None,
) -> Any:
    body = None if payload is None else json.dumps(payload).encode("utf-8")
    headers = {
        "apikey": service_key,
        "Authorization": f"Bearer {service_key}",
        "Content-Type": "application/json",
    }
    if prefer:
        headers["Prefer"] = prefer

    request = urllib.request.Request(
        f"{base_url}/rest/v1/{path}",
        data=body,
        headers=headers,
        method=method,
    )
    try:
        with urllib.request.urlopen(request, timeout=60) as response:
            data = response.read().decode("utf-8")
            return json.loads(data) if data else None
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        raise SystemExit(f"Supabase {method} {path} failed: {exc.code}\n{detail}") from exc


def chunked(items: list, size: int):
    for i in range(0, len(items), size):
        yield items[i:i + size]


def main() -> None:
    api_key = env("GOOGLE_PLACES_API_KEY")
    supabase_url = env("SUPABASE_URL")
    supabase_key = env("SUPABASE_SERVICE_ROLE_KEY")

    print("=== Collecting candidates from Google Places ===")
    candidates = collect_candidates(api_key)
    print(f"\nTotal unique candidates: {len(candidates)}")

    # Sort by user_ratings_total (most reviewed = most prominent)
    ranked = sorted(
        candidates.values(),
        key=lambda p: p.get("user_ratings_total", 0),
        reverse=True,
    )
    top = ranked[:TOP_N]
    print(f"Selected top {len(top)} by review count")

    print("\n=== Fetching place details for top clinics ===")
    clinic_rows: list[dict[str, Any]] = []
    category_rows: list[dict[str, Any]] = []
    checklist_rows: list[dict[str, Any]] = []

    for i, place in enumerate(top):
        place_id = place["place_id"]
        print(f"  [{i+1}/{len(top)}] {place.get('name', place_id)}")

        details_resp = place_details(place_id, api_key)
        if details_resp.get("status") != "OK":
            print(f"    Skipping — details status: {details_resp.get('status')}")
            continue

        d = details_resp["result"]
        name = d.get("name", "")
        clinic_type = detect_clinic_type(name, d.get("types", []))
        address_components = d.get("address_components", [])
        district = extract_district(address_components)
        geometry = d.get("geometry", {}).get("location", {})

        slug_base = slugify(name, f"clinic-{place_id[-6:]}")
        slug = f"{slug_base}-{place_id[-6:]}"

        clinic_rows.append({
            "slug": slug,
            "display_name": name,
            "legal_name": name,
            "description": f"{name} is a clinic in {district or 'Seoul'}, South Korea. Profile imported from Google Places.",
            "location_label": district or "Seoul",
            "district": district,
            "road_address_name": d.get("formatted_address"),
            "longitude": geometry.get("lng"),
            "latitude": geometry.get("lat"),
            "phone": d.get("formatted_phone_number"),
            "website_url": d.get("website"),
            "kakao_place_url": d.get("url"),  # google maps url
            "source": "google_places",
            "source_place_id": place_id,
            "clinic_type": clinic_type,
            "profile_status": "draft",
            "review_status": "directory_approved",
            "sponsored_status": "none",
            "price_range_label": "Contact for pricing",
            "foreigner_support": "Language support not yet confirmed.",
            "before_visit_notes": "Bring your passport, confirm your appointment time, and prepare allergy or medication information.",
            "aftercare_notes": "Follow the clinic's aftercare instructions and contact them if symptoms feel unusual.",
            "rating": d.get("rating"),
            "user_ratings_total": d.get("user_ratings_total"),
            "international_phone": d.get("international_phone_number"),
            "price_level": d.get("price_level"),
            "business_status": d.get("business_status"),
            "editorial_summary": d.get("editorial_summary", {}).get("overview") if d.get("editorial_summary") else None,
            "opening_hours": {"weekday_text": d["opening_hours"].get("weekday_text", []), "open_now": d["opening_hours"].get("open_now")} if d.get("opening_hours") else None,
            "reviews": [{"author": r.get("author_name"), "rating": r.get("rating"), "text": r.get("text"), "time": r.get("relative_time_description"), "lang": r.get("language")} for r in d.get("reviews", [])] or None,
            "photo_references": [p["photo_reference"] for p in d.get("photos", [])[:5]] or None,
        })

        time.sleep(0.2)

    print(f"\n=== Importing {len(clinic_rows)} clinics to Supabase ===")

    for batch in chunked(clinic_rows, BATCH_SIZE):
        supabase_request(
            supabase_url, supabase_key,
            "POST", "clinics?on_conflict=slug",
            batch,
            prefer="resolution=merge-duplicates",
        )
        time.sleep(0.3)
    print(f"Upserted {len(clinic_rows)} clinics")

    # Fetch inserted clinic IDs
    rows = supabase_request(
        supabase_url, supabase_key,
        "GET", "clinics?select=id,source_place_id&source=eq.google_places&source_place_id=not.is.null",
    )
    id_map = {r["source_place_id"]: r["id"] for r in (rows or [])}

    for clinic in clinic_rows:
        cid = id_map.get(clinic["source_place_id"])
        if not cid:
            continue
        clinic_type = clinic["clinic_type"]
        category = {
            "plastic_surgery": "Plastic Surgery",
            "dermatology": "Dermatology",
            "dental": "Dental",
            "hair": "Hair Transplant",
            "eye": "Eye Surgery",
            "wellness": "Health & Wellness",
        }.get(clinic_type, "Dermatology")
        category_rows.append({"clinic_id": cid, "category": category})

        for order, (stage, label) in enumerate([
            ("before", "Confirm the clinic name, location, and appointment time before visiting."),
            ("before", "Bring your passport and any medication or allergy information."),
            ("before", "Ask whether English-speaking staff is available before arrival."),
            ("during", "Ask the clinic to explain consent forms before signing."),
            ("during", "Confirm total expected cost before treatment starts."),
            ("after", "Follow the clinic's aftercare instructions carefully."),
            ("after", "Save the clinic contact before leaving Korea for any follow-up."),
        ], 1):
            checklist_rows.append({"clinic_id": cid, "stage": stage, "label": label, "sort_order": order})

    for batch in chunked(category_rows, BATCH_SIZE):
        supabase_request(
            supabase_url, supabase_key,
            "POST", "clinic_categories?on_conflict=clinic_id,category",
            batch, prefer="resolution=merge-duplicates",
        )
    print(f"Upserted {len(category_rows)} categories")

    for batch in chunked(checklist_rows, BATCH_SIZE):
        supabase_request(
            supabase_url, supabase_key,
            "POST", "clinic_checklist_items?on_conflict=clinic_id,stage,label",
            batch, prefer="resolution=merge-duplicates",
        )
    print(f"Upserted {len(checklist_rows)} checklist items")

    print("\n=== Done ===")
    print(f"Imported {len(clinic_rows)} clinics as draft.")
    print("Go to /admin/clinics to review and publish.")


if __name__ == "__main__":
    main()
