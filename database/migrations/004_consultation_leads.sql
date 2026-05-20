-- =============================================================================
-- Sypho.io — Consultation Leads (Marketing)
-- Migration: 004_consultation_leads.sql
-- Description: Stores Sypho Med private consultation / book-demo lead captures.
-- Compliance: GDPR Article 6(1)(f) — legitimate interest (B2B sales enquiry).
-- Region: EU (eu-central-1)
-- =============================================================================

-- =============================================================================
-- TABLE: leads
-- Description: Marketing consultation leads from /book-demo (not clinic-tenant scoped).
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.leads (
  id              uuid          PRIMARY KEY DEFAULT uuid_generate_v4(),

  full_name       text          NOT NULL CHECK (char_length(full_name) BETWEEN 2 AND 255),
  email           text          NOT NULL CHECK (email ~* '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  phone           text          NOT NULL CHECK (char_length(phone) BETWEEN 6 AND 32),
  clinic_name     text          NOT NULL CHECK (char_length(clinic_name) BETWEEN 2 AND 255),
  location        text          NOT NULL CHECK (location IN ('oman', 'uk', 'uae', 'other')),
  booking_volume  text          NOT NULL CHECK (booking_volume IN (
                    'under_100', '100_300', '300_600', '600_plus'
                  )),
  pain_points     text[]        NOT NULL DEFAULT '{}',

  created_at      timestamptz   NOT NULL DEFAULT NOW(),
  updated_at      timestamptz   NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.leads IS
  'Sypho Med marketing consultation leads captured via the public book-demo form.';

COMMENT ON COLUMN public.leads.pain_points IS
  'Operational pain point identifiers (e.g. no_shows, whatsapp, crm).';

CREATE INDEX idx_leads_created_at ON public.leads (created_at DESC);
CREATE INDEX idx_leads_email ON public.leads (email);
CREATE INDEX idx_leads_location ON public.leads (location);

CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- =============================================================================
-- ROW LEVEL SECURITY
-- Anon may INSERT only (public lead form). No anon SELECT — prevents data harvest.
-- =============================================================================

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads FORCE ROW LEVEL SECURITY;

CREATE POLICY "leads_insert_public"
  ON public.leads FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Authenticated staff (future Sypho admin dashboard) may read leads
CREATE POLICY "leads_select_authenticated"
  ON public.leads FOR SELECT
  TO authenticated
  USING (true);

GRANT INSERT ON public.leads TO anon;
GRANT INSERT ON public.leads TO authenticated;
GRANT SELECT ON public.leads TO authenticated;
