export default function DashboardLoading() {
  return (
    <div className="px-6 py-8 max-w-5xl mx-auto w-full animate-pulse">
      <div className="h-6 bg-surface-200 rounded w-1/3 mb-2" />
      <div className="h-4 bg-surface-100 rounded w-1/4 mb-8" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-xl border border-surface-200 p-5">
            <div className="w-9 h-9 rounded-lg bg-surface-200 mb-3" />
            <div className="h-6 bg-surface-200 rounded w-1/2 mb-1" />
            <div className="h-3 bg-surface-100 rounded w-2/3" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="bg-white rounded-xl border border-surface-200 p-5 h-28" />
        ))}
      </div>
    </div>
  );
}
