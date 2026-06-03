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

