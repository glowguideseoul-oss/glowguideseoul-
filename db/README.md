# K-Clinic Concierge DB

Local-first database setup for clinic discovery, manual review, sponsored profiles, and inquiries.

## Why this structure

Do not put API-scraped places directly into the public app.

Use two layers:

1. `raw_clinic_places`: raw candidates from Kakao/HIRA/etc.
2. `clinics`: reviewed clinic profiles that can be shown in the product.

This keeps the app from accidentally presenting scraped data as verified medical advertising.

## Initialize

```bash
python3 scripts/init_clinic_db.py
```

Creates:

```text
data/kclinic.db
```

## Import Kakao data

First collect Kakao data:

```bash
KAKAO_REST_API_KEY=... python3 scripts/fetch_seoul_clinics_kakao.py
```

Then import:

```bash
python3 scripts/init_clinic_db.py --import-kakao data/seoul-clinics-kakao.csv
```

## Main tables

- `raw_clinic_places`: API discovery results
- `clinics`: reviewed public clinic profiles
- `clinic_languages`: listed language support
- `clinic_categories`: treatment/category tags
- `sponsored_listings`: advertising/listing products
- `appointment_requests`: patient request forms
- `clinic_listing_inquiries`: clinic ad inquiries

## Review statuses

Suggested `raw_clinic_places.review_status` values:

- `pending`
- `approved_for_profile`
- `duplicate`
- `not_relevant`
- `needs_manual_check`

Suggested `clinics.profile_status` values:

- `draft`
- `published`
- `hidden`

Suggested `clinics.review_status` values:

- `demo`
- `needs_review`
- `verified_by_clinic`
- `rejected`

