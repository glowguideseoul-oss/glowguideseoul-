#!/usr/bin/env python3
"""
Initialize the local K-Clinic SQLite database.

Usage:
  python3 scripts/init_clinic_db.py
  python3 scripts/init_clinic_db.py --import-kakao data/seoul-clinics-kakao.csv

Outputs:
  data/kclinic.db
"""

from __future__ import annotations

import argparse
import csv
import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "kclinic.db"
SCHEMA_PATH = ROOT / "db" / "schema.sql"


DEMO_CLINICS = [
    {
        "slug": "seoul-skin-studio",
        "display_name": "Seoul Skin Studio",
        "description": "Foreigner-friendly dermatology clinic with multilingual consultation support.",
        "location_label": "Gangnam, Seoul",
        "district": "강남구",
        "price_range_label": "From $180",
        "foreigner_support": "English consultation · Translated consent forms · Aftercare guide in English",
        "before_visit_notes": "Avoid sun exposure 3 days before. Bring your passport and medication list.",
        "aftercare_notes": "Avoid makeup for 24 hours. Use SPF50+ sunscreen daily. Follow clinic instructions.",
        "languages": [("EN", "English"), ("JP", "Japanese"), ("ZH", "Chinese")],
        "categories": ["Skin Boosters", "Laser", "Hydrafacial"],
        "sponsored_status": "sponsored",
        "profile_status": "published",
    },
    {
        "slug": "apgujeong-aesthetic-clinic",
        "display_name": "Apgujeong Aesthetic Clinic",
        "description": "Aesthetic clinic with consultation preparation support for international patients.",
        "location_label": "Apgujeong, Seoul",
        "district": "강남구",
        "price_range_label": "From $250",
        "foreigner_support": "Chinese and English-speaking coordinator · Travel-friendly visit guidance",
        "before_visit_notes": "Avoid alcohol 48 hours before. Bring reference notes and allergy history.",
        "aftercare_notes": "Avoid strenuous exercise after visit. Contact the clinic if symptoms feel unusual.",
        "languages": [("EN", "English"), ("ZH", "Chinese"), ("TH", "Thai")],
        "categories": ["Botox", "Filler", "Lifting"],
        "sponsored_status": "sponsored",
        "profile_status": "published",
    },
    {
        "slug": "myeongdong-dental-care",
        "display_name": "Myeongdong Dental Care",
        "description": "Central Seoul dental clinic offering travel-friendly cosmetic dental visits.",
        "location_label": "Myeongdong, Seoul",
        "district": "중구",
        "price_range_label": "From $120",
        "foreigner_support": "English-speaking staff · Flexible booking for tourists",
        "before_visit_notes": "Bring prior X-ray records if available. Confirm payment and receipt needs.",
        "aftercare_notes": "Avoid staining foods after whitening. Follow clinic-specific instructions.",
        "languages": [("EN", "English"), ("JP", "Japanese")],
        "categories": ["Whitening", "Veneers", "Cleaning"],
        "sponsored_status": "none",
        "profile_status": "published",
    },
]


def connect() -> sqlite3.Connection:
    DB_PATH.parent.mkdir(exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def apply_schema(conn: sqlite3.Connection) -> None:
    conn.executescript(SCHEMA_PATH.read_text(encoding="utf-8"))
    conn.commit()


def seed_demo_clinics(conn: sqlite3.Connection) -> None:
    for clinic in DEMO_CLINICS:
        conn.execute(
            """
            INSERT INTO clinics (
              slug, display_name, description, location_label, district,
              price_range_label, foreigner_support, before_visit_notes,
              aftercare_notes, sponsored_status, profile_status, review_status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'demo')
            ON CONFLICT(slug) DO UPDATE SET
              display_name=excluded.display_name,
              description=excluded.description,
              location_label=excluded.location_label,
              district=excluded.district,
              price_range_label=excluded.price_range_label,
              foreigner_support=excluded.foreigner_support,
              before_visit_notes=excluded.before_visit_notes,
              aftercare_notes=excluded.aftercare_notes,
              sponsored_status=excluded.sponsored_status,
              profile_status=excluded.profile_status,
              updated_at=CURRENT_TIMESTAMP
            """,
            (
                clinic["slug"],
                clinic["display_name"],
                clinic["description"],
                clinic["location_label"],
                clinic["district"],
                clinic["price_range_label"],
                clinic["foreigner_support"],
                clinic["before_visit_notes"],
                clinic["aftercare_notes"],
                clinic["sponsored_status"],
                clinic["profile_status"],
            ),
        )

        clinic_id = conn.execute(
            "SELECT id FROM clinics WHERE slug = ?",
            (clinic["slug"],),
        ).fetchone()["id"]

        conn.execute("DELETE FROM clinic_languages WHERE clinic_id = ?", (clinic_id,))
        conn.execute("DELETE FROM clinic_categories WHERE clinic_id = ?", (clinic_id,))

        conn.executemany(
            "INSERT INTO clinic_languages (clinic_id, language_code, language_label, support_level) VALUES (?, ?, ?, 'listed')",
            [(clinic_id, code, label) for code, label in clinic["languages"]],
        )
        conn.executemany(
            "INSERT INTO clinic_categories (clinic_id, category) VALUES (?, ?)",
            [(clinic_id, category) for category in clinic["categories"]],
        )

    conn.commit()


def maybe_float(value: str | None) -> float | None:
    if not value:
        return None
    try:
        return float(value)
    except ValueError:
        return None


def import_kakao_csv(conn: sqlite3.Connection, csv_path: Path) -> int:
    run = conn.execute(
        "INSERT INTO import_runs (source, source_file, status) VALUES ('kakao_local', ?, 'running')",
        (str(csv_path),),
    )
    import_run_id = run.lastrowid

    count = 0
    with csv_path.open("r", encoding="utf-8-sig", newline="") as fp:
        reader = csv.DictReader(fp)
        for row in reader:
            conn.execute(
                """
                INSERT INTO raw_clinic_places (
                  source, source_place_id, place_name, category_name, phone,
                  address_name, road_address_name, longitude, latitude,
                  place_url, query, district, import_run_id
                )
                VALUES ('kakao_local', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(source, source_place_id) DO UPDATE SET
                  place_name=excluded.place_name,
                  category_name=excluded.category_name,
                  phone=excluded.phone,
                  address_name=excluded.address_name,
                  road_address_name=excluded.road_address_name,
                  longitude=excluded.longitude,
                  latitude=excluded.latitude,
                  place_url=excluded.place_url,
                  query=excluded.query,
                  district=excluded.district,
                  import_run_id=excluded.import_run_id,
                  updated_at=CURRENT_TIMESTAMP
                """,
                (
                    row.get("id"),
                    row.get("place_name"),
                    row.get("category_name"),
                    row.get("phone"),
                    row.get("address_name"),
                    row.get("road_address_name"),
                    maybe_float(row.get("x")),
                    maybe_float(row.get("y")),
                    row.get("place_url"),
                    row.get("query"),
                    row.get("district"),
                    import_run_id,
                ),
            )
            count += 1

    conn.execute(
        "UPDATE import_runs SET status = 'completed', row_count = ? WHERE id = ?",
        (count, import_run_id),
    )
    conn.commit()
    return count


def print_summary(conn: sqlite3.Connection) -> None:
    rows = conn.execute(
        """
        SELECT 'clinics' AS name, COUNT(*) AS count FROM clinics
        UNION ALL
        SELECT 'raw_clinic_places', COUNT(*) FROM raw_clinic_places
        UNION ALL
        SELECT 'appointment_requests', COUNT(*) FROM appointment_requests
        UNION ALL
        SELECT 'clinic_listing_inquiries', COUNT(*) FROM clinic_listing_inquiries
        """
    ).fetchall()

    print(f"Database: {DB_PATH}")
    for row in rows:
        print(f"- {row['name']}: {row['count']}")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser()
    parser.add_argument("--import-kakao", type=Path, help="Import Kakao CSV output into raw_clinic_places.")
    parser.add_argument("--no-seed", action="store_true", help="Skip demo clinic seed data.")
    return parser.parse_args()


def main() -> int:
    args = parse_args()
    conn = connect()
    apply_schema(conn)

    if not args.no_seed:
        seed_demo_clinics(conn)

    if args.import_kakao:
        imported = import_kakao_csv(conn, args.import_kakao)
        print(f"Imported {imported} Kakao rows")

    print_summary(conn)
    conn.close()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

