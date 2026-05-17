/**
 * @file lib/constants/clinic-timezones.ts
 * @description Curated IANA timezone identifiers for clinic onboarding.
 *
 * Labels use approximate standard UTC offsets; DST varies by zone where applicable.
 */

export interface ClinicTimezoneOption {
  value: string;
  label: string;
}

/**
 * Timezone choices for the clinic onboarding timezone selector.
 * Order: Middle East & Gulf first, then EU/EEA, then other major regions.
 */
export const CLINIC_TIMEZONE_OPTIONS: ClinicTimezoneOption[] = [
  // -------------------------------------------------------------------------
  // Middle East & Gulf
  // -------------------------------------------------------------------------
  { value: 'Asia/Dubai', label: '(UTC+4) Dubai, Abu Dhabi (UAE)' },
  { value: 'Asia/Muscat', label: '(UTC+4) Muscat (Oman)' },
  { value: 'Asia/Riyadh', label: '(UTC+3) Riyadh, Jeddah (Saudi Arabia)' },
  { value: 'Asia/Qatar', label: '(UTC+3) Doha (Qatar)' },
  { value: 'Asia/Kuwait', label: '(UTC+3) Kuwait City (Kuwait)' },
  { value: 'Asia/Bahrain', label: '(UTC+3) Manama (Bahrain)' },
  { value: 'Asia/Baghdad', label: '(UTC+3) Baghdad (Iraq)' },
  { value: 'Asia/Tehran', label: '(UTC+3:30) Tehran (Iran)' },
  { value: 'Asia/Beirut', label: '(UTC+2/+3) Beirut (Lebanon)' },
  { value: 'Asia/Jerusalem', label: '(UTC+2/+3) Jerusalem, Tel Aviv (Israel)' },
  { value: 'Asia/Amman', label: '(UTC+2/+3) Amman (Jordan)' },
  { value: 'Asia/Damascus', label: '(UTC+2/+3) Damascus (Syria)' },
  { value: 'Asia/Aden', label: '(UTC+3) Aden (Yemen)' },
  { value: 'Asia/Nicosia', label: '(UTC+2/+3) Nicosia (Cyprus)' },
  { value: 'Asia/Baku', label: '(UTC+4/+5) Baku (Azerbaijan)' },
  { value: 'Asia/Tbilisi', label: '(UTC+4) Tbilisi (Georgia)' },
  { value: 'Asia/Yerevan', label: '(UTC+4) Yerevan (Armenia)' },

  // -------------------------------------------------------------------------
  // EU / EEA (data residency region)
  // -------------------------------------------------------------------------
  { value: 'Europe/Berlin', label: '(UTC+1/+2) Berlin, Frankfurt, Munich (Germany)' },
  { value: 'Europe/Amsterdam', label: '(UTC+1/+2) Amsterdam (Netherlands)' },
  { value: 'Europe/Paris', label: '(UTC+1/+2) Paris (France)' },
  { value: 'Europe/Rome', label: '(UTC+1/+2) Rome, Milan (Italy)' },
  { value: 'Europe/Madrid', label: '(UTC+1/+2) Madrid, Barcelona (Spain)' },
  { value: 'Europe/Warsaw', label: '(UTC+1/+2) Warsaw (Poland)' },
  { value: 'Europe/Vienna', label: '(UTC+1/+2) Vienna (Austria)' },
  { value: 'Europe/Brussels', label: '(UTC+1/+2) Brussels (Belgium)' },
  { value: 'Europe/Zurich', label: '(UTC+1/+2) Zurich (Switzerland)' },
  { value: 'Europe/Stockholm', label: '(UTC+1/+2) Stockholm (Sweden)' },
  { value: 'Europe/Helsinki', label: '(UTC+2/+3) Helsinki (Finland)' },
  { value: 'Europe/Athens', label: '(UTC+2/+3) Athens (Greece)' },
  { value: 'Europe/Bucharest', label: '(UTC+2/+3) Bucharest (Romania)' },
  { value: 'Europe/Istanbul', label: '(UTC+3) Istanbul (Turkey)' },
  { value: 'Europe/London', label: '(UTC+0/+1) London (UK)' },
  { value: 'Europe/Dublin', label: '(UTC+0/+1) Dublin (Ireland)' },
  { value: 'Europe/Lisbon', label: '(UTC+0/+1) Lisbon (Portugal)' },
  { value: 'Europe/Prague', label: '(UTC+1/+2) Prague (Czech Republic)' },
  { value: 'Europe/Budapest', label: '(UTC+1/+2) Budapest (Hungary)' },
  { value: 'Europe/Riga', label: '(UTC+2/+3) Riga (Latvia)' },
  { value: 'Europe/Tallinn', label: '(UTC+2/+3) Tallinn (Estonia)' },
  { value: 'Europe/Vilnius', label: '(UTC+2/+3) Vilnius (Lithuania)' },
  { value: 'Europe/Oslo', label: '(UTC+1/+2) Oslo (Norway)' },
  { value: 'Europe/Copenhagen', label: '(UTC+1/+2) Copenhagen (Denmark)' },

  // -------------------------------------------------------------------------
  // South & Central Asia
  // -------------------------------------------------------------------------
  { value: 'Asia/Kabul', label: '(UTC+4:30) Kabul (Afghanistan)' },
  { value: 'Asia/Tashkent', label: '(UTC+5) Tashkent (Uzbekistan)' },
  { value: 'Asia/Almaty', label: '(UTC+5) Almaty (Kazakhstan)' },
  { value: 'Asia/Karachi', label: '(UTC+5) Karachi, Islamabad (Pakistan)' },
  { value: 'Asia/Kolkata', label: '(UTC+5:30) Mumbai, Delhi (India)' },
  { value: 'Asia/Colombo', label: '(UTC+5:30) Colombo (Sri Lanka)' },
  { value: 'Asia/Kathmandu', label: '(UTC+5:45) Kathmandu (Nepal)' },
  { value: 'Asia/Dhaka', label: '(UTC+6) Dhaka (Bangladesh)' },

  // -------------------------------------------------------------------------
  // Southeast & East Asia
  // -------------------------------------------------------------------------
  { value: 'Asia/Bangkok', label: '(UTC+7) Bangkok (Thailand)' },
  { value: 'Asia/Jakarta', label: '(UTC+7) Jakarta (Indonesia)' },
  { value: 'Asia/Singapore', label: '(UTC+8) Singapore' },
  { value: 'Asia/Kuala_Lumpur', label: '(UTC+8) Kuala Lumpur (Malaysia)' },
  { value: 'Asia/Manila', label: '(UTC+8) Manila (Philippines)' },
  { value: 'Asia/Hong_Kong', label: '(UTC+8) Hong Kong' },
  { value: 'Asia/Shanghai', label: '(UTC+8) Beijing, Shanghai (China)' },
  { value: 'Asia/Taipei', label: '(UTC+8) Taipei (Taiwan)' },
  { value: 'Asia/Tokyo', label: '(UTC+9) Tokyo (Japan)' },
  { value: 'Asia/Seoul', label: '(UTC+9) Seoul (South Korea)' },

  // -------------------------------------------------------------------------
  // Africa & Oceania
  // -------------------------------------------------------------------------
  { value: 'Africa/Cairo', label: '(UTC+2) Cairo (Egypt)' },
  { value: 'Africa/Casablanca', label: '(UTC+1) Casablanca (Morocco)' },
  { value: 'Africa/Lagos', label: '(UTC+1) Lagos (Nigeria)' },
  { value: 'Africa/Nairobi', label: '(UTC+3) Nairobi (Kenya)' },
  { value: 'Africa/Johannesburg', label: '(UTC+2) Johannesburg (South Africa)' },
  { value: 'Australia/Sydney', label: '(UTC+10/+11) Sydney (Australia)' },
  { value: 'Pacific/Auckland', label: '(UTC+12/+13) Auckland (New Zealand)' },

  // -------------------------------------------------------------------------
  // Americas (common)
  // -------------------------------------------------------------------------
  { value: 'America/New_York', label: '(UTC-5/-4) New York, Miami (US Eastern)' },
  { value: 'America/Chicago', label: '(UTC-6/-5) Chicago (US Central)' },
  { value: 'America/Denver', label: '(UTC-7/-6) Denver (US Mountain)' },
  { value: 'America/Los_Angeles', label: '(UTC-8/-7) Los Angeles (US Pacific)' },
  { value: 'America/Toronto', label: '(UTC-5/-4) Toronto (Canada Eastern)' },
  { value: 'America/Mexico_City', label: '(UTC-6) Mexico City (Mexico)' },
  { value: 'America/Sao_Paulo', label: '(UTC-3) São Paulo (Brazil)' },

  // -------------------------------------------------------------------------
  // Atlantic
  // -------------------------------------------------------------------------
  { value: 'Atlantic/Reykjavik', label: '(UTC+0) Reykjavik (Iceland)' },
];

/** Set of allowed IANA timezone values exposed in the clinic onboarding selector. */
const CLINIC_TIMEZONE_IANA_VALUES = new Set(
  CLINIC_TIMEZONE_OPTIONS.map((option) => option.value),
);

/**
 * Returns the given IANA timezone when it exists in the curated onboarding list;
 * otherwise falls back to Europe/Berlin (EU-safe default).
 *
 * @param preferred - Candidate IANA identifier (e.g. from IP-based country mapping).
 * @returns A timezone string that is guaranteed to match a select option value.
 */
export function resolveClinicTimezoneIANA(preferred: string): string {
  return CLINIC_TIMEZONE_IANA_VALUES.has(preferred) ? preferred : 'Europe/Berlin';
}
