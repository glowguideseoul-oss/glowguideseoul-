#!/usr/bin/env python3
"""
Promote one raw Kakao place into a draft clinic profile.

Usage:
  python3 scripts/promote_raw_place.py RAW_PLACE_ID --slug clinic-slug --display-name "Clinic Name"
"""

from __future__ import annotations

import argparse
import re
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "kclinic.db"


def slugify(value: str) -> str:
    value = value.lower().strip()
    value = re.sub(r"[^a-z0-9]+", "-", value)
    return value.strip("-") or "clinic"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("raw_place_id", type=int)
    parser.add_argument("--slug")
    parser.add_argument("--display-name")
    parser.add_argument("--sponsored", action="store_true")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    raw = conn.execute(
        "select * from raw_clinic_places where id = ?",
        (args.raw_place_id,),
    ).fetchone()
    if not raw:
        raise SystemExit(f"raw_clinic_places.id not found: {args.raw_place_id}")

    display_name = args.display_name or raw["place_name"]
    slug = args.slug or slugify(display_name)
    sponsored_status = "sponsored" if args.sponsored else "none"

    conn.execute(
        """
        INSERT INTO clinics (
          slug, display_name, legal_name, description, location_label, district,
          address_name, road_address_name, longitude, latitude, phone,
          kakao_place_url, source_raw_place_id, profile_status, review_status,
          sponsored_status, foreigner_support
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'draft', 'needs_review', ?, ?)
        ON CONFLICT(slug) DO UPDATE SET
          display_name=excluded.display_name,
          legal_name=excluded.legal_name,
          location_label=excluded.location_label,
          district=excluded.district,
          address_name=excluded.address_name,
          road_address_name=excluded.road_address_name,
          longitude=excluded.longitude,
          latitude=excluded.latitude,
          phone=excluded.phone,
          kakao_place_url=excluded.kakao_place_url,
          source_raw_place_id=excluded.source_raw_place_id,
          sponsored_status=excluded.sponsored_status,
          updated_at=CURRENT_TIMESTAMP
        """,
        (
            slug,
            display_name,
            raw["place_name"],
            "Clinic profile draft created from Kakao Local API candidate. Needs manual review before publishing.",
            raw["district"] or "Seoul",
            raw["district"],
            raw["address_name"],
            raw["road_address_name"],
            raw["longitude"],
            raw["latitude"],
            raw["phone"],
            raw["place_url"],
            raw["id"],
            sponsored_status,
            "Language support not yet verified",
        ),
    )
    conn.execute(
        "update raw_clinic_places set review_status = 'approved_for_profile', updated_at = CURRENT_TIMESTAMP where id = ?",
        (args.raw_place_id,),
    )
    conn.commit()

    clinic = conn.execute(
        "select id, slug, display_name, profile_status, review_status from clinics where slug = ?",
        (slug,),
    ).fetchone()
    print(dict(clinic))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

