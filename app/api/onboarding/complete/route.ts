/**
 * @file app/api/onboarding/complete/route.ts
 * @description API endpoint to complete clinic owner onboarding.
 *
 * This is the final step of the onboarding wizard. It:
 * 1. Validates all onboarding form data with Zod.
 * 2. Creates the `clinics` record (with a unique slug).
 * 3. Creates the `clinic_members` record linking the user as 'clinic_owner'.
 * 4. Marks `onboarding_completed: true` in the user's app_metadata via the admin client.
 * 5. Writes an audit log entry.
 *
 * This endpoint is authenticated — unauthenticated requests are rejected.
 *
 * Database writes use the **service role** client after the caller is verified.
 * RLS on `clinics` / `clinic_members` prevents new owners from (a) detecting
 * globally unique slugs and (b) inserting their first membership row; using
 * the admin client here is intentional and scoped to this trusted route only.
 *
 * @compliance
 * - GDPR Article 5(2): Accountability — audit log created on record creation.
 * - GDPR Article 6(1)(b): Processing on basis of contract (service agreement).
 * - Multi-tenancy: Clinic record is created as an isolated tenant.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient }      from '@/lib/supabase/server';
import { createSupabaseAdminClient }       from '@/lib/supabase/server';
import { getAuthenticatedUser, getRequestMetadata } from '@/lib/auth/helpers';
import { onboardingCompleteSchema, generateClinicSlug } from '@/lib/validations/onboarding';
import type { ApiResponse, ClinicInsert, AuditAction, UserRole, Json } from '@/types';

/**
 * POST /api/onboarding/complete
 *
 * Body: OnboardingCompleteValues (JSON)
 * Response: ApiResponse<{ clinic_id: string }>
 */
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ clinic_id: string }>>> {
  // ---------------------------------------------------------------------------
  // 1. Authentication check
  // ---------------------------------------------------------------------------
  const supabase  = await createSupabaseServerClient();
  const authResult = await getAuthenticatedUser(supabase);

  if (!authResult.ok) {
    return NextResponse.json(
      { data: null, error: { code: authResult.code, message: authResult.message } },
      { status: 401 },
    );
  }

  const user = authResult.data;

  // ---------------------------------------------------------------------------
  // 2. Input validation
  // ---------------------------------------------------------------------------
  let rawBody: unknown;
  try {
    rawBody = await request.json();
  } catch {
    return NextResponse.json(
      { data: null, error: { code: 'INVALID_JSON', message: 'Request body must be valid JSON.' } },
      { status: 400 },
    );
  }

  const parseResult = onboardingCompleteSchema.safeParse(rawBody);

  if (!parseResult.success) {
    const firstError  = parseResult.error.errors[0];
    const fieldPath   = firstError?.path.join('.');
    return NextResponse.json(
      {
        data:  null,
        error: {
          code:    'VALIDATION_ERROR',
          message: firstError?.message ?? 'Invalid input.',
          ...(fieldPath !== undefined ? { field: fieldPath } : {}),
          details: parseResult.error.flatten().fieldErrors as unknown,
        },
      },
      { status: 422 },
    );
  }

  const {
    clinic_name,
    clinic_email,
    clinic_phone,
    timezone,
    country_code,
    address_line1,
    address_line2,
    city,
    state_province,
    postal_code,
    subscription_tier,
  } = parseResult.data;

  const admin = createSupabaseAdminClient();

  // ---------------------------------------------------------------------------
  // 3. Generate a unique clinic slug (service role — RLS hides other tenants)
  // ---------------------------------------------------------------------------
  const baseSlug = generateClinicSlug(clinic_name);
  const safeBase = baseSlug.length > 0 ? baseSlug : `clinic-${user.id.slice(0, 8)}`;

  let slug = safeBase;
  for (let attempt = 0; attempt < 16; attempt += 1) {
    const { data: slugHit } = await admin.from('clinics').select('id').eq('slug', slug).maybeSingle();
    if (!slugHit) {
      break;
    }
    slug = `${safeBase}-${Math.random().toString(36).slice(2, 8)}`;
  }

  // ---------------------------------------------------------------------------
  // 4. Create the clinic record (service role — bypasses RLS for trusted onboarding)
  // Type assertions used because Supabase's inference for Insert types
  // under strictest TypeScript settings requires explicit casts.
  // ---------------------------------------------------------------------------
  const clinicInsertPayload: ClinicInsert = {
    name:                    clinic_name,
    slug,
    email:                   clinic_email,
    phone:                   clinic_phone ?? null,
    timezone,
    country_code,
    address_line1,
    address_line2:           address_line2 ?? null,
    city,
    state_province:          state_province ?? null,
    postal_code,
    subscription_tier,
    business_hours:          {} as Json,
    is_active:               true,
    tax_id:                  null,
    registration_number:     null,
    website:                 null,
    dpo_name:                null,
    dpo_email:               null,
    privacy_policy_url:      null,
    terms_url:               null,
    subscription_expires_at: null,
  };

  // @ts-expect-error — Supabase's multi-table Insert type inference resolves to `never[]`
  // under exactOptionalPropertyTypes:true. The payload type is verified above via ClinicInsert.
  const clinicResult = await admin.from('clinics').insert(clinicInsertPayload).select('id').single();

  const clinic      = clinicResult.data as { id: string } | null;
  const clinicError = clinicResult.error;

  if (clinicError || !clinic) {
    console.error('[Onboarding] Failed to create clinic:', clinicError?.message);
    return NextResponse.json(
      {
        data:  null,
        error: {
          code:    'CLINIC_CREATION_FAILED',
          message: 'Failed to create your clinic profile. Please try again.',
        },
      },
      { status: 500 },
    );
  }

  // ---------------------------------------------------------------------------
  // 5. Create the clinic_member record (service role — first row bypasses owner RLS)
  // ---------------------------------------------------------------------------
  const memberInsertPayload = {
    clinic_id:   clinic.id,
    user_id:     user.id,
    role:        'clinic_owner' as UserRole,
    is_active:   true,
    accepted_at: new Date().toISOString(),
  };

  // @ts-expect-error — Same multi-table Insert type inference issue as above.
  const memberResult = await admin.from('clinic_members').insert(memberInsertPayload);

  const memberError = memberResult.error;

  if (memberError) {
    console.error('[Onboarding] Failed to create clinic member:', memberError.message);
    await admin.from('clinics').delete().eq('id', clinic.id);

    return NextResponse.json(
      {
        data:  null,
        error: {
          code:    'MEMBERSHIP_CREATION_FAILED',
          message: 'Failed to link your account to the clinic. Please try again.',
        },
      },
      { status: 500 },
    );
  }

  // ---------------------------------------------------------------------------
  // 6. Mark onboarding as complete in user app_metadata (admin client)
  //    app_metadata can only be written by the service role (server-side only).
  // ---------------------------------------------------------------------------
  const { error: metaError } = await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { onboarding_completed: true },
  });

  if (metaError) {
    // Non-fatal: clinic and membership are created. Middleware will redirect to
    // onboarding on next request until metadata is propagated.
    console.error('[Onboarding] Failed to update user metadata:', metaError.message);
  }

  // ---------------------------------------------------------------------------
  // 7. Write audit log
  // ---------------------------------------------------------------------------
  const { actor_ip, actor_user_agent } = getRequestMetadata(request);

  const auditPayload = {
    clinic_id:        clinic.id,
    actor_user_id:    user.id,
    actor_ip,
    actor_user_agent,
    action:           'INSERT' as AuditAction,
    resource_type:    'clinic',
    resource_id:      clinic.id,
    http_method:      'POST',
    api_endpoint:     '/api/onboarding/complete',
    success:          true,
  };

  // @ts-expect-error — Same multi-table Insert type inference issue.
  await admin.from('audit_logs').insert(auditPayload);

  // ---------------------------------------------------------------------------
  // 8. Return success
  // ---------------------------------------------------------------------------
  return NextResponse.json(
    { data: { clinic_id: clinic.id }, error: null },
    { status: 201 },
  );
}
