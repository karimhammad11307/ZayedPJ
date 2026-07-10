export default function AdminLoading() {
  return (
    <div className="min-h-screen bg-cream-light p-8">
      <div className="h-12 skeleton-shimmer rounded w-64 mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="bg-white rounded-[16px] p-6 border border-brown/5 shadow-warm-sm">
            <div className="h-10 skeleton-shimmer rounded w-24 mb-4" />
            <div className="h-3 skeleton-shimmer rounded w-20" />
          </div>
        ))}
      </div>
      <div className="h-80 skeleton-shimmer rounded-[20px]" />
    </div>
  )
}
