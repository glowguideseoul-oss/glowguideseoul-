-- Seoul Glow Guide — clinic directory tables
-- Raw places are imported first, then safe candidates are promoted into clinics.

CREATE TABLE IF NOT EXISTS raw_clinic_places (
  id                    BIGSERIAL PRIMARY KEY,
  source                TEXT NOT NULL DEFAULT 'kakao_local',
  source_place_id       TEXT NOT NULL,
  place_name            TEXT NOT NULL,
  category_name         TEXT,
  phone                 TEXT,
  address_name          TEXT,
  road_address_name     TEXT,
  longitude             DOUBLE PRECISION,
  latitude              DOUBLE PRECISION,
  place_url             TEXT,
  query                 TEXT,
  district              TEXT,
  clinic_type           TEXT NOT NULL DEFAULT 'other',
  review_status         TEXT NOT NULL DEFAULT 'needs_manual_review'
    CHECK (review_status IN ('approved_for_directory', 'needs_manual_review', 'reject')),
  review_notes          TEXT,
  imported_at           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (source, source_place_id)
);

CREATE INDEX IF NOT EXISTS raw_clinic_places_review_status_idx
  ON raw_clinic_places(review_status);

CREATE INDEX IF NOT EXISTS raw_clinic_places_district_idx
  ON raw_clinic_places(district);

CREATE INDEX IF NOT EXISTS raw_clinic_places_clinic_type_idx
  ON raw_clinic_places(clinic_type);

CREATE TABLE IF NOT EXISTS clinics (
  id                    BIGSERIAL PRIMARY KEY,
  slug                  TEXT NOT NULL UNIQUE,
  display_name          TEXT NOT NULL,
  legal_name            TEXT,
  description           TEXT,
  location_label        TEXT,
  district              TEXT,
  address_name          TEXT,
  road_address_name     TEXT,
  longitude             DOUBLE PRECISION,
  latitude              DOUBLE PRECISION,
  phone                 TEXT,
  website_url           TEXT,
  kakao_place_url       TEXT,
  source                TEXT NOT NULL DEFAULT 'kakao_local',
  source_place_id       TEXT,
  clinic_type           TEXT NOT NULL DEFAULT 'other',
  profile_status        TEXT NOT NULL DEFAULT 'draft'
    CHECK (profile_status IN ('draft', 'published', 'archived')),
  review_status         TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (review_status IN ('needs_review', 'directory_approved', 'clinic_confirmed', 'rejected')),
  sponsored_status      TEXT NOT NULL DEFAULT 'none'
    CHECK (sponsored_status IN ('none', 'prospect', 'active', 'paused')),
  price_range_label     TEXT,
  foreigner_support     TEXT,
  before_visit_notes    TEXT,
  aftercare_notes       TEXT,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS clinics_source_place_unique_idx
  ON clinics(source, source_place_id)
  WHERE source_place_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS clinics_profile_status_idx
  ON clinics(profile_status);

CREATE INDEX IF NOT EXISTS clinics_review_status_idx
  ON clinics(review_status);

CREATE INDEX IF NOT EXISTS clinics_district_idx
  ON clinics(district);

CREATE TABLE IF NOT EXISTS clinic_languages (
  clinic_id             BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  language_code         TEXT NOT NULL,
  language_label        TEXT NOT NULL,
  support_level         TEXT NOT NULL DEFAULT 'unknown',
  PRIMARY KEY (clinic_id, language_code)
);

CREATE TABLE IF NOT EXISTS clinic_categories (
  clinic_id             BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  category              TEXT NOT NULL,
  PRIMARY KEY (clinic_id, category)
);

CREATE TABLE IF NOT EXISTS clinic_checklist_items (
  id                    BIGSERIAL PRIMARY KEY,
  clinic_id             BIGINT NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  stage                 TEXT NOT NULL CHECK (stage IN ('before', 'during', 'after')),
  label                 TEXT NOT NULL,
  sort_order            INTEGER NOT NULL DEFAULT 0
);

CREATE UNIQUE INDEX IF NOT EXISTS clinic_checklist_items_unique_idx
  ON clinic_checklist_items(clinic_id, stage, label);

ALTER TABLE raw_clinic_places ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinics ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE clinic_checklist_items ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "published clinics are readable" ON clinics;
CREATE POLICY "published clinics are readable" ON clinics
  FOR SELECT TO anon
  USING (profile_status = 'published' AND review_status IN ('directory_approved', 'clinic_confirmed'));

DROP POLICY IF EXISTS "published clinic languages are readable" ON clinic_languages;
CREATE POLICY "published clinic languages are readable" ON clinic_languages
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM clinics
      WHERE clinics.id = clinic_languages.clinic_id
        AND clinics.profile_status = 'published'
        AND clinics.review_status IN ('directory_approved', 'clinic_confirmed')
    )
  );

DROP POLICY IF EXISTS "published clinic categories are readable" ON clinic_categories;
CREATE POLICY "published clinic categories are readable" ON clinic_categories
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM clinics
      WHERE clinics.id = clinic_categories.clinic_id
        AND clinics.profile_status = 'published'
        AND clinics.review_status IN ('directory_approved', 'clinic_confirmed')
    )
  );

DROP POLICY IF EXISTS "published clinic checklist items are readable" ON clinic_checklist_items;
CREATE POLICY "published clinic checklist items are readable" ON clinic_checklist_items
  FOR SELECT TO anon
  USING (
    EXISTS (
      SELECT 1 FROM clinics
      WHERE clinics.id = clinic_checklist_items.clinic_id
        AND clinics.profile_status = 'published'
        AND clinics.review_status IN ('directory_approved', 'clinic_confirmed')
    )
  );
