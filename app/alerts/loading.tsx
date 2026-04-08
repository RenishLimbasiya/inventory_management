export default function AlertsLoading() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-48 bg-white/10 rounded animate-pulse"></div>
        <div className="h-4 w-80 bg-white/10 rounded animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="glass rounded-lg p-6 animate-pulse border border-white/10"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                <div className="h-6 w-32 bg-white/10 rounded mb-2"></div>
              </div>
              <div className="w-3 h-3 bg-white/10 rounded-full"></div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <div className="h-3 w-16 bg-white/10 rounded mb-1"></div>
                <div className="h-5 w-12 bg-white/10 rounded"></div>
              </div>
              <div>
                <div className="h-3 w-16 bg-white/10 rounded mb-1"></div>
                <div className="h-5 w-12 bg-white/10 rounded"></div>
              </div>
            </div>

            <div className="flex gap-2">
              <div className="h-8 flex-1 bg-white/10 rounded"></div>
              <div className="h-8 flex-1 bg-white/10 rounded"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
