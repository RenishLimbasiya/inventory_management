export default function MovementsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-64 bg-white/10 rounded animate-pulse"></div>
        <div className="h-4 w-96 bg-white/10 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="glass rounded-lg p-4 border border-white/10 animate-pulse"
          >
            <div className="h-3 w-16 bg-white/10 rounded mb-2"></div>
            <div className="h-6 w-8 bg-white/10 rounded mx-auto"></div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="glass rounded-lg p-4 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-2 h-2 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-3/4"></div>
              </div>
              <div className="text-right">
                <div className="h-4 bg-white/10 rounded mb-1"></div>
                <div className="h-3 bg-white/10 rounded w-16"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
