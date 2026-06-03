#!/usr/bin/env python3
"""
Import Kakao Local clinic candidates into Supabase.

This script does two things:
1. Inserts every source row into raw_clinic_places with an automated review status.
2. Promotes approved rows into draft clinics with basic categories/languages/checklists.

Required env:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY

Optional env:
  CLINIC_CSV_PATH=data/seoul-clinics-kakao.csv
  PUBLISH_APPROVED_CLINICS=false
  DRY_RUN=false
"""

from __future__ import annotations

import csv
import json
import os
import re
import sys
import time
import unicodedata
import urllib.error
import urllib.request
from dataclasses import dataclass
from pathlib import Path
from typing import Any


PROJECT_ROOT = Path(__file__).resolve().parents[1]
DEFAULT_CSV_PATH = PROJECT_ROOT / "data" / "seoul-clinics-kakao.csv"
BATCH_SIZE = 250

REJECT_CATEGORY_TERMS = [
    "음식점",
    "주차장",
    "부동산",
    "빌딩",
    "동물병원",
    "단체,협회",
    "병원부속시설",
    "두피,탈모관리",
    "체형관리",
    "피부관리",
    "미용",
]


@dataclass
class ReviewResult:
    clinic_type: str
    review_status: str
    review_notes: str
    categories: list[str]


def env(name: str) -> str:
    value = os.environ.get(name, "").strip()
    if not value:
        raise SystemExit(f"Missing required env: {name}")
    return value.rstrip("/")


def slugify(value: str, fallback: str) -> str:
    normalized = unicodedata.normalize("NFKD", value).lower()
    normalized = re.sub(r"[^a-z0-9가-힣]+", "-", normalized)
    normalized = re.sub(r"-+", "-", normalized).strip("-")
    return normalized or fallback


def review_row(row: dict[str, str]) -> ReviewResult:
    name = row.get("place_name", "").strip()
    category = row.get("category_name", "").strip()
    query = row.get("query", "").strip()
    road_address = row.get("road_address_name", "").strip()
    address = row.get("address_name", "").strip()
    phone = row.get("phone", "").strip()
    x = row.get("x", "").strip()
    y = row.get("y", "").strip()

    text = f"{name} {category} {query}"
    notes: list[str] = []
    categories: list[str] = []

    if "성형외과" in text:
        clinic_type = "plastic_surgery"
        categories.append("Plastic Surgery")
    elif "피부과" in text:
        clinic_type = "dermatology"
        categories.append("Dermatology")
    elif "치과" in text:
        clinic_type = "dental"
        categories.append("Dental")
    else:
        clinic_type = "other"

    if "피부" in text and "Dermatology" not in categories:
        categories.append("Skin")
    if "성형" in text and "Plastic Surgery" not in categories:
        categories.append("Plastic Surgery")

    if any(term in category for term in REJECT_CATEGORY_TERMS):
        return ReviewResult(
            clinic_type=clinic_type,
            review_status="reject",
            review_notes=f"Rejected by category filter: {category}",
            categories=categories or ["Clinic Guide"],
        )

    if not address.startswith("서울"):
        notes.append("Address is not clearly in Seoul")
    if not road_address:
        notes.append("Missing road address")
    if not phone:
        notes.append("Missing phone")
    if not x or not y:
        notes.append("Missing coordinates")
    if clinic_type == "other":
        notes.append("Clinic type is ambiguous")

    if notes:
        return ReviewResult(
            clinic_type=clinic_type,
            review_status="needs_manual_review",
            review_notes="; ".join(notes),
            categories=categories or ["Clinic Guide"],
        )

    return ReviewResult(
        clinic_type=clinic_type,
        review_status="approved_for_directory",
        review_notes="Auto-approved for basic directory listing only. Clinic details still require confirmation before advertising.",
        categories=categories or ["Clinic Guide"],
    )


def supabase_request(
    base_url: str,
    service_key: str,
    method: str,
    path: str,
    payload: Any | None = None,
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
        raise SystemExit(f"Supabase request failed: {method} {path}\n{exc.code} {detail}") from exc


def chunked(items: list[dict[str, Any]], size: int):
    for idx in range(0, len(items), size):
        yield items[idx : idx + size]


def load_rows(
    path: Path,
) -> tuple[list[dict[str, Any]], list[dict[str, Any]], dict[str, dict[str, list[str]]], dict[str, int]]:
    raw_rows: list[dict[str, Any]] = []
    clinic_rows: list[dict[str, Any]] = []
    clinic_meta: dict[str, dict[str, list[str]]] = {}
    stats = {"total": 0, "approved": 0, "manual": 0, "rejected": 0}

    with path.open(encoding="utf-8-sig", newline="") as file:
        for row in csv.DictReader(file):
            stats["total"] += 1
            review = review_row(row)
            if review.review_status == "approved_for_directory":
                stats["approved"] += 1
            elif review.review_status == "reject":
                stats["rejected"] += 1
            else:
                stats["manual"] += 1

            source_place_id = row["id"].strip()
            raw_rows.append(
                {
                    "source": "kakao_local",
                    "source_place_id": source_place_id,
                    "place_name": row["place_name"].strip(),
                    "category_name": row["category_name"].strip(),
                    "phone": row["phone"].strip() or None,
                    "address_name": row["address_name"].strip() or None,
                    "road_address_name": row["road_address_name"].strip() or None,
                    "longitude": float(row["x"]) if row["x"].strip() else None,
                    "latitude": float(row["y"]) if row["y"].strip() else None,
                    "place_url": row["place_url"].strip() or None,
                    "query": row["query"].strip() or None,
                    "district": row["district"].strip() or None,
                    "clinic_type": review.clinic_type,
                    "review_status": review.review_status,
                    "review_notes": review.review_notes,
                }
            )

            if review.review_status == "approved_for_directory":
                slug = slugify(row["place_name"], f"clinic-{source_place_id}")
                profile_status = "published" if os.environ.get("PUBLISH_APPROVED_CLINICS") == "true" else "draft"
                clinic_rows.append(
                    {
                        "slug": f"{slug}-{source_place_id}",
                        "display_name": row["place_name"].strip(),
                        "legal_name": row["place_name"].strip(),
                        "description": "Basic clinic directory draft imported from Kakao Local API. Details require clinic confirmation before advertising.",
                        "location_label": row["district"].strip() or "Seoul",
                        "district": row["district"].strip() or None,
                        "address_name": row["address_name"].strip() or None,
                        "road_address_name": row["road_address_name"].strip() or None,
                        "longitude": float(row["x"]) if row["x"].strip() else None,
                        "latitude": float(row["y"]) if row["y"].strip() else None,
                        "phone": row["phone"].strip() or None,
                        "kakao_place_url": row["place_url"].strip() or None,
                        "source": "kakao_local",
                        "source_place_id": source_place_id,
                        "clinic_type": review.clinic_type,
                        "profile_status": profile_status,
                        "review_status": "directory_approved",
                        "sponsored_status": "none",
                        "price_range_label": "Price confirmed after clinic inquiry",
                        "foreigner_support": "Language support has not been confirmed by the clinic yet.",
                        "before_visit_notes": "Bring your passport, confirm your appointment time, and prepare allergy or medication information.",
                        "aftercare_notes": "Follow clinic instructions and contact the clinic if symptoms feel unusual.",
                    }
                )
                clinic_meta[source_place_id] = {
                    "categories": review.categories,
                    "before": [
                        "Confirm the clinic name, location, and appointment time before visiting.",
                        "Bring your passport and any medication or allergy information.",
                        "Ask whether interpretation support is available before arrival.",
                    ],
                    "during": [
                        "Ask the clinic to explain consent forms before signing.",
                        "Confirm total expected cost before treatment starts.",
                    ],
                    "after": [
                        "Follow the clinic's aftercare instructions.",
                        "Save the clinic contact channel before leaving Korea.",
                    ],
                }

    return raw_rows, clinic_rows, clinic_meta, stats


def fetch_clinic_ids(base_url: str, service_key: str) -> dict[str, int]:
    rows = supabase_request(
        base_url,
        service_key,
        "GET",
        "clinics?select=id,source_place_id&source=eq.kakao_local&source_place_id=not.is.null",
    )
    return {str(row["source_place_id"]): int(row["id"]) for row in rows or []}


def main() -> None:
    csv_path = Path(os.environ.get("CLINIC_CSV_PATH", DEFAULT_CSV_PATH))
    if not csv_path.exists():
        raise SystemExit(f"CSV not found: {csv_path}")

    raw_rows, clinic_rows, clinic_meta, stats = load_rows(csv_path)

    print(f"Loaded {stats['total']} rows from {csv_path}")
    print(f"Review: {stats['approved']} approved, {stats['manual']} manual, {stats['rejected']} rejected")

    if os.environ.get("DRY_RUN") == "true":
        print("DRY_RUN=true, skipping Supabase writes")
        return

    base_url = env("SUPABASE_URL")
    service_key = env("SUPABASE_SERVICE_ROLE_KEY")

    for batch in chunked(raw_rows, BATCH_SIZE):
        supabase_request(
            base_url,
            service_key,
            "POST",
            "raw_clinic_places?on_conflict=source,source_place_id",
            batch,
            prefer="resolution=merge-duplicates",
        )
        time.sleep(0.2)
    print(f"Upserted {len(raw_rows)} raw_clinic_places")

    for batch in chunked(clinic_rows, BATCH_SIZE):
        supabase_request(
            base_url,
            service_key,
            "POST",
            "clinics?on_conflict=slug",
            batch,
            prefer="resolution=merge-duplicates",
        )
        time.sleep(0.2)
    print(f"Upserted {len(clinic_rows)} clinics")

    clinic_ids = fetch_clinic_ids(base_url, service_key)
    category_rows: list[dict[str, Any]] = []
    checklist_rows: list[dict[str, Any]] = []
    for source_place_id, meta in clinic_meta.items():
        clinic_id = clinic_ids.get(source_place_id)
        if not clinic_id:
            continue
        for category in meta["categories"]:
            category_rows.append({"clinic_id": clinic_id, "category": category})
        order = 0
        for stage in ("before", "during", "after"):
            for label in meta[stage]:
                order += 1
                checklist_rows.append(
                    {
                        "clinic_id": clinic_id,
                        "stage": stage,
                        "label": label,
                        "sort_order": order,
                    }
                )

    for batch in chunked(category_rows, BATCH_SIZE):
        supabase_request(
            base_url,
            service_key,
            "POST",
            "clinic_categories?on_conflict=clinic_id,category",
            batch,
            prefer="resolution=merge-duplicates",
        )
        time.sleep(0.2)
    print(f"Upserted {len(category_rows)} clinic_categories")

    for batch in chunked(checklist_rows, BATCH_SIZE):
        supabase_request(
            base_url,
            service_key,
            "POST",
            "clinic_checklist_items?on_conflict=clinic_id,stage,label",
            batch,
            prefer="resolution=merge-duplicates",
        )
        time.sleep(0.2)
    print(f"Upserted {len(checklist_rows)} clinic_checklist_items")

    print("Done. Approved clinics are draft by default unless PUBLISH_APPROVED_CLINICS=true.")


if __name__ == "__main__":
    main()
