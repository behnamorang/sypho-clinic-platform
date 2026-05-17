/**
 * @file lib/booking/geo.ts
 * @description IP-based geolocation utilities for booking portal personalization.
 *
 * Detects the visitor's country from CDN-injected request headers and maps it to:
 *   - Phone country code prefix (E.164)
 *   - Local currency (ISO 4217)
 *   - Date format convention (DD/MM/YYYY vs MM/DD/YYYY)
 *   - Default IANA timezone and BCP 47 locale for clinic onboarding
 *
 * Supported header sources (in priority order):
 *   1. Middleware-forwarded: x-geo-country (derived from IP at the edge)
 *   2. Cloudflare CDN:         CF-IPCountry
 *   3. Vercel Edge:            x-vercel-ip-country
 *   4. Generic CDN:            x-country-code
 *   5. Fallback:               'DE' (EU default)
 *
 * No external API calls are made — all data is derived from static maps.
 * This function is safe to call in Next.js Edge Middleware and Server Components.
 *
 * @compliance GDPR — IP address is NOT stored or logged by this function.
 *             Only the derived country code (non-personal) is used.
 */

import { resolveClinicTimezoneIANA } from '@/lib/constants/clinic-timezones';
import type { GeoContext, OnboardingGeoDefaults } from '@/types/booking';

// ---------------------------------------------------------------------------
// STATIC COUNTRY → PHONE PREFIX MAP
// Covers primary Sypho.io markets: EU/EEA + GCC + major global markets.
// Source: ITU-T E.164 country codes.
// ---------------------------------------------------------------------------

const PHONE_PREFIXES: Readonly<Record<string, string>> = {
  // GCC / Middle East
  OM: '+968',  // Oman
  SA: '+966',  // Saudi Arabia
  AE: '+971',  // UAE
  KW: '+965',  // Kuwait
  QA: '+974',  // Qatar
  BH: '+973',  // Bahrain
  JO: '+962',  // Jordan
  EG: '+20',   // Egypt
  LB: '+961',  // Lebanon

  // EU / EEA
  DE: '+49',   // Germany
  FR: '+33',   // France
  GB: '+44',   // United Kingdom
  NL: '+31',   // Netherlands
  BE: '+32',   // Belgium
  AT: '+43',   // Austria
  CH: '+41',   // Switzerland
  SE: '+46',   // Sweden
  NO: '+47',   // Norway
  DK: '+45',   // Denmark
  FI: '+358',  // Finland
  IT: '+39',   // Italy
  ES: '+34',   // Spain
  PT: '+351',  // Portugal
  PL: '+48',   // Poland
  CZ: '+420',  // Czech Republic
  HU: '+36',   // Hungary
  RO: '+40',   // Romania
  GR: '+30',   // Greece
  IE: '+353',  // Ireland
  HR: '+385',  // Croatia
  CY: '+357',  // Cyprus
  BG: '+359',  // Bulgaria
  EE: '+372',  // Estonia
  LT: '+370',  // Lithuania
  LU: '+352',  // Luxembourg
  LV: '+371',  // Latvia
  MT: '+356',  // Malta
  SI: '+386',  // Slovenia
  SK: '+421',  // Slovakia
  IS: '+354',  // Iceland
  LI: '+423',  // Liechtenstein

  // North America
  US: '+1',
  CA: '+1',

  // Asia-Pacific
  AU: '+61',
  NZ: '+64',
  SG: '+65',
  IN: '+91',
  JP: '+81',
  KR: '+82',
  CN: '+86',

  // Other
  ZA: '+27',   // South Africa
  BR: '+55',   // Brazil
  MX: '+52',   // Mexico
  TR: '+90',   // Turkey
  PH: '+63',   // Philippines
};

// ---------------------------------------------------------------------------
// STATIC COUNTRY → CURRENCY MAP (ISO 4217)
// ---------------------------------------------------------------------------

const CURRENCIES: Readonly<Record<string, string>> = {
  // GCC
  OM: 'OMR',
  SA: 'SAR',
  AE: 'AED',
  KW: 'KWD',
  QA: 'QAR',
  BH: 'BHD',
  JO: 'JOD',
  EG: 'EGP',
  LB: 'LBP',

  // EU/EEA (Euro zone)
  DE: 'EUR',
  FR: 'EUR',
  NL: 'EUR',
  BE: 'EUR',
  AT: 'EUR',
  IT: 'EUR',
  ES: 'EUR',
  PT: 'EUR',
  FI: 'EUR',
  GR: 'EUR',
  IE: 'EUR',
  HR: 'EUR',
  CY: 'EUR',
  BG: 'BGN',
  EE: 'EUR',
  LT: 'EUR',
  LU: 'EUR',
  LV: 'EUR',
  MT: 'EUR',
  SI: 'EUR',
  SK: 'EUR',
  IS: 'ISK',
  LI: 'CHF',

  // EU/EEA (own currencies)
  GB: 'GBP',
  CH: 'CHF',
  SE: 'SEK',
  NO: 'NOK',
  DK: 'DKK',
  PL: 'PLN',
  CZ: 'CZK',
  HU: 'HUF',
  RO: 'RON',

  // Other
  US: 'USD',
  CA: 'CAD',
  AU: 'AUD',
  NZ: 'NZD',
  SG: 'SGD',
  IN: 'INR',
  JP: 'JPY',
  KR: 'KRW',
  CN: 'CNY',
  ZA: 'ZAR',
  BR: 'BRL',
  MX: 'MXN',
  TR: 'TRY',
  PH: 'PHP',
};

// ---------------------------------------------------------------------------
// STATIC CURRENCY → DISPLAY SYMBOL MAP
// ---------------------------------------------------------------------------

const CURRENCY_SYMBOLS: Readonly<Record<string, string>> = {
  OMR: 'OMR',   // Omani Rial (no single symbol; use ISO code)
  SAR: 'SAR',
  AED: 'AED',
  KWD: 'KWD',
  QAR: 'QAR',
  BHD: 'BHD',
  JOD: 'JOD',
  EGP: 'EGP',
  LBP: 'LBP',
  EUR: '€',
  GBP: '£',
  USD: '$',
  CAD: 'CA$',
  AUD: 'A$',
  NZD: 'NZ$',
  CHF: 'CHF',
  SEK: 'kr',
  NOK: 'kr',
  DKK: 'kr',
  PLN: 'zł',
  CZK: 'Kč',
  HUF: 'Ft',
  RON: 'lei',
  SGD: 'S$',
  INR: '₹',
  JPY: '¥',
  KRW: '₩',
  CNY: '¥',
  ZAR: 'R',
  BRL: 'R$',
  MXN: 'MX$',
  TRY: '₺',
  BGN: 'BGN',
  ISK: 'ISK',
  PHP: 'PHP',
};

// ---------------------------------------------------------------------------
// DATE FORMAT EXCEPTIONS
// Most of the world uses DD/MM/YYYY; only a few countries use MM/DD/YYYY.
// ---------------------------------------------------------------------------

const MM_DD_COUNTRIES = new Set(['US', 'CA', 'PH']);

// ---------------------------------------------------------------------------
// DEFAULT IANA TIMEZONE (must exist in curated clinic-timezones list)
// ---------------------------------------------------------------------------

const IANA_TIMEZONE_BY_COUNTRY: Readonly<Record<string, string>> = {
  OM: 'Asia/Muscat',
  SA: 'Asia/Riyadh',
  AE: 'Asia/Dubai',
  KW: 'Asia/Kuwait',
  QA: 'Asia/Qatar',
  BH: 'Asia/Bahrain',
  JO: 'Asia/Amman',
  EG: 'Africa/Cairo',
  LB: 'Asia/Beirut',
  DE: 'Europe/Berlin',
  FR: 'Europe/Paris',
  GB: 'Europe/London',
  NL: 'Europe/Amsterdam',
  BE: 'Europe/Brussels',
  AT: 'Europe/Vienna',
  CH: 'Europe/Zurich',
  SE: 'Europe/Stockholm',
  NO: 'Europe/Oslo',
  DK: 'Europe/Copenhagen',
  FI: 'Europe/Helsinki',
  IT: 'Europe/Rome',
  ES: 'Europe/Madrid',
  PT: 'Europe/Lisbon',
  PL: 'Europe/Warsaw',
  CZ: 'Europe/Prague',
  HU: 'Europe/Budapest',
  RO: 'Europe/Bucharest',
  GR: 'Europe/Athens',
  IE: 'Europe/Dublin',
  HR: 'Europe/Budapest',
  CY: 'Asia/Nicosia',
  BG: 'Europe/Bucharest',
  EE: 'Europe/Tallinn',
  LT: 'Europe/Vilnius',
  LU: 'Europe/Brussels',
  LV: 'Europe/Riga',
  MT: 'Europe/Rome',
  SI: 'Europe/Vienna',
  SK: 'Europe/Prague',
  IS: 'Atlantic/Reykjavik',
  LI: 'Europe/Zurich',
  US: 'America/New_York',
  CA: 'America/Toronto',
  AU: 'Australia/Sydney',
  NZ: 'Pacific/Auckland',
  SG: 'Asia/Singapore',
  IN: 'Asia/Kolkata',
  JP: 'Asia/Tokyo',
  KR: 'Asia/Seoul',
  CN: 'Asia/Shanghai',
  ZA: 'Africa/Johannesburg',
  BR: 'America/Sao_Paulo',
  MX: 'America/Mexico_City',
  TR: 'Europe/Istanbul',
  PH: 'Asia/Manila',
};

// ---------------------------------------------------------------------------
// DEFAULT BCP 47 LOCALE (document language + Intl formatting)
// ---------------------------------------------------------------------------

const DEFAULT_LOCALE_BY_COUNTRY: Readonly<Record<string, string>> = {
  DE: 'de-DE',
  AT: 'de-AT',
  CH: 'de-CH',
  FR: 'fr-FR',
  BE: 'nl-BE',
  NL: 'nl-NL',
  LU: 'fr-LU',
  ES: 'es-ES',
  PT: 'pt-PT',
  IT: 'it-IT',
  GR: 'el-GR',
  PL: 'pl-PL',
  CZ: 'cs-CZ',
  HU: 'hu-HU',
  RO: 'ro-RO',
  BG: 'bg-BG',
  HR: 'hr-HR',
  SI: 'sl-SI',
  SK: 'sk-SK',
  SE: 'sv-SE',
  NO: 'nb-NO',
  DK: 'da-DK',
  FI: 'fi-FI',
  EE: 'et-EE',
  LV: 'lv-LV',
  LT: 'lt-LT',
  IE: 'en-IE',
  GB: 'en-GB',
  CY: 'el-CY',
  MT: 'en-MT',
  IS: 'is-IS',
  LI: 'de-LI',
  OM: 'ar-OM',
  SA: 'ar-SA',
  AE: 'ar-AE',
  KW: 'ar-KW',
  QA: 'ar-QA',
  BH: 'ar-BH',
  JO: 'ar-JO',
  EG: 'ar-EG',
  LB: 'ar-LB',
  US: 'en-US',
  CA: 'en-CA',
  AU: 'en-AU',
  NZ: 'en-NZ',
  SG: 'en-SG',
  IN: 'en-IN',
  JP: 'ja-JP',
  KR: 'ko-KR',
  CN: 'zh-CN',
  ZA: 'en-ZA',
  BR: 'pt-BR',
  MX: 'es-MX',
  TR: 'tr-TR',
  PH: 'en-PH',
};

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

/**
 * Builds onboarding defaults (timezone, locale, phone, currency) from a country code.
 *
 * @param countryCode - ISO 3166-1 alpha-2 country code (case-insensitive).
 * @returns Defaults safe for clinic onboarding UI (timezone is always a curated option).
 */
export function getOnboardingGeoDefaultsFromCountry(countryCode: string): OnboardingGeoDefaults {
  const base     = getGeoContext(countryCode);
  const rawTz    = IANA_TIMEZONE_BY_COUNTRY[base.countryCode] ?? 'Europe/Berlin';
  const timezone = resolveClinicTimezoneIANA(rawTz);
  const locale   = DEFAULT_LOCALE_BY_COUNTRY[base.countryCode] ?? 'en';

  return {
    ...base,
    timezone,
    locale,
  };
}

/**
 * Reads request headers and returns onboarding geo defaults.
 * Honors `x-geo-country` first when present (set by middleware from edge IP detection).
 *
 * @param headers - Request headers (`headers()` in RSC or middleware request).
 * @returns Defaults for timezone, locale, phone prefix, and currency display.
 */
export function getOnboardingGeoDefaultsFromHeaders(
  headers: { get: (name: string) => string | null }
): OnboardingGeoDefaults {
  const countryCode = detectCountryFromHeaders(headers);
  return getOnboardingGeoDefaultsFromCountry(countryCode);
}

/**
 * Maps an ISO 3166-1 alpha-2 country code to a complete GeoContext object.
 * Provides sensible EU defaults for unknown or missing country codes.
 *
 * @param countryCode - Two-letter ISO country code (case-insensitive).
 * @returns A fully populated GeoContext for localization.
 */
export function getGeoContext(countryCode: string): GeoContext {
  const code = countryCode.toUpperCase();

  const currencyCode   = CURRENCIES[code]      ?? 'EUR';
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] ?? currencyCode;

  return {
    countryCode:   code,
    phonePrefix:   PHONE_PREFIXES[code]         ?? '+49',
    currencyCode,
    currencySymbol,
    dateFormat:    MM_DD_COUNTRIES.has(code) ? 'MM/DD/YYYY' : 'DD/MM/YYYY',
  };
}

/**
 * Extracts the visitor's country code from CDN/proxy request headers.
 * Priority:
 *   1. `x-geo-country` — set by Sypho middleware from edge IP detection (authoritative in-app)
 *   2. Cloudflare `CF-IPCountry`
 *   3. Vercel `x-vercel-ip-country`
 *   4. Generic `x-country-code`
 *   5. Fallback `DE` when nothing matches
 *
 * @param headers - A Headers-like object (from Next.js request or headers()).
 * @returns ISO 3166-1 alpha-2 country code string.
 */
export function detectCountryFromHeaders(
  headers: { get: (name: string) => string | null }
): string {
  const forwardedGeo = headers.get('x-geo-country');
  if (forwardedGeo) {
    const trimmed = forwardedGeo.trim();
    if (/^[A-Za-z]{2}$/.test(trimmed)) {
      return trimmed.toUpperCase();
    }
  }

  const cfCountry = headers.get('cf-ipcountry');
  if (cfCountry && cfCountry !== 'XX' && cfCountry !== 'T1') {
    return cfCountry.toUpperCase();
  }

  const vercelCountry = headers.get('x-vercel-ip-country');
  if (vercelCountry) {
    return vercelCountry.toUpperCase();
  }

  const genericCountry = headers.get('x-country-code');
  if (genericCountry) {
    return genericCountry.toUpperCase();
  }

  return 'DE';
}

/**
 * Convenience function: reads headers and returns a full GeoContext.
 *
 * @param headers - A Headers-like object (request headers or next/headers).
 * @returns GeoContext for localization.
 */
export function getGeoContextFromHeaders(
  headers: { get: (name: string) => string | null }
): GeoContext {
  const countryCode = detectCountryFromHeaders(headers);
  return getGeoContext(countryCode);
}
