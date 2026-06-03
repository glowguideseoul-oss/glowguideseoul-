-- Seoul Glow Guide — Supabase initial migration
-- Captures consultation requests and clinic listing inquiries from UI forms.

-- ─── Consultation requests (both find-flow and clinic-inquiry flow) ────────

CREATE TABLE IF NOT EXISTS appointment_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_type    TEXT NOT NULL CHECK (inquiry_type IN ('find', 'clinic-inquiry')),

  -- Clinic (clinic-inquiry flow)
  clinic_name     TEXT,                         -- resolved name (dropdown or free text)

  -- What they want
  treatment_interest  TEXT,                     -- concern chip label
  area                TEXT,                     -- Seoul area (find flow)
  what_matters_most   TEXT,                     -- support type (find flow)
  budget_range        TEXT,

  -- Visit schedule
  arrival_date    DATE,
  departure_date  DATE,

  -- Contact
  preferred_language  TEXT,
  messenger_type      TEXT NOT NULL,            -- KakaoTalk | LINE | WhatsApp
  messenger_id        TEXT NOT NULL,

  -- Free text
  notes           TEXT,

  status          TEXT NOT NULL DEFAULT 'new',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Only allow anonymous inserts; reads are restricted to service role
ALTER TABLE appointment_requests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert" ON appointment_requests
  FOR INSERT TO anon WITH CHECK (true);


-- ─── Clinic listing inquiries (for-clinics B2B form) ──────────────────────

CREATE TABLE IF NOT EXISTS clinic_listing_inquiries (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name           TEXT NOT NULL,
  contact_person        TEXT,
  email                 TEXT NOT NULL,
  location_label        TEXT,
  supported_languages   TEXT,                  -- comma-separated
  monthly_budget_range  TEXT,
  message               TEXT,
  status                TEXT NOT NULL DEFAULT 'new',
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE clinic_listing_inquiries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon insert" ON clinic_listing_inquiries
  FOR INSERT TO anon WITH CHECK (true);
