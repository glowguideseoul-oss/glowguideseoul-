#!/usr/bin/env python3
"""
Export a human-readable DB report for handoff/review.

Usage:
  python3 scripts/export_db_report.py

Output:
  data/db-report.md
"""

from __future__ import annotations

import sqlite3
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DB_PATH = ROOT / "data" / "kclinic.db"
REPORT_PATH = ROOT / "data" / "db-report.md"


def fetch_all(conn: sqlite3.Connection, query: str) -> list[sqlite3.Row]:
    conn.row_factory = sqlite3.Row
    return conn.execute(query).fetchall()


def markdown_table(rows: list[sqlite3.Row]) -> str:
    if not rows:
        return "_No rows._\n"

    headers = rows[0].keys()
    lines = [
        "| " + " | ".join(headers) + " |",
        "| " + " | ".join(["---"] * len(headers)) + " |",
    ]
    for row in rows:
        values = [str(row[key] if row[key] is not None else "") for key in headers]
        lines.append("| " + " | ".join(value.replace("|", " ") for value in values) + " |")
    return "\n".join(lines) + "\n"


def main() -> int:
    if not DB_PATH.exists():
        raise SystemExit(f"Missing DB: {DB_PATH}. Run scripts/init_clinic_db.py first.")

    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row

    counts = fetch_all(
        conn,
        """
        select 'clinics' as table_name, count(*) as count from clinics
        union all select 'raw_clinic_places', count(*) from raw_clinic_places
        union all select 'appointment_requests', count(*) from appointment_requests
        union all select 'clinic_listing_inquiries', count(*) from clinic_listing_inquiries
        """,
    )

    district_counts = fetch_all(
        conn,
        """
        select district, count(*) as count
        from raw_clinic_places
        group by district
        order by count desc
        limit 15
        """,
    )

    type_counts = fetch_all(
        conn,
        """
        select
          case
            when category_name like '%성형외과%' or place_name like '%성형%' then 'plastic'
            when category_name like '%피부과%' or place_name like '%피부%' then 'dermatology'
            else 'other'
          end as type,
          count(*) as count
        from raw_clinic_places
        group by type
        order by count desc
        """,
    )

    gangnam_seocho = fetch_all(
        conn,
        """
        select place_name, district, category_name, phone, road_address_name
        from raw_clinic_places
        where district in ('강남구', '서초구')
        order by place_name
        limit 30
        """,
    )

    published_clinics = fetch_all(
        conn,
        """
        select id, slug, display_name, location_label, sponsored_status, profile_status
        from clinics
        order by id
        """,
    )

    report = "\n".join(
        [
            "# K-Clinic DB Report",
            "",
            f"DB: `{DB_PATH}`",
            "",
            "## Table Counts",
            markdown_table(counts),
            "## Raw Places by Type",
            markdown_table(type_counts),
            "## Top Districts",
            markdown_table(district_counts),
            "## Current Public Clinic Profiles",
            markdown_table(published_clinics),
            "## Sample Gangnam/Seocho Raw Candidates",
            markdown_table(gangnam_seocho),
            "## Recommended Next Step",
            "",
            "Review raw candidates, mark approved rows, then promote only verified candidates into `clinics`.",
            "",
        ]
    )

    REPORT_PATH.write_text(report, encoding="utf-8")
    print(f"Wrote {REPORT_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

