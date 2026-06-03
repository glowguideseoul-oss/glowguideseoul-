# K-Clinic Concierge DB Handoff

This document explains the current local database, how to inspect it, and how it should be connected to the app.

## Current State

Local DB:

```text
data/kclinic.db
```

Collected Kakao Local API outputs:

```text
data/seoul-clinics-kakao.csv
data/seoul-clinics-kakao.json
```

Current counts:

```text
clinics: 3
raw_clinic_places: 1216
appointment_requests: 0
clinic_listing_inquiries: 0
```

Collected raw candidates:

```text
dermatology: 844
plastic: 364
other: 8
```

Important: `raw_clinic_places` is raw discovery data. It should not be shown directly in the product as verified clinic advertising.

## Data Layers

### 1. raw_clinic_places

Raw place data imported from Kakao Local API.

Use this for:

- candidate discovery
- district filtering
- manual review
- finding potential sponsored clinics

Do not use this directly for:

- public clinic cards
- sponsored profiles
- recommendations
- rankings

### 2. clinics

Reviewed clinic profiles that can be used by the app.

Use this for:

- landing page clinic cards
- clinic detail pages
- sponsored clinic listings
- For Clinics demos

### 3. sponsored_listings

Advertising/listing products tied to reviewed `clinics`.

Use this for:

- Sponsored Clinic Guide
- category sponsorship
- paid profile status

### 4. appointment_requests

Patient-side appointment request form submissions.

### 5. clinic_listing_inquiries

Clinic-side advertising inquiry form submissions.

## How To Initialize

```bash
cd /Users/mingming/Documents/k-clinic-concierge/app
python3 scripts/init_clinic_db.py
```

## How To Fetch Kakao Data

The Kakao REST API key is in `.env.local` for local development.

```bash
cd /Users/mingming/Documents/k-clinic-concierge/app
source .env.local
python3 scripts/fetch_seoul_clinics_kakao.py
```

Then import:

```bash
python3 scripts/init_clinic_db.py --import-kakao data/seoul-clinics-kakao.csv
```

## How To Inspect

Tables:

```bash
sqlite3 data/kclinic.db ".tables"
```

Counts:

```bash
sqlite3 data/kclinic.db "
select 'clinics', count(*) from clinics
union all
select 'raw_clinic_places', count(*) from raw_clinic_places
union all
select 'appointment_requests', count(*) from appointment_requests
union all
select 'clinic_listing_inquiries', count(*) from clinic_listing_inquiries;
"
```

Top districts:

```bash
sqlite3 data/kclinic.db "
select district, count(*) as count
from raw_clinic_places
group by district
order by count desc
limit 20;
"
```

Gangnam/Seocho candidates:

```bash
sqlite3 data/kclinic.db "
select id, place_name, district, category_name, phone, road_address_name
from raw_clinic_places
where district in ('강남구', '서초구')
order by place_name
limit 50;
"
```

## Recommended Product Integration

Do not wire the public app directly to `raw_clinic_places`.

Use this flow:

```text
Kakao API
  -> raw_clinic_places
  -> manual review
  -> clinics
  -> app clinic cards / details
```

For the current MVP, there are two practical options.

### Option A. Generate mock-data.ts from DB

Fastest for demo and filming.

Flow:

```text
SQLite clinics table -> generated src/lib/mock-data.ts
```

Pros:

- no new Node database dependency
- simple deployment
- works with current app architecture

Cons:

- static snapshot
- must regenerate after DB changes

### Option B. Add server-side SQLite reader

More real app structure.

Flow:

```text
Next server component -> SQLite DB -> clinic cards
```

Pros:

- app reads DB directly
- easier admin/review workflow later

Cons:

- requires Node SQLite dependency
- deployment needs DB strategy

Recommended now: **Option A**.

Generate the file:

```bash
python3 scripts/generate_mock_data_from_db.py
```

This writes:

```text
src/lib/mock-data.ts
```

## Review Workflow

1. Import raw Kakao places.
2. Filter by Seoul district and category.
3. Mark candidates:
   - `approved_for_profile`
   - `duplicate`
   - `not_relevant`
   - `needs_manual_check`
4. Promote selected candidates into `clinics`.
5. Add foreigner-facing profile fields:
   - display name
   - English description
   - location label
   - language support
   - price range label
   - before visit notes
   - aftercare notes
6. Only then show the clinic in the app.

## Compliance Notes

Avoid:

- ranking clinics
- saying “best”, “top”, “cheapest”
- showing raw scraped reviews
- treating raw place data as verified advertising
- claiming language support unless confirmed

Use:

- `Clinic information`
- `Sponsored Clinic Guide`
- `Appointment request`
- `Price range`
- `Language support`
- `Aftercare checklist`
