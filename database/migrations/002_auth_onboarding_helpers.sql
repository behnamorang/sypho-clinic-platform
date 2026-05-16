-- =============================================================================
-- Sypho.io — Authentication & Onboarding Helpers
-- Migration: 002_auth_onboarding_helpers.sql
-- Description: Adds helper functions and policies to support the Phase 2
--              authentication and clinic onboarding flows.
-- Region: EU (eu-central-1) — PostgreSQL / Supabase
-- Compliance: GDPR (EU) 2016/679
-- Author: Sypho Engineering Team
-- Created: 2026-05-16
-- =============================================================================

-- =============================================================================
-- FUNCTION: is_clinic_owner_or_admin
-- Description: Returns true if the current user is a clinic_owner or clinic_admin
--              for the given clinic_id. Used in complex RLS policies.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.is_clinic_owner_or_admin(p_clinic_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinic_members
    WHERE user_id   = auth.uid()
      AND clinic_id = p_clinic_id
      AND is_active = true
      AND role IN ('clinic_owner', 'clinic_admin')
  );
$$;

GRANT EXECUTE ON FUNCTION public.is_clinic_owner_or_admin(uuid) TO authenticated;

-- =============================================================================
-- FUNCTION: has_completed_onboarding
-- Description: Returns true if the user has at least one active clinic membership.
--              Used for server-side onboarding verification.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.has_completed_onboarding()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.clinic_members
    WHERE user_id  = auth.uid()
      AND is_active = true
  );
$$;

GRANT EXECUTE ON FUNCTION public.has_completed_onboarding() TO authenticated;

-- =============================================================================
-- FUNCTION: get_user_clinics
-- Description: Returns all active clinic memberships for the current user.
--              Supports the multi-clinic use case (e.g., locum doctors).
--              Returns JSON array of { clinic_id, role } objects.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_user_clinics()
RETURNS TABLE (
  clinic_id   uuid,
  clinic_name text,
  role        user_role,
  is_active   boolean
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    cm.clinic_id,
    c.name AS clinic_name,
    cm.role,
    cm.is_active
  FROM public.clinic_members cm
  JOIN public.clinics c ON c.id = cm.clinic_id
  WHERE cm.user_id  = auth.uid()
    AND cm.is_active = true
    AND c.deleted_at IS NULL
  ORDER BY cm.accepted_at DESC;
$$;

GRANT EXECUTE ON FUNCTION public.get_user_clinics() TO authenticated;

-- =============================================================================
-- FUNCTION: log_audit_event
-- Description: Convenience function for inserting audit log entries.
--              Used by application code to ensure consistent audit trail format.
--
-- GDPR Article 5(2): Accountability — all data operations must be auditable.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.log_audit_event(
  p_clinic_id       uuid,
  p_action          audit_action,
  p_resource_type   text,
  p_resource_id     uuid      DEFAULT NULL,
  p_http_method     text      DEFAULT NULL,
  p_api_endpoint    text      DEFAULT NULL,
  p_success         boolean   DEFAULT true,
  p_error_code      text      DEFAULT NULL,
  p_old_values      jsonb     DEFAULT NULL,
  p_new_values      jsonb     DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_audit_id uuid;
BEGIN
  INSERT INTO public.audit_logs (
    clinic_id,
    actor_user_id,
    action,
    resource_type,
    resource_id,
    http_method,
    api_endpoint,
    success,
    error_code,
    old_values,
    new_values
  ) VALUES (
    p_clinic_id,
    auth.uid(),
    p_action,
    p_resource_type,
    p_resource_id,
    p_http_method,
    p_api_endpoint,
    p_success,
    p_error_code,
    p_old_values,
    p_new_values
  ) RETURNING id INTO v_audit_id;

  RETURN v_audit_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.log_audit_event(uuid, audit_action, text, uuid, text, text, boolean, text, jsonb, jsonb)
  TO authenticated;

-- =============================================================================
-- FUNCTION: cleanup_expired_sessions
-- Description: Utility function to identify and log users with inactive sessions.
--              Called by scheduled maintenance jobs (not from application layer).
--
-- GDPR: Session management — ensures expired sessions are tracked.
-- =============================================================================

CREATE OR REPLACE FUNCTION public.get_clinic_member_count(p_clinic_id uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COUNT(*)::integer
  FROM public.clinic_members
  WHERE clinic_id = p_clinic_id
    AND is_active  = true;
$$;

GRANT EXECUTE ON FUNCTION public.get_clinic_member_count(uuid) TO authenticated;

-- =============================================================================
-- INDEX ADDITIONS: Optimize onboarding and session queries
-- =============================================================================

-- Optimize lookups in the auth callback and middleware onboarding checks
CREATE INDEX IF NOT EXISTS idx_clinic_members_user_active_role
  ON public.clinic_members (user_id, role)
  WHERE is_active = true;

-- Optimize clinic name + slug lookups (used during slug uniqueness check at onboarding)
CREATE INDEX IF NOT EXISTS idx_clinics_name
  ON public.clinics (name)
  WHERE deleted_at IS NULL;

-- =============================================================================
-- COMMENTS
-- =============================================================================

COMMENT ON FUNCTION public.is_clinic_owner_or_admin IS
  'Returns true if the authenticated user has owner or admin role in the specified clinic.';

COMMENT ON FUNCTION public.has_completed_onboarding IS
  'Returns true if the authenticated user has at least one active clinic membership.';

COMMENT ON FUNCTION public.get_user_clinics IS
  'Returns all active clinic memberships for the authenticated user. Supports multi-clinic users.';

COMMENT ON FUNCTION public.log_audit_event IS
  'Convenience wrapper for inserting GDPR-compliant audit log entries.';
