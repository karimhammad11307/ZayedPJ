export default function ShopLoading() {
  return (
    <div className="bg-cream min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="h-20 skeleton-shimmer rounded-[16px] mb-8" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="bg-white rounded-[16px] overflow-hidden border border-brown/5 shadow-warm-sm">
              <div className="aspect-[3/4] skeleton-shimmer" />
              <div className="p-4 space-y-2">
                <div className="h-3 skeleton-shimmer rounded w-16" />
                <div className="h-4 skeleton-shimmer rounded w-full" />
                <div className="h-5 skeleton-shimmer rounded w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
