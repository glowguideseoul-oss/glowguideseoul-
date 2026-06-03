-- K-Clinic Concierge local database schema.
-- Designed for SQLite first, with a clean path to Supabase/Postgres later.

PRAGMA foreign_keys = ON;

CREATE TABLE IF NOT EXISTS import_runs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_file TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  row_count INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS raw_clinic_places (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  source TEXT NOT NULL,
  source_place_id TEXT,
  place_name TEXT NOT NULL,
  category_name TEXT,
  phone TEXT,
  address_name TEXT,
  road_address_name TEXT,
  longitude REAL,
  latitude REAL,
  place_url TEXT,
  query TEXT,
  district TEXT,
  import_run_id INTEGER REFERENCES import_runs(id),
  review_status TEXT NOT NULL DEFAULT 'pending',
  review_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(source, source_place_id)
);

CREATE INDEX IF NOT EXISTS idx_raw_clinic_places_review_status
  ON raw_clinic_places(review_status);

CREATE INDEX IF NOT EXISTS idx_raw_clinic_places_district
  ON raw_clinic_places(district);

CREATE TABLE IF NOT EXISTS clinics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  legal_name TEXT,
  description TEXT,
  location_label TEXT,
  district TEXT,
  address_name TEXT,
  road_address_name TEXT,
  longitude REAL,
  latitude REAL,
  phone TEXT,
  website_url TEXT,
  kakao_place_url TEXT,
  source_raw_place_id INTEGER REFERENCES raw_clinic_places(id),
  profile_status TEXT NOT NULL DEFAULT 'draft',
  review_status TEXT NOT NULL DEFAULT 'needs_review',
  sponsored_status TEXT NOT NULL DEFAULT 'none',
  price_range_label TEXT,
  foreigner_support TEXT,
  before_visit_notes TEXT,
  aftercare_notes TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_clinics_profile_status
  ON clinics(profile_status);

CREATE INDEX IF NOT EXISTS idx_clinics_sponsored_status
  ON clinics(sponsored_status);

CREATE TABLE IF NOT EXISTS clinic_languages (
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  language_code TEXT NOT NULL,
  language_label TEXT NOT NULL,
  support_level TEXT NOT NULL DEFAULT 'unknown',
  PRIMARY KEY (clinic_id, language_code)
);

CREATE TABLE IF NOT EXISTS clinic_categories (
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  PRIMARY KEY (clinic_id, category)
);

CREATE TABLE IF NOT EXISTS clinic_checklist_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  stage TEXT NOT NULL,
  label TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sponsored_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  listing_type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  starts_at TEXT,
  ends_at TEXT,
  monthly_budget_krw INTEGER,
  compliance_status TEXT NOT NULL DEFAULT 'needs_review',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS appointment_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_id INTEGER REFERENCES clinics(id) ON DELETE SET NULL,
  patient_name TEXT NOT NULL,
  country TEXT,
  email TEXT,
  preferred_language TEXT,
  treatment_interest TEXT,
  visit_window TEXT,
  budget_range TEXT,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_appointment_requests_status
  ON appointment_requests(status);

CREATE TABLE IF NOT EXISTS clinic_listing_inquiries (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  clinic_name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT NOT NULL,
  location_label TEXT,
  supported_languages TEXT,
  treatment_categories TEXT,
  monthly_budget_range TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

