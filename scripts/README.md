# Data Collection Scripts

## Seoul clinic places from Kakao Local API

Use the official Kakao Local REST API instead of scraping map HTML.

```bash
KAKAO_REST_API_KEY=your_rest_api_key python3 scripts/fetch_seoul_clinics_kakao.py
```

Outputs:

- `data/seoul-clinics-kakao.json`
- `data/seoul-clinics-kakao.csv`

The script searches every Seoul district with keywords such as:

- `성형외과`
- `피부과`
- `의원 성형`
- `의원 피부`
- `미용의원`

Fields:

- place name
- category
- phone
- address
- road address
- longitude / latitude
- Kakao place URL
- query and district used for discovery

## Data use notes

- Treat this as discovery data, not verified advertising data.
- Do not show it as a ranking or medical recommendation.
- Review clinics manually before exposing them in the app.
- For sponsored clinic pages, ask clinics to confirm supported languages, price ranges, and aftercare support.

## Import clinic candidates into Supabase

Run `supabase/migrations/002_clinic_directory.sql` in Supabase first.

Then add server-only credentials to `.env.local`:

```bash
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

Import all Kakao candidates and auto-promote safe directory drafts:

```bash
set -a
source .env.local
set +a
python3 scripts/import_clinics_to_supabase.py
```

Preview the automated review without writing to Supabase:

```bash
DRY_RUN=true python3 scripts/import_clinics_to_supabase.py
```

By default, promoted clinics stay as `profile_status = draft`.
To publish auto-approved directory entries immediately:

```bash
PUBLISH_APPROVED_CLINICS=true python3 scripts/import_clinics_to_supabase.py
```

The automated review is only a first-pass data quality filter:

- `approved_for_directory`: dermatology/plastic surgery candidate with Seoul address, phone, road address, and coordinates.
- `needs_manual_review`: plausible clinic but missing key data or ambiguous category.
- `reject`: obvious non-clinic result such as parking, restaurant, beauty salon, association, or building.
