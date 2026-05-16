/**
 * @file lib/booking/geo.ts
 * @description IP-based geolocation utilities for booking portal personalization.
 *
 * Detects the visitor's country from CDN-injected request headers and maps it to:
 *   - Phone country code prefix (E.164)
 *   - Local currency (ISO 4217)
 *   - Date format convention (DD/MM/YYYY vs MM/DD/YYYY)
 *
 * Supported header sources (in priority order):
 *   1. Cloudflare CDN:  CF-IPCountry
 *   2. Vercel Edge:     x-vercel-ip-country
 *   3. Generic CDN:     x-country-code
 *   4. Fallback:        'DE' (EU default)
 *
 * No external API calls are made — all data is derived from static maps.
 * This function is safe to call in Next.js Edge Middleware and Server Components.
 *
 * @compliance GDPR — IP address is NOT stored or logged by this function.
 *             Only the derived country code (non-personal) is used.
 */

import type { GeoContext } from '@/types/booking';

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
};

// ---------------------------------------------------------------------------
// DATE FORMAT EXCEPTIONS
// Most of the world uses DD/MM/YYYY; only a few countries use MM/DD/YYYY.
// ---------------------------------------------------------------------------

const MM_DD_COUNTRIES = new Set(['US', 'CA', 'PH']);

// ---------------------------------------------------------------------------
// PUBLIC API
// ---------------------------------------------------------------------------

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
 * Checks Cloudflare, Vercel, and generic CDN headers in priority order.
 * Falls back to 'DE' (EU/Germany) when no header is present.
 *
 * @param headers - A Headers-like object (from Next.js request or headers()).
 * @returns ISO 3166-1 alpha-2 country code string.
 */
export function detectCountryFromHeaders(
  headers: { get: (name: string) => string | null }
): string {
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
