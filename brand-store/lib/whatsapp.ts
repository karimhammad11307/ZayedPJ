/**
 * lib/whatsapp.ts
 *
 * Builds a WhatsApp pre-filled message URL for the order flow.
 *
 * Security notes:
 *   - WhatsApp number is read from env (NEXT_PUBLIC_WHATSAPP_NUMBER).
 *   - The URL is built with encodeURIComponent to prevent injection.
 *   - No user-supplied data is concatenated into the URL without encoding.
 *   - Payment account numbers are from env vars only; never editable by customers.
 */

export interface WhatsAppOrderItem {
  name: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface WhatsAppOrderData {
  orderId: string
  customerName: string
  phone: string
  fulfillment: {
    type: 'delivery' | 'pickup'
    address?: string
    city?: string
    notes?: string
  }
  items: WhatsAppOrderItem[]
  total: number
}

/**
 * Formats a single line item for the WhatsApp message.
 */
function formatItem(item: WhatsAppOrderItem): string {
  const lineTotal = (item.price * item.quantity).toLocaleString('en-EG')
  return `• ${item.name} (${item.size} / ${item.color}) × ${item.quantity} — EGP ${lineTotal}`
}

/**
 * Builds the full WhatsApp redirect URL with a pre-filled message.
 * Returns null if NEXT_PUBLIC_WHATSAPP_NUMBER is not configured.
 */
export function buildWhatsAppURL(data: WhatsAppOrderData): string | null {
  const whatsappNumber   = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER
  const instapayNumber   = process.env.NEXT_PUBLIC_INSTAPAY_NUMBER
  const vodafoneNumber   = process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER
  const brandName        = 'Brand Store'

  if (!whatsappNumber) {
    console.error('[whatsapp] NEXT_PUBLIC_WHATSAPP_NUMBER is not set.')
    return null
  }

  const fulfillmentLine =
    data.fulfillment.type === 'delivery'
      ? `📦 Delivery to: ${data.fulfillment.address ?? ''}${data.fulfillment.city ? `, ${data.fulfillment.city}` : ''}${data.fulfillment.notes ? `\nNotes: ${data.fulfillment.notes}` : ''}`
      : '🛍️ Store Pickup'

  const itemLines = data.items.map(formatItem).join('\n')

  const paymentLines = [
    instapayNumber   && `• InstaPay:       ${instapayNumber}`,
    vodafoneNumber   && `• VodafoneCash:   ${vodafoneNumber}`,
  ]
    .filter(Boolean)
    .join('\n')

  const message = [
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `🌿 ${brandName} — New Order`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `📋 Order ID: #${data.orderId}`,
    `👤 Name:     ${data.customerName}`,
    `📞 Phone:    ${data.phone}`,
    ``,
    fulfillmentLine,
    ``,
    `🛒 Items:`,
    itemLines,
    ``,
    `💰 Total: EGP ${data.total.toLocaleString('en-EG')}`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `💳 Payment Instructions`,
    `━━━━━━━━━━━━━━━━━━━━━━━`,
    `Please send the total amount via:`,
    paymentLines,
    ``,
    `After payment, reply with your payment screenshot`,
    `so we can confirm your order. Thank you! 🌿`,
  ].join('\n')

  // Sanitize phone: keep only digits and leading +
  const cleanPhone = whatsappNumber.replace(/[^\d+]/g, '')

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`
}
