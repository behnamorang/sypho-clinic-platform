/**
 * @file app/[clinicSlug]/booking/loading.tsx
 * @description Loading skeleton for the clinic booking page.
 * Shown while Next.js server-fetches the clinic data.
 */

export default function BookingLoading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">

        {/* Clinic header skeleton */}
        <div className="text-center mb-8 animate-pulse">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-surface-200 mb-4" />
          <div className="h-5 bg-surface-200 rounded-full w-48 mx-auto mb-2" />
          <div className="h-3.5 bg-surface-100 rounded-full w-32 mx-auto" />
        </div>

        {/* Card skeleton */}
        <div className="bg-white rounded-2xl shadow-card-lg border border-surface-100 p-6 animate-pulse">
          {/* Progress bar skeleton */}
          <div className="flex items-center justify-between mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-1.5">
                  <div className="w-9 h-9 rounded-full bg-surface-200" />
                  <div className="h-2.5 w-12 bg-surface-100 rounded" />
                </div>
                {i < 4 && <div className="h-0.5 flex-1 mx-2 mt-[-16px] bg-surface-100 rounded-full" />}
              </div>
            ))}
          </div>

          <div className="h-1 bg-surface-100 rounded-full mb-6" />

          {/* Content skeleton */}
          <div className="space-y-3">
            <div className="h-5 bg-surface-200 rounded w-1/3" />
            <div className="h-3.5 bg-surface-100 rounded w-2/3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border border-surface-200 p-4 h-24 bg-surface-50" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
