export default function ProductLoading() {
  return (
    <div className="bg-cream min-h-screen px-6 py-12">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-16">
        <div className="aspect-[3/4] skeleton-shimmer rounded-[20px]" />
        <div className="space-y-5">
          <div className="h-3 skeleton-shimmer rounded w-24" />
          <div className="h-16 skeleton-shimmer rounded w-4/5" />
          <div className="h-10 skeleton-shimmer rounded w-32" />
          <div className="h-24 skeleton-shimmer rounded-[16px]" />
          <div className="h-14 skeleton-shimmer rounded-[14px]" />
        </div>
      </div>
    </div>
  )
}
