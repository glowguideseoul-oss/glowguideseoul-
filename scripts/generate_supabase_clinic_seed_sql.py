#!/usr/bin/env python3
"""
Generate a Supabase SQL seed file from the Kakao clinic CSV.

Use this when you do not want to use a service_role key. The output SQL can be
run directly in Supabase SQL Editor after 002_clinic_directory.sql.
"""

from __future__ import annotations

import sys
from pathlib import Path

from import_clinics_to_supabase import DEFAULT_CSV_PATH, load_rows


PROJECT_ROOT = Path(__file__).resolve().parents[1]
OUTPUT_PATH = PROJECT_ROOT / "data" / "supabase-clinic-seed.sql"


def sql_string(value):
    if value is None:
        return "NULL"
    return "'" + str(value).replace("'", "''") + "'"


def sql_number(value):
    if value is None:
        return "NULL"
    return str(value)


def raw_values(row: dict) -> str:
    return "(" + ", ".join(
        [
            sql_string(row["source"]),
            sql_string(row["source_place_id"]),
            sql_string(row["place_name"]),
            sql_string(row["category_name"]),
            sql_string(row["phone"]),
            sql_string(row["address_name"]),
            sql_string(row["road_address_name"]),
            sql_number(row["longitude"]),
            sql_number(row["latitude"]),
            sql_string(row["place_url"]),
            sql_string(row["query"]),
            sql_string(row["district"]),
            sql_string(row["clinic_type"]),
            sql_string(row["review_status"]),
            sql_string(row["review_notes"]),
        ]
    ) + ")"


def clinic_values(row: dict) -> str:
    return "(" + ", ".join(
        [
            sql_string(row["slug"]),
            sql_string(row["display_name"]),
            sql_string(row["legal_name"]),
            sql_string(row["description"]),
            sql_string(row["location_label"]),
            sql_string(row["district"]),
            sql_string(row["address_name"]),
            sql_string(row["road_address_name"]),
            sql_number(row["longitude"]),
            sql_number(row["latitude"]),
            sql_string(row["phone"]),
            sql_string(row["kakao_place_url"]),
            sql_string(row["source"]),
            sql_string(row["source_place_id"]),
            sql_string(row["clinic_type"]),
            sql_string(row["profile_status"]),
            sql_string(row["review_status"]),
            sql_string(row["sponsored_status"]),
            sql_string(row["price_range_label"]),
            sql_string(row["foreigner_support"]),
            sql_string(row["before_visit_notes"]),
            sql_string(row["aftercare_notes"]),
        ]
    ) + ")"


def write_chunks(file, table: str, columns: list[str], rows: list[dict], value_fn, conflict: str, update_cols: list[str], chunk_size: int = 150):
    for start in range(0, len(rows), chunk_size):
        chunk = rows[start:start + chunk_size]
        file.write(f"INSERT INTO {table} ({', '.join(columns)})\nVALUES\n")
        file.write(",\n".join(value_fn(row) for row in chunk))
        file.write(f"\nON CONFLICT {conflict} DO UPDATE SET\n")
        file.write(",\n".join(f"  {col} = EXCLUDED.{col}" for col in update_cols))
        file.write(";\n\n")


def main() -> None:
    csv_path = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_CSV_PATH
    raw_rows, clinic_rows, clinic_meta, stats = load_rows(csv_path)

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with OUTPUT_PATH.open("w", encoding="utf-8") as file:
        file.write("BEGIN;\n\n")

        write_chunks(
            file,
            "raw_clinic_places",
            [
                "source",
                "source_place_id",
                "place_name",
                "category_name",
                "phone",
                "address_name",
                "road_address_name",
                "longitude",
                "latitude",
                "place_url",
                "query",
                "district",
                "clinic_type",
                "review_status",
                "review_notes",
            ],
            raw_rows,
            raw_values,
            "(source, source_place_id)",
            [
                "place_name",
                "category_name",
                "phone",
                "address_name",
                "road_address_name",
                "longitude",
                "latitude",
                "place_url",
                "query",
                "district",
                "clinic_type",
                "review_status",
                "review_notes",
                "updated_at",
            ],
        )

        write_chunks(
            file,
            "clinics",
            [
                "slug",
                "display_name",
                "legal_name",
                "description",
                "location_label",
                "district",
                "address_name",
                "road_address_name",
                "longitude",
                "latitude",
                "phone",
                "kakao_place_url",
                "source",
                "source_place_id",
                "clinic_type",
                "profile_status",
                "review_status",
                "sponsored_status",
                "price_range_label",
                "foreigner_support",
                "before_visit_notes",
                "aftercare_notes",
            ],
            clinic_rows,
            clinic_values,
            "(slug)",
            [
                "display_name",
                "legal_name",
                "description",
                "location_label",
                "district",
                "address_name",
                "road_address_name",
                "longitude",
                "latitude",
                "phone",
                "kakao_place_url",
                "source",
                "source_place_id",
                "clinic_type",
                "profile_status",
                "review_status",
                "sponsored_status",
                "price_range_label",
                "foreigner_support",
                "before_visit_notes",
                "aftercare_notes",
                "updated_at",
            ],
        )

        file.write(
            """
INSERT INTO clinic_categories (clinic_id, category)
SELECT c.id, CASE
  WHEN c.clinic_type = 'plastic_surgery' THEN 'Plastic Surgery'
  WHEN c.clinic_type = 'dermatology' THEN 'Dermatology'
  WHEN c.clinic_type = 'dental' THEN 'Dental'
  ELSE 'Clinic Guide'
END
FROM clinics c
WHERE c.source = 'kakao_local'
ON CONFLICT (clinic_id, category) DO NOTHING;

INSERT INTO clinic_languages (clinic_id, language_code, language_label, support_level)
SELECT c.id, 'EN', 'English', 'unknown'
FROM clinics c
WHERE c.source = 'kakao_local'
ON CONFLICT (clinic_id, language_code) DO NOTHING;

INSERT INTO clinic_checklist_items (clinic_id, stage, label, sort_order)
SELECT c.id, item.stage, item.label, item.sort_order
FROM clinics c
CROSS JOIN (
  VALUES
    ('before', 'Confirm the clinic name, location, and appointment time before visiting.', 1),
    ('before', 'Bring your passport and any medication or allergy information.', 2),
    ('before', 'Ask whether interpretation support is available before arrival.', 3),
    ('during', 'Ask the clinic to explain consent forms before signing.', 4),
    ('during', 'Confirm total expected cost before treatment starts.', 5),
    ('after', 'Follow the clinic''s aftercare instructions.', 6),
    ('after', 'Save the clinic contact channel before leaving Korea.', 7)
) AS item(stage, label, sort_order)
WHERE c.source = 'kakao_local'
ON CONFLICT (clinic_id, stage, label) DO UPDATE SET
  sort_order = EXCLUDED.sort_order;

COMMIT;
"""
        )

    print(f"Wrote {OUTPUT_PATH}")
    print(f"Review: {stats['approved']} approved, {stats['manual']} manual, {stats['rejected']} rejected")
    print(f"Raw rows: {len(raw_rows)}")
    print(f"Clinic rows: {len(clinic_rows)}")


if __name__ == "__main__":
    main()
