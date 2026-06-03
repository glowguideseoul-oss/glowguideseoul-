# Current DB Report

Snapshot date: 2026-06-03

## Summary

Local DB path:

```text
data/kclinic.db
```

Raw Kakao outputs:

```text
data/seoul-clinics-kakao.csv
data/seoul-clinics-kakao.json
```

## Counts

| Table | Count |
|---|---:|
| `clinics` | 3 |
| `raw_clinic_places` | 1,216 |
| `appointment_requests` | 0 |
| `clinic_listing_inquiries` | 0 |

## Raw Places by Type

| Type | Count |
|---|---:|
| dermatology | 844 |
| plastic | 364 |
| other | 8 |

## Top Districts

| District | Count |
|---|---:|
| 중구 | 131 |
| 송파구 | 109 |
| 서초구 | 94 |
| 영등포구 | 93 |
| 중랑구 | 84 |
| 성동구 | 68 |
| 동작구 | 61 |
| 은평구 | 54 |
| 강남구 | 50 |
| 광진구 | 49 |
| 양천구 | 47 |
| 강동구 | 43 |
| 강서구 | 43 |
| 도봉구 | 43 |
| 종로구 | 39 |

## Public Clinic Profiles

| id | slug | display_name | sponsored_status | profile_status |
|---:|---|---|---|---|
| 1 | `seoul-skin-studio` | Seoul Skin Studio | sponsored | published |
| 2 | `apgujeong-aesthetic-clinic` | Apgujeong Aesthetic Clinic | sponsored | published |
| 3 | `myeongdong-dental-care` | Myeongdong Dental Care | none | published |

## Important Interpretation

The 1,216 rows in `raw_clinic_places` are **candidate discovery data**, not verified public clinic listings.

The product should only display rows from `clinics`, after review and profile enrichment.

Recommended flow:

```text
raw_clinic_places
  -> manual review
  -> promote selected rows to clinics
  -> generate app data / show in UI
```

