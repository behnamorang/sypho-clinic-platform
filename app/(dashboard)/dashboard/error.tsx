'use client';

import { useEffect } from 'react';

interface ErrorProps {
  error:  Error & { digest?: string };
  reset:  () => void;
}

export default function DashboardError({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log to console so we can see it in dev server output
    // eslint-disable-next-line no-console
    console.error('[Dashboard] Rendering error:', error.message, error.stack);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-xl font-bold text-surface-900 mb-2">Dashboard Error</h1>
        <p className="text-sm text-surface-600 mb-1">{error.message}</p>
        {error.digest && (
          <p className="text-xs text-surface-400 font-mono mb-4">digest: {error.digest}</p>
        )}
        <pre className="text-left text-xs bg-surface-50 border border-surface-200 rounded p-3 overflow-auto max-h-48 mb-4">
          {error.stack}
        </pre>
        <button
          onClick={reset}
          className="px-4 py-2 bg-brand-600 text-white text-sm rounded-lg hover:bg-brand-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
