'use client'

import { CheckCircle2, Info, X, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastMessage {
  id: string
  message: string
  type: ToastType
  exiting?: boolean
}

const TYPE_STYLES: Record<ToastType, { Icon: typeof CheckCircle2; iconClass: string }> = {
  success: { Icon: CheckCircle2, iconClass: 'text-mint' },
  error: { Icon: XCircle, iconClass: 'text-terracotta' },
  info: { Icon: Info, iconClass: 'text-mustard' },
}

export default function Toast({
  toasts,
  dismiss,
}: {
  toasts: ToastMessage[]
  dismiss: (id: string) => void
}) {
  return (
    <div className="fixed bottom-6 right-6 z-[300] flex flex-col gap-3">
      {toasts.map((toast) => {
        const { Icon, iconClass } = TYPE_STYLES[toast.type]
        return (
          <div
            key={toast.id}
            className={`
              bg-forest text-cream rounded-[14px] px-5 py-4 shadow-warm-lg
              min-w-[280px] max-w-[360px] flex items-start gap-3 transition-all duration-300
              ${toast.exiting ? 'translate-x-full opacity-0' : 'animate-fade-up'}
            `}
          >
            <Icon size={20} className={`${iconClass} mt-0.5 flex-shrink-0`} />
            <p className="text-sm leading-relaxed flex-1">{toast.message}</p>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              aria-label="Dismiss notification"
              className="text-cream/60 hover:text-cream transition-colors duration-200"
            >
              <X size={16} />
            </button>
          </div>
        )
      })}
    </div>
  )
}
