#!/usr/bin/env python3
"""
Fetch Seoul clinic place data with Kakao Local API.

Usage:
  KAKAO_REST_API_KEY=... python3 scripts/fetch_seoul_clinics_kakao.py

Outputs:
  data/seoul-clinics-kakao.json
  data/seoul-clinics-kakao.csv

Notes:
  - This uses Kakao's official Local REST API instead of scraping map pages.
  - Results are raw place/discovery data and should be reviewed before use.
  - Do not present this data as rankings or medical recommendations.
"""

from __future__ import annotations

import csv
import json
import os
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path


API_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"
OUTPUT_DIR = Path("data")
JSON_PATH = OUTPUT_DIR / "seoul-clinics-kakao.json"
CSV_PATH = OUTPUT_DIR / "seoul-clinics-kakao.csv"

SEOUL_DISTRICTS = [
    "강남구",
    "강동구",
    "강북구",
    "강서구",
    "관악구",
    "광진구",
    "구로구",
    "금천구",
    "노원구",
    "도봉구",
    "동대문구",
    "동작구",
    "마포구",
    "서대문구",
    "서초구",
    "성동구",
    "성북구",
    "송파구",
    "양천구",
    "영등포구",
    "용산구",
    "은평구",
    "종로구",
    "중구",
    "중랑구",
]

KEYWORDS = [
    "성형외과",
    "피부과",
    "의원 성형",
    "의원 피부",
    "미용의원",
    "에스테틱 의원",
]

FIELDS = [
    "id",
    "place_name",
    "category_name",
    "phone",
    "address_name",
    "road_address_name",
    "x",
    "y",
    "place_url",
    "query",
    "district",
]


def request_page(api_key: str, query: str, page: int) -> dict:
    params = {
        "query": query,
        "page": str(page),
        "size": "15",
    }
    url = f"{API_URL}?{urllib.parse.urlencode(params)}"
    request = urllib.request.Request(
        url,
        headers={"Authorization": f"KakaoAK {api_key}"},
        method="GET",
    )
    with urllib.request.urlopen(request, timeout=15) as response:
        return json.loads(response.read().decode("utf-8"))


def is_relevant_place(place: dict) -> bool:
    address = f"{place.get('address_name', '')} {place.get('road_address_name', '')}"
    category = place.get("category_name", "")
    name = place.get("place_name", "")

    if "서울" not in address:
        return False

    medical_terms = ("병원", "의원", "성형외과", "피부과")
    beauty_medical_terms = ("성형", "피부", "에스테틱", "리프팅", "미용")

    return any(term in category or term in name for term in medical_terms) and any(
        term in category or term in name for term in beauty_medical_terms
    )


def normalize_place(place: dict, query: str, district: str) -> dict:
    return {
        "id": place.get("id", ""),
        "place_name": place.get("place_name", ""),
        "category_name": place.get("category_name", ""),
        "phone": place.get("phone", ""),
        "address_name": place.get("address_name", ""),
        "road_address_name": place.get("road_address_name", ""),
        "x": place.get("x", ""),
        "y": place.get("y", ""),
        "place_url": place.get("place_url", ""),
        "query": query,
        "district": district,
    }


def collect(api_key: str) -> list[dict]:
    deduped: dict[str, dict] = {}

    for district in SEOUL_DISTRICTS:
        for keyword in KEYWORDS:
            query = f"서울 {district} {keyword}"
            print(f"Fetching: {query}", file=sys.stderr)

            for page in range(1, 46):
                try:
                    payload = request_page(api_key, query, page)
                except Exception as exc:
                    print(f"  failed page={page}: {exc}", file=sys.stderr)
                    break

                documents = payload.get("documents", [])
                if not documents:
                    break

                for place in documents:
                    if not is_relevant_place(place):
                        continue

                    key = place.get("id") or f"{place.get('place_name')}::{place.get('address_name')}"
                    deduped[key] = normalize_place(place, query, district)

                meta = payload.get("meta", {})
                if meta.get("is_end", True):
                    break

                time.sleep(0.16)

            time.sleep(0.24)

    return sorted(deduped.values(), key=lambda item: (item["district"], item["place_name"]))


def write_outputs(rows: list[dict]) -> None:
    OUTPUT_DIR.mkdir(exist_ok=True)
    JSON_PATH.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding="utf-8")

    with CSV_PATH.open("w", newline="", encoding="utf-8-sig") as fp:
        writer = csv.DictWriter(fp, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(rows)


def main() -> int:
    api_key = os.environ.get("KAKAO_REST_API_KEY")
    if not api_key:
        print("Missing KAKAO_REST_API_KEY environment variable.", file=sys.stderr)
        return 1

    rows = collect(api_key)
    write_outputs(rows)
    print(f"Wrote {len(rows)} rows")
    print(f"- {JSON_PATH}")
    print(f"- {CSV_PATH}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
