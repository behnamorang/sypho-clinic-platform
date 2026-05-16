/**
 * @file components/booking/steps/service-selection.tsx
 * @description Step 1: Service & Specialty Selection.
 *
 * Fetches appointment types from the clinic's public services API and renders
 * them as rich, selectable cards with duration, price, and description.
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import type { PublicServiceProfile, GeoContext } from '@/types/booking';

// ---------------------------------------------------------------------------
// PROPS
// ---------------------------------------------------------------------------

interface ServiceSelectionProps {
  clinicSlug:      string;
  geo:             GeoContext;
  onSelect:        (service: PublicServiceProfile) => void;
  selectedService: PublicServiceProfile | null;
}

// ---------------------------------------------------------------------------
// PRICE FORMATTING
// ---------------------------------------------------------------------------

function formatPrice(
  priceCents: number | null,
  currencyCode: string,
  displayCurrencyCode: string,
  currencySymbol: string,
): string {
  if (priceCents === null) return 'Price on consultation';
  const amount = priceCents / 100;

  // Show price in clinic currency if it matches visitor currency, else show both
  if (currencyCode === displayCurrencyCode) {
    return `${currencySymbol} ${amount.toFixed(2)}`;
  }
  return `${currencyCode} ${amount.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// SERVICE CARD SKELETON
// ---------------------------------------------------------------------------

function ServiceSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="rounded-xl border border-surface-200 p-4 animate-pulse">
          <div className="h-4 bg-surface-100 rounded w-2/3 mb-2" />
          <div className="h-3 bg-surface-100 rounded w-full mb-1" />
          <div className="h-3 bg-surface-100 rounded w-4/5" />
          <div className="flex gap-3 mt-4">
            <div className="h-5 bg-surface-100 rounded w-16" />
            <div className="h-5 bg-surface-100 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// COMPONENT
// ---------------------------------------------------------------------------

/**
 * Step 1 of the booking wizard.
 * Fetches and displays the clinic's online-bookable appointment types.
 */
export function ServiceSelection({
  clinicSlug,
  geo,
  onSelect,
  selectedService,
}: ServiceSelectionProps) {
  const [services, setServices] = useState<PublicServiceProfile[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [errorMsg, setErrorMsg]     = useState<string | null>(null);

  const fetchServices = useCallback(async () => {
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const res  = await fetch(`/api/booking/${encodeURIComponent(clinicSlug)}/services`);
      const json = await res.json() as { data: PublicServiceProfile[] | null; error: { message: string } | null };

      if (!res.ok || json.error) {
        setErrorMsg(json.error?.message ?? 'Failed to load services.');
        return;
      }
      setServices(json.data ?? []);
    } catch {
      setErrorMsg('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [clinicSlug]);

  useEffect(() => {
    void fetchServices();
  }, [fetchServices]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-4 bg-surface-100 rounded w-1/3 animate-pulse" />
        <ServiceSkeleton />
      </div>
    );
  }

  if (errorMsg) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-danger-600 font-medium">{errorMsg}</p>
        <button
          onClick={() => void fetchServices()}
          className="mt-3 text-sm text-brand-600 hover:text-brand-700 underline"
        >
          Try again
        </button>
      </div>
    );
  }

  if (services.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-sm text-surface-500">No services are currently available for online booking.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div>
        <h2 className="text-lg font-bold text-surface-900">Choose a service</h2>
        <p className="text-sm text-surface-500 mt-0.5">Select the type of appointment you need.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {services.map((service) => {
          const isSelected = selectedService?.id === service.id;

          return (
            <button
              key={service.id}
              onClick={() => onSelect(service)}
              aria-pressed={isSelected}
              className={[
                'relative text-left rounded-xl border-2 p-4 transition-all duration-150',
                'focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2',
                isSelected
                  ? 'border-brand-500 bg-brand-50 shadow-md shadow-brand-100'
                  : 'border-surface-200 bg-white hover:border-brand-300 hover:bg-brand-50/30',
              ].join(' ')}
            >
              {/* Color stripe */}
              <span
                aria-hidden="true"
                className="absolute top-3 right-3 w-2.5 h-2.5 rounded-full ring-2 ring-white"
                style={{ backgroundColor: service.color }}
              />

              {/* Selected checkmark */}
              {isSelected && (
                <span
                  aria-hidden="true"
                  className="absolute top-2.5 right-2.5 w-5 h-5 bg-brand-600 rounded-full flex items-center justify-center"
                >
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
              )}

              <h3 className="text-sm font-semibold text-surface-900 pr-6">{service.name}</h3>

              {service.description && (
                <p className="text-xs text-surface-500 mt-1 line-clamp-2">{service.description}</p>
              )}

              <div className="flex items-center gap-3 mt-3">
                {/* Duration */}
                <span className="inline-flex items-center gap-1 text-xs font-medium text-surface-600 bg-surface-100 px-2 py-1 rounded-full">
                  <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {service.duration_minutes} min
                </span>

                {/* Price */}
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-surface-700 bg-surface-100 px-2 py-1 rounded-full">
                  {formatPrice(
                    service.price_cents,
                    service.currency_code,
                    geo.currencyCode,
                    geo.currencySymbol,
                  )}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
