/**
 * @file database/scripts/seed-dashboard-demo.ts
 * @description Idempotent demo seed for Sypho dashboards (clinics, staff, patients, appointments).
 *
 * Prerequisites:
 *   - NEXT_PUBLIC_SUPABASE_URL
 *   - SUPABASE_SERVICE_ROLE_KEY (server only; never expose to the browser)
 *   - Optional: load .env.local via dotenv (see main()).
 *
 * Run: npm run db:seed:demo
 *
 * Safety:
 *   - Uses deterministic UUIDs derived from stable seed strings (SHA-256 based).
 *   - Exits without changes if the marker clinic slug already exists.
 *   - Fictional people and addresses only (no real individuals).
 *
 * Compliance: GDPR-style demo only; run on non-production databases unless approved.
 */

import { createHash } from 'crypto';
import { config }      from 'dotenv';
import { resolve }     from 'path';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

import { normalizeSupabaseProjectUrl } from '../../lib/utils/supabase-project-url';

import type {
  AppointmentInsert,
  AppointmentStatus,
  AppointmentTypeInsert,
  ClinicInsert,
  Database,
  GenderType,
  Json,
  PatientConsentInsert,
  PatientInsert,
} from '../types/database.types';

// ---------------------------------------------------------------------------
// Configuration (ASCII only)
// ---------------------------------------------------------------------------

const SEED_PASSWORD = 'DemoSeed2026!Sypho';

const EMPTY_SCHEDULE: Json = {};

const BUSINESS_HOURS: Json = {
  monday:    { open: '08:00', close: '18:00', closed: false },
  tuesday:   { open: '08:00', close: '18:00', closed: false },
  wednesday: { open: '08:00', close: '18:00', closed: false },
  thursday:  { open: '08:00', close: '18:00', closed: false },
  friday:    { open: '08:00', close: '17:00', closed: false },
  saturday:  { closed: true },
  sunday:    { closed: true },
};

interface ClinicSeedDefinition {
  readonly slug:             string;
  readonly name:             string;
  readonly email:            string;
  readonly countryCode:      string;
  readonly timezone:         string;
  readonly city:             string;
  readonly postalCode:       string;
  readonly addressLine1:     string;
  readonly ownerEmail:       string;
  readonly ownerFirstName:   string;
}

const CLINICS: readonly ClinicSeedDefinition[] = [
  {
    slug:           'sypho-dashboard-demo-de',
    name:           'Sypho Demo Clinic Berlin',
    email:          'reception.demo-de@sypho-seed.invalid',
    countryCode:    'DE',
    timezone:       'Europe/Berlin',
    city:           'Berlin',
    postalCode:     '10115',
    addressLine1:   'Friedrichstrasse 100',
    ownerEmail:     'owner.demo-de@sypho-seed.invalid',
    ownerFirstName: 'Alex',
  },
  {
    slug:           'sypho-dashboard-demo-nl',
    name:           'Sypho Demo Clinic Rotterdam',
    email:          'reception.demo-nl@sypho-seed.invalid',
    countryCode:    'NL',
    timezone:       'Europe/Amsterdam',
    city:           'Rotterdam',
    postalCode:     '3011AA',
    addressLine1:   'Coolsingel 50',
    ownerEmail:     'owner.demo-nl@sypho-seed.invalid',
    ownerFirstName: 'Jordan',
  },
  {
    slug:           'sypho-dashboard-demo-om',
    name:           'Sypho Demo Clinic Muscat',
    email:          'reception.demo-om@sypho-seed.invalid',
    countryCode:    'OM',
    timezone:       'Asia/Muscat',
    city:           'Muscat',
    postalCode:     '100',
    addressLine1:   'Sultan Qaboos Street 12',
    ownerEmail:     'owner.demo-om@sypho-seed.invalid',
    ownerFirstName: 'Sam',
  },
  {
    slug:           'sypho-dashboard-demo-gb',
    name:           'Sypho Demo Clinic London',
    email:          'reception.demo-gb@sypho-seed.invalid',
    countryCode:    'GB',
    timezone:       'Europe/London',
    city:           'London',
    postalCode:     'SW1A1AA',
    addressLine1:   'Westminster Bridge Road 20',
    ownerEmail:     'owner.demo-gb@sypho-seed.invalid',
    ownerFirstName: 'Taylor',
  },
];

// ---------------------------------------------------------------------------
// UUID helpers (deterministic for idempotent re-runs)
// ---------------------------------------------------------------------------

/**
 * Builds a RFC-4122 version-4 UUID from a stable seed string (SHA-256 digest).
 *
 * @param seed - Unique ASCII label for the entity (e.g. "clinic:slug").
 * @returns UUID string.
 */
function deterministicUuid(seed: string): string {
  const digest = createHash('sha256').update(seed, 'utf8').digest();
  const bytes    = Uint8Array.from(digest.subarray(0, 16));
  bytes[6] = (bytes[6]! & 0x0f) | 0x40;
  bytes[8] = (bytes[8]! & 0x3f) | 0x80;
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

/**
 * Returns an ISO-8601 UTC timestamp offset from today by whole days and clock fields.
 *
 * @param dayOffset - Days relative to UTC today (negative past, positive future).
 * @param hourUtc - Hour in UTC (0-23).
 * @param minuteUtc - Minute (0-59).
 */
function utcAt(dayOffset: number, hourUtc: number, minuteUtc: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + dayOffset);
  d.setUTCHours(hourUtc, minuteUtc, 0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------------------
// Environment
// ---------------------------------------------------------------------------

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v || v.trim().length === 0) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return v.trim();
}

// ---------------------------------------------------------------------------
// Auth helpers
// ---------------------------------------------------------------------------

/**
 * Ensures a seed Auth user exists with the given fixed UUID and email.
 *
 * @param admin - Supabase client with service role.
 * @param id - Fixed auth user UUID.
 * @param email - Unique login email.
 * @param firstName - Stored in user_metadata (ASCII).
 * @returns The user id (same as input id when created or already present).
 */
async function ensureAuthUser(
  admin: SupabaseClient<Database>,
  id: string,
  email: string,
  firstName: string,
): Promise<string> {
  const existing = await admin.auth.admin.getUserById(id);
  if (existing.data.user) {
    return existing.data.user.id;
  }

  const created = await admin.auth.admin.createUser({
    id,
    email,
    password:      SEED_PASSWORD,
    email_confirm: true,
    user_metadata: {
      first_name: firstName,
      last_name:  'Owner',
    },
    app_metadata: {
      onboarding_completed: true,
    },
  });

  if (created.error) {
    const msg = created.error.message ?? '';
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('registered')) {
      const byEmail = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
      const found   = byEmail.data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase());
      if (found) {
        return found.id;
      }
    }
    throw new Error(`Auth user create failed (${email}): ${created.error.message}`);
  }

  if (!created.data.user) {
    throw new Error(`Auth user create returned no user (${email}).`);
  }

  return created.data.user.id;
}

// ---------------------------------------------------------------------------
// Main seeding
// ---------------------------------------------------------------------------

/**
 * Inserts demo rows for one clinic definition.
 */
async function seedClinic(admin: SupabaseClient<Database>, def: ClinicSeedDefinition): Promise<void> {
  const clinicId = deterministicUuid(`clinic:${def.slug}`);
  const ownerId  = deterministicUuid(`owner:${def.slug}`);

  await ensureAuthUser(admin, ownerId, def.ownerEmail, def.ownerFirstName);

  const clinicRow: ClinicInsert = {
    id:                clinicId,
    name:              def.name,
    slug:              def.slug,
    email:             def.email,
    phone:             '+4900000000',
    address_line1:     def.addressLine1,
    city:              def.city,
    postal_code:       def.postalCode,
    country_code:      def.countryCode,
    timezone:          def.timezone,
    business_hours:    BUSINESS_HOURS,
    subscription_tier: 'professional',
    is_active:         true,
    tax_id:            null,
    registration_number: null,
    website:           null,
    address_line2:     null,
    state_province:    null,
    dpo_name:          null,
    dpo_email:         null,
    privacy_policy_url: null,
    terms_url:         null,
  };

  const { error: clinicErr } = await admin.from('clinics').upsert(clinicRow, { onConflict: 'slug' });
  if (clinicErr) {
    throw new Error(`Clinic upsert failed (${def.slug}): ${clinicErr.message}`);
  }

  const memberPayload = {
    id:          deterministicUuid(`member:${def.slug}`),
    clinic_id:   clinicId,
    user_id:     ownerId,
    role:        'clinic_owner' as const,
    is_active:   true,
    invited_by:  null,
    invited_at:  null,
    accepted_at: new Date().toISOString(),
  };

  const { error: memberErr } = await admin.from('clinic_members').upsert(memberPayload, { onConflict: 'id' });
  if (memberErr) {
    throw new Error(`clinic_members upsert failed (${def.slug}): ${memberErr.message}`);
  }

  const types: AppointmentTypeInsert[] = [
    {
      id:                    deterministicUuid(`type:${def.slug}:consult`),
      clinic_id:             clinicId,
      name:                  'General consultation',
      description:           'Standard consultation visit (demo data).',
      color:                 '#2563EB',
      duration_minutes:      30,
      buffer_before_minutes: 5,
      buffer_after_minutes:  5,
      price_cents:           8000,
      currency_code:         'EUR',
      is_active:             true,
      is_online_bookable:    true,
    },
    {
      id:                    deterministicUuid(`type:${def.slug}:followup`),
      clinic_id:             clinicId,
      name:                  'Follow-up visit',
      description:           'Short follow-up appointment (demo data).',
      color:                 '#059669',
      duration_minutes:      20,
      buffer_before_minutes: 0,
      buffer_after_minutes:  0,
      price_cents:           5000,
      currency_code:         'EUR',
      is_active:             true,
      is_online_bookable:    true,
    },
  ];

  const { error: typeErr } = await admin.from('appointment_types').upsert(types, { onConflict: 'id' });
  if (typeErr) {
    throw new Error(`appointment_types upsert failed (${def.slug}): ${typeErr.message}`);
  }

  const doctorSpecs: {
    idx: number;
    title: 'Dr.' | 'Prof.';
    first: string;
    last: string;
    specialty: string;
    license: string;
  }[] = [
    { idx: 1, title: 'Dr.', first: 'Morgan', last: 'Hayes', specialty: 'General Practice', license: `DE-LIC-${def.slug}-01` },
    { idx: 2, title: 'Dr.', first: 'Riley', last: 'Brooks', specialty: 'General Practice', license: `DE-LIC-${def.slug}-02` },
    { idx: 3, title: 'Dr.', first: 'Casey', last: 'Reed', specialty: 'Cardiology', license: `DE-LIC-${def.slug}-03` },
    { idx: 4, title: 'Prof.', first: 'Quinn', last: 'Morgan', specialty: 'Internal Medicine', license: `DE-LIC-${def.slug}-04` },
  ];

  const doctorIds: string[] = [];

  for (const d of doctorSpecs) {
    const doctorId = deterministicUuid(`doctor:${def.slug}:${d.idx}`);
    doctorIds.push(doctorId);
    const doctorRow = {
      id:                              doctorId,
      clinic_id:                       clinicId,
      user_id:                         null,
      title:                           d.title,
      first_name:                      d.first,
      last_name:                       d.last,
      license_number:                  d.license,
      license_country:                 def.countryCode,
      specialty:                       d.specialty,
      sub_specialty:                   null,
      professional_email:              `doctor${d.idx}.${def.slug}@sypho-seed.invalid`,
      professional_phone:              '+4900000001',
      availability_schedule:           EMPTY_SCHEDULE,
      default_appointment_duration_minutes: 30,
      max_patients_per_day:            40,
      is_active:                       true,
      is_accepting_new_patients:       true,
    };

    const { error: docErr } = await admin.from('doctors').upsert(doctorRow, { onConflict: 'id' });
    if (docErr) {
      throw new Error(`doctors upsert failed (${def.slug}): ${docErr.message}`);
    }
  }

  const patientSpecs: {
    idx: number;
    first: string;
    last: string;
    gender: GenderType;
    dob: string;
    email: string;
    phone: string;
    country: string;
  }[] = [
    { idx: 1, first: 'Jamie', last: 'Walker', gender: 'female', dob: '1988-04-12', email: `p1.${def.slug}@sypho-seed.invalid`, phone: '+4900001001', country: def.countryCode },
    { idx: 2, first: 'Drew', last: 'Parker', gender: 'male', dob: '1992-11-03', email: `p2.${def.slug}@sypho-seed.invalid`, phone: '+4900001002', country: def.countryCode },
    { idx: 3, first: 'Skyler', last: 'Bennett', gender: 'non_binary', dob: '1979-01-22', email: `p3.${def.slug}@sypho-seed.invalid`, phone: '+4900001003', country: def.countryCode },
    { idx: 4, first: 'Cameron', last: 'Ellis', gender: 'prefer_not_to_say', dob: '2001-09-09', email: `p4.${def.slug}@sypho-seed.invalid`, phone: '+4900001004', country: def.countryCode },
    { idx: 5, first: 'Reese', last: 'Foster', gender: 'female', dob: '1996-07-30', email: `p5.${def.slug}@sypho-seed.invalid`, phone: '+4900001005', country: def.countryCode },
  ];

  const patientIds: string[] = [];

  for (const p of patientSpecs) {
    const patientId = deterministicUuid(`patient:${def.slug}:${p.idx}`);
    patientIds.push(patientId);

    const patientRow: PatientInsert = {
      id:               patientId,
      clinic_id:        clinicId,
      user_id:          null,
      first_name:       p.first,
      last_name:        p.last,
      date_of_birth:    p.dob,
      gender:           p.gender,
      email:            p.email,
      phone:            p.phone,
      address_line1:    'Seed Street 1',
      city:             def.city,
      postal_code:      def.postalCode,
      country_code:     p.country,
      gdpr_consent_given_at: new Date().toISOString(),
      gdpr_consent_version:  '1.0',
      national_id:          null,
      address_line2:        null,
      emergency_contact_name: null,
      emergency_contact_phone: null,
      clinical_notes:       null,
      insurance_provider:   'Demo Insurance',
      insurance_policy_number: `TEST-${def.slug}-${p.idx}`,
      data_retention_until: null,
      data_deletion_requested_at: null,
    };

    const { error: patErr } = await admin.from('patients').upsert(patientRow, { onConflict: 'id' });
    if (patErr) {
      throw new Error(`patients upsert failed (${def.slug}): ${patErr.message}`);
    }

    const consentRow: PatientConsentInsert = {
      id:                   deterministicUuid(`consent:${def.slug}:${p.idx}`),
      patient_id:           patientId,
      clinic_id:            clinicId,
      consent_type:         'data_processing',
      is_granted:           true,
      lawful_basis:         'consent',
      consent_version:      '1.0',
      consent_text_snapshot: 'Demo consent snapshot (ASCII).',
      capture_method:       'api',
      ip_address:           null,
      user_agent:           null,
      consented_at:         new Date().toISOString(),
    };

    const { error: conErr } = await admin.from('patient_consents').insert(consentRow);
    const isDup =
      conErr?.code === '23505' ||
      (conErr?.message ?? '').toLowerCase().includes('duplicate');
    if (conErr && !isDup) {
      throw new Error(`patient_consents insert failed (${def.slug}): ${conErr.message}`);
    }
  }

  const consultTypeId = deterministicUuid(`type:${def.slug}:consult`);
  const followTypeId  = deterministicUuid(`type:${def.slug}:followup`);

  const appointmentPlan: {
    key: string;
    dayOffset: number;
    hourUtc: number;
    minuteUtc: number;
    doctorIndex: number;
    patientIndex: number;
    typeId: string;
    status: AppointmentStatus;
    complaint: string;
  }[] = [
    { key: 'a1', dayOffset: -21, hourUtc: 9,  minuteUtc: 0,  doctorIndex: 0, patientIndex: 0, typeId: consultTypeId, status: 'completed', complaint: 'Annual checkup (demo).' },
    { key: 'a2', dayOffset: -14, hourUtc: 11, minuteUtc: 30, doctorIndex: 1, patientIndex: 1, typeId: consultTypeId, status: 'completed', complaint: 'Follow-up labs (demo).' },
    { key: 'a3', dayOffset: -7,  hourUtc: 14, minuteUtc: 0,  doctorIndex: 2, patientIndex: 2, typeId: followTypeId, status: 'confirmed', complaint: 'Medication review (demo).' },
    { key: 'a4', dayOffset: 0,   hourUtc: 10, minuteUtc: 15, doctorIndex: 3, patientIndex: 3, typeId: consultTypeId, status: 'checked_in', complaint: 'Same-day visit (demo).' },
    { key: 'a5', dayOffset: 1,   hourUtc: 8,  minuteUtc: 45, doctorIndex: 0, patientIndex: 4, typeId: consultTypeId, status: 'pending', complaint: 'New patient intake (demo).' },
    { key: 'a6', dayOffset: 3,   hourUtc: 13, minuteUtc: 20, doctorIndex: 1, patientIndex: 0, typeId: followTypeId, status: 'confirmed', complaint: 'Cardiology follow-up (demo).' },
    { key: 'a7', dayOffset: 7,   hourUtc: 15, minuteUtc: 0,  doctorIndex: 2, patientIndex: 1, typeId: consultTypeId, status: 'pending', complaint: 'Chest discomfort (demo).' },
    { key: 'a8', dayOffset: 14,  hourUtc: 9,  minuteUtc: 30, doctorIndex: 3, patientIndex: 2, typeId: consultTypeId, status: 'pending', complaint: 'Preventive care (demo).' },
    { key: 'a9', dayOffset: 21,  hourUtc: 16, minuteUtc: 45, doctorIndex: 0, patientIndex: 3, typeId: followTypeId, status: 'pending', complaint: 'Results discussion (demo).' },
    { key: 'a10', dayOffset: 28, hourUtc: 12, minuteUtc: 0, doctorIndex: 1, patientIndex: 4, typeId: consultTypeId, status: 'pending', complaint: 'Routine visit (demo).' },
  ];

  for (const ap of appointmentPlan) {
    const scheduledAt = utcAt(ap.dayOffset, ap.hourUtc, ap.minuteUtc);
    const doctorId    = doctorIds[ap.doctorIndex]!;
    const patientId   = patientIds[ap.patientIndex]!;

    const row: AppointmentInsert = {
      id:                  deterministicUuid(`appt:${def.slug}:${ap.key}`),
      clinic_id:           clinicId,
      patient_id:          patientId,
      doctor_id:           doctorId,
      appointment_type_id: ap.typeId,
      scheduled_at:        scheduledAt,
      duration_minutes:    30,
      status:              ap.status,
      chief_complaint:     ap.complaint,
      booked_via:          'dashboard',
      booked_by:           ownerId,
      cancellation_reason: null,
      cancellation_by:     null,
      cancelled_at:        null,
      clinical_notes:      null,
      diagnosis_codes:     null,
      prescription_notes:  null,
      follow_up_required:  false,
      follow_up_notes:     null,
      data_retention_until: null,
    };

    const { error: apptErr } = await admin.from('appointments').upsert(row, { onConflict: 'id' });
    if (apptErr) {
      throw new Error(`appointments upsert failed (${def.slug} / ${ap.key}): ${apptErr.message}`);
    }
  }
}

/**
 * Loads environment variables and runs the demo seed.
 */
async function main(): Promise<void> {
  config({ path: resolve(process.cwd(), '.env.local') });
  config({ path: resolve(process.cwd(), '.env') });

  const url         = normalizeSupabaseProjectUrl(requireEnv('NEXT_PUBLIC_SUPABASE_URL'));
  const serviceKey  = requireEnv('SUPABASE_SERVICE_ROLE_KEY');
  const anonKey     = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (anonKey && serviceKey === anonKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY must not equal NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const admin = createClient<Database>(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession:   false,
    },
  });

  // eslint-disable-next-line no-console -- CLI script
  console.info('[seed-dashboard-demo] Upserting demo clinics, staff, patients, and appointments (idempotent)...');

  for (const def of CLINICS) {
    // eslint-disable-next-line no-await-in-loop -- sequential for clearer errors and partial runs
    await seedClinic(admin, def);
  }

  // eslint-disable-next-line no-console -- CLI script
  console.info('[seed-dashboard-demo] Done. Demo owner password (all owners):', SEED_PASSWORD);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  // eslint-disable-next-line no-console -- CLI script
  console.error('[seed-dashboard-demo] FAILED:', message);
  process.exitCode = 1;
});
