export default function ProductDetailLoading() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 bg-white/10 rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-white/10 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-32 bg-white/10 rounded animate-pulse"></div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-8 w-20 bg-white/10 rounded animate-pulse"></div>
          <div className="h-8 w-24 bg-white/10 rounded animate-pulse"></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass rounded-lg p-6 animate-pulse">
            <div className="h-6 w-40 bg-white/10 rounded mb-4"></div>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-10 bg-white/10 rounded"></div>
                <div className="h-10 bg-white/10 rounded"></div>
              </div>
              <div className="h-20 bg-white/10 rounded"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-10 bg-white/10 rounded"></div>
                <div className="h-10 bg-white/10 rounded"></div>
                <div className="h-10 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-6 animate-pulse">
            <div className="h-6 w-48 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex items-center gap-4 p-3 glass rounded-lg"
                >
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
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass rounded-lg p-6 animate-pulse">
            <div className="h-6 w-32 bg-white/10 rounded mb-4"></div>
            <div className="space-y-4">
              <div>
                <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                <div className="h-6 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="h-px bg-white/10"></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="h-4 bg-white/10 rounded"></div>
                <div className="h-4 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>

          <div className="glass rounded-lg p-6 animate-pulse">
            <div className="h-6 w-36 bg-white/10 rounded mb-4"></div>
            <div className="space-y-3">
              <div className="flex justify-between">
                <div className="h-4 w-20 bg-white/10 rounded"></div>
                <div className="h-4 w-16 bg-white/10 rounded"></div>
              </div>
              <div className="flex justify-between">
                <div className="h-4 w-24 bg-white/10 rounded"></div>
                <div className="h-4 w-20 bg-white/10 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
