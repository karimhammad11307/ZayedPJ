import StoreShell from '@/components/StoreShell'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreShell>
      {/* pt-16 offsets the fixed 64px navbar */}
      <div className="pt-16">
        {children}
      </div>
    </StoreShell>
  )
}
