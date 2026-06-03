#!/usr/bin/env python3
"""
Backfill extended Place Details for all google_places clinics already in Supabase.

Fetches: rating, user_ratings_total, international_phone, price_level,
         business_status, editorial_summary, opening_hours, reviews, photo_references

Required env:
  GOOGLE_PLACES_API_KEY
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Usage:
  GOOGLE_PLACES_API_KEY=... SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... python3 scripts/backfill_clinic_details.py
"""

from __future__ import annotations

import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request
from typing import Any

PLACES_BASE = "https://maps.googleapis.com/maps/api/place"
DETAIL_FIELDS = (
    "rating,user_ratings_total,international_phone_number,"
    "price_level,business_status,editorial_summary,"
    "opening_hours,reviews,photos"
)


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required env: {name}")
    return value.rstrip("/")


def google_get(path: str, params: dict[str, str]) -> dict[str, Any]:
    url = f"{PLACES_BASE}/{path}/json?" + urllib.parse.urlencode(params)
    try:
        with urllib.request.urlopen(url, timeout=15) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        raise SystemExit(f"Google API error: {exc.code} {exc.read().decode()}") from exc


def place_details(place_id: str, api_key: str) -> dict[str, Any]:
    return google_get("details", {
        "place_id": place_id,
        "language": "en",
        "fields": DETAIL_FIELDS,
        "key": api_key,
    })


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


def main() -> None:
    api_key = env("GOOGLE_PLACES_API_KEY")
    supabase_url = env("SUPABASE_URL")
    supabase_key = env("SUPABASE_SERVICE_ROLE_KEY")

    print("=== Fetching clinic list from Supabase ===")
    rows = supabase_request(
        supabase_url, supabase_key,
        "GET", "clinics?select=id,source_place_id&source=eq.google_places&source_place_id=not.is.null&limit=1000",
    )
    if not rows:
        raise SystemExit("No google_places clinics found in DB.")
    print(f"Found {len(rows)} clinics to backfill")

    updated = 0
    skipped = 0

    for i, row in enumerate(rows):
        clinic_id = row["id"]
        place_id = row["source_place_id"]
        print(f"  [{i+1}/{len(rows)}] place_id={place_id}", end="", flush=True)

        resp = place_details(place_id, api_key)
        if resp.get("status") != "OK":
            print(f" — skipped ({resp.get('status')})")
            skipped += 1
            time.sleep(0.1)
            continue

        d = resp["result"]

        # Extract opening hours
        oh = d.get("opening_hours")
        opening_hours = None
        if oh:
            opening_hours = {
                "weekday_text": oh.get("weekday_text", []),
                "open_now": oh.get("open_now"),
            }

        # Extract reviews (up to 5)
        raw_reviews = d.get("reviews", [])
        reviews = [
            {
                "author": r.get("author_name"),
                "rating": r.get("rating"),
                "text": r.get("text"),
                "time": r.get("relative_time_description"),
                "lang": r.get("language"),
            }
            for r in raw_reviews
        ] or None

        # Extract photo references (up to 5)
        raw_photos = d.get("photos", [])
        photo_references = [p["photo_reference"] for p in raw_photos[:5]] or None

        # Editorial summary
        editorial = d.get("editorial_summary", {}).get("overview") if d.get("editorial_summary") else None

        patch = {
            "rating": d.get("rating"),
            "user_ratings_total": d.get("user_ratings_total"),
            "international_phone": d.get("international_phone_number"),
            "price_level": d.get("price_level"),
            "business_status": d.get("business_status"),
            "editorial_summary": editorial,
            "opening_hours": opening_hours,
            "reviews": reviews,
            "photo_references": photo_references,
        }
        # Remove None values to avoid overwriting with null
        patch = {k: v for k, v in patch.items() if v is not None}

        supabase_request(
            supabase_url, supabase_key,
            "PATCH", f"clinics?id=eq.{clinic_id}",
            patch,
        )

        rating_str = f" ★{d.get('rating', '?')} ({d.get('user_ratings_total', 0)} reviews)"
        photos_str = f" 📷{len(raw_photos)}" if raw_photos else ""
        print(rating_str + photos_str)

        updated += 1
        time.sleep(0.15)

    print(f"\n=== Done ===")
    print(f"Updated: {updated}  Skipped: {skipped}")


if __name__ == "__main__":
    main()
