import nodemailer from 'nodemailer'

export interface OrderEmailItem {
  name: string
  size: string
  color: string
  quantity: number
  price: number
}

export interface OrderEmailData {
  orderId: string
  customerName: string
  email: string
  phone?: string
  items: OrderEmailItem[]
  subtotal?: number
  deliveryFee?: number
  total: number
  fulfillment: {
    type: 'delivery' | 'pickup'
    address?: string
    city?: string
    deliveryArea?: string
    deliveryDuration?: string
  }
}

const BRAND_NAME = 'Zayed'

function esc(value: string | number) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function getTransporter() {
  const gmailUser = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPassword) return null

  return nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPassword },
  })
}

function shell(content: string, title: string) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0E8;font-family:'Georgia',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F0E8;padding:40px 20px;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;background:#FAFAF8;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(44,24,16,0.08)">
        ${content}
      </table>
    </td></tr>
  </table>
</body>
</html>`
}

function header(label: string) {
  return `<tr><td style="background:#1E4D3A;padding:40px;text-align:center;">
    <p style="margin:0;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(245,240,232,0.6);font-family:Inter,sans-serif">${esc(label)}</p>
    <h1 style="margin:8px 0 0;font-family:Georgia,serif;font-style:italic;font-weight:300;font-size:36px;color:#F5F0E8;letter-spacing:-0.02em">${BRAND_NAME}</h1>
    <div style="width:40px;height:2px;background:#E8A820;margin:16px auto 0"></div>
  </td></tr>`
}

function footer() {
  return `<tr><td style="padding:40px 48px;text-align:center;margin-top:32px">
    <div style="border-top:1px solid rgba(44,24,16,0.08);padding-top:32px">
      <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:18px;color:#2C1810">${BRAND_NAME}</p>
      <p style="margin:8px 0 0;font-family:Inter,sans-serif;font-size:12px;color:#6B5B4E">Handcrafted in Egypt with love 🌿</p>
      <p style="margin:16px 0 0;font-family:Inter,sans-serif;font-size:11px;color:rgba(44,24,16,0.3)">Questions? Reply to this email or message us on WhatsApp.</p>
    </div>
  </td></tr>`
}

function buildReceiptHtml(data: OrderEmailData) {
  const orderNumber = data.orderId.toString().slice(-6).toUpperCase()
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const subtotal = data.subtotal ?? data.total - (data.deliveryFee ?? 0)
  const deliveryFee = data.deliveryFee ?? 0
  const items = data.items.map((item) => `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:12px;border-bottom:1px solid rgba(44,24,16,0.08);padding-bottom:12px">
      <tr>
        <td>
          <p style="margin:0;font-family:Inter,sans-serif;font-size:14px;font-weight:500;color:#2C1810">${esc(item.name)}</p>
          <p style="margin:3px 0 0;font-family:Inter,sans-serif;font-size:12px;color:#6B5B4E">${esc(item.size)} · ${esc(item.color)} · Qty ${item.quantity}</p>
        </td>
        <td align="right">
          <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:16px;color:#C94B2C">EGP ${(item.price * item.quantity).toLocaleString('en-EG')}</p>
        </td>
      </tr>
    </table>`).join('')

  return shell(`
    ${header('New Order Confirmed')}
    <tr><td style="padding:40px 48px 0">
      <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:24px;color:#2C1810;line-height:1.3">Thank you, ${esc(data.customerName)}</p>
      <p style="margin:12px 0 0;font-family:Inter,sans-serif;font-size:15px;color:#6B5B4E;line-height:1.6">We've received your order and will confirm it once payment is received on WhatsApp. Your order details are below.</p>
    </td></tr>
    <tr><td style="padding:24px 48px 0">
      <div style="background:#F5F0E8;border-radius:12px;padding:16px 20px;border-left:3px solid #C94B2C">
        <p style="margin:0;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Order Reference</p>
        <p style="margin:4px 0 0;font-family:Inter,sans-serif;font-size:18px;font-weight:600;color:#2C1810;letter-spacing:0.05em">#${orderNumber}</p>
      </div>
    </td></tr>
    <tr><td style="padding:32px 48px 0">
      <p style="margin:0 0 16px;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Your Items</p>
      ${items}
    </td></tr>
    <tr><td style="padding:20px 48px 0">
      <table width="100%" cellpadding="0" cellspacing="0"><tr>
        <td style="font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Order Subtotal</td>
        <td align="right" style="font-family:Inter,sans-serif;font-size:15px;color:#2C1810">EGP ${subtotal.toLocaleString('en-EG')}</td>
      </tr>
      <tr>
        <td style="padding-top:10px;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Delivery</td>
        <td align="right" style="padding-top:10px;font-family:Inter,sans-serif;font-size:15px;color:#2C1810">EGP ${deliveryFee.toLocaleString('en-EG')}</td>
      </tr>
      <tr>
        <td style="padding-top:14px;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Order Total</td>
        <td align="right" style="padding-top:14px;font-family:Georgia,serif;font-style:italic;font-size:28px;color:#2C1810">EGP ${data.total.toLocaleString('en-EG')}</td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:28px 48px 0">
      <div style="background:#F0F7F4;border-radius:14px;padding:24px;border:1px solid rgba(74,155,127,0.2)">
        <p style="margin:0 0 14px;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#4A9B7F">Complete Your Payment</p>
        <p style="margin:0 0 12px;font-family:Inter,sans-serif;font-size:14px;color:#2C1810">Please send <strong>EGP ${data.total.toLocaleString('en-EG')}</strong> via one of these methods:</p>
        <p style="margin:0 0 6px;font-family:Inter,sans-serif;font-size:14px;color:#2C1810">💳 <strong>InstaPay:</strong> ${esc(process.env.NEXT_PUBLIC_INSTAPAY_NUMBER || '')}</p>
        <p style="margin:0;font-family:Inter,sans-serif;font-size:14px;color:#2C1810">📱 <strong>Vodafone Cash:</strong> ${esc(process.env.NEXT_PUBLIC_VODAFONE_CASH_NUMBER || '')}</p>
        <p style="margin:14px 0 0;font-family:Inter,sans-serif;font-size:13px;color:#6B5B4E">Then send your payment screenshot on WhatsApp to confirm your order. 💬</p>
      </div>
    </td></tr>
    <tr><td style="padding:24px 48px 0">
      <table width="100%" cellpadding="0" cellspacing="0"><tr valign="top">
        <td width="50%">
          <p style="margin:0;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">${data.fulfillment.type === 'delivery' ? 'Delivery Address' : 'Pickup'}</p>
          <p style="margin:6px 0 0;font-family:Inter,sans-serif;font-size:14px;color:#2C1810;line-height:1.5">${data.fulfillment.type === 'delivery' ? `${esc(data.fulfillment.address || '')}, ${esc(data.fulfillment.city || '')}<br/>${esc(data.fulfillment.deliveryArea || '')}${data.fulfillment.deliveryDuration ? ` · ${esc(data.fulfillment.deliveryDuration)} hours` : ''}` : 'Store pickup selected'}</p>
        </td>
        <td width="50%" align="right">
          <p style="margin:0;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Contact</p>
          <p style="margin:6px 0 0;font-family:Inter,sans-serif;font-size:14px;color:#2C1810">${esc(data.phone || '')}</p>
        </td>
      </tr></table>
    </td></tr>
    <tr><td style="padding:32px 48px 0;text-align:center">
      <a href="${siteURL}/order/${esc(data.orderId)}" style="display:inline-block;background:#1E4D3A;color:#F5F0E8;font-family:Inter,sans-serif;font-size:14px;font-weight:500;letter-spacing:0.06em;text-transform:uppercase;text-decoration:none;padding:14px 32px;border-radius:50px">Track My Order →</a>
    </td></tr>
    ${footer()}
  `, `Your Order — ${BRAND_NAME}`)
}

function buildStatusHtml(data: { customerName: string; orderId: string; newStatus: 'confirmed' | 'shipped' | 'delivered'; total: number }) {
  const copy = {
    confirmed: ['Your order is confirmed! 🎉', "We've received your payment and are preparing your order.", '#4A9B7F'],
    shipped: ['Your order is on its way! 📦', 'Your pieces are headed to you. Expected delivery: 2–3 business days.', '#1E4D3A'],
    delivered: ['Order delivered! 🌿', 'We hope you love your new pieces. Tag us on Instagram!', '#E8A820'],
  }[data.newStatus]
  const siteURL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return shell(`
    ${header('Order Status Updated')}
    <tr><td style="padding:44px 48px 0;text-align:center">
      <p style="margin:0;font-family:Georgia,serif;font-style:italic;font-size:28px;color:#2C1810;line-height:1.25">${copy[0]}</p>
      <p style="margin:14px auto 0;font-family:Inter,sans-serif;font-size:15px;color:#6B5B4E;line-height:1.6;max-width:420px">Hi ${esc(data.customerName)}, ${copy[1]}</p>
      <div style="background:#F5F0E8;border-radius:14px;padding:18px 20px;margin:28px 0;border-top:3px solid ${copy[2]}">
        <p style="margin:0;font-family:Inter,sans-serif;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;color:#6B5B4E">Order Reference</p>
        <p style="margin:4px 0 0;font-family:Inter,sans-serif;font-size:18px;font-weight:600;color:#2C1810">#${esc(data.orderId.toString().slice(-6).toUpperCase())}</p>
        <p style="margin:10px 0 0;font-family:Georgia,serif;font-style:italic;font-size:24px;color:#2C1810">EGP ${data.total.toLocaleString('en-EG')}</p>
      </div>
      <a href="${siteURL}/order/${esc(data.orderId)}" style="display:inline-block;background:#1E4D3A;color:#F5F0E8;font-family:Inter,sans-serif;font-size:14px;font-weight:500;text-decoration:none;padding:14px 32px;border-radius:50px">View Order →</a>
    </td></tr>
    ${footer()}
  `, `Order Update — ${BRAND_NAME}`)
}

export async function sendReceiptEmail(data: OrderEmailData): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter()
  if (!transporter || !process.env.GMAIL_USER) {
    console.error('[mailer] GMAIL_USER or GMAIL_APP_PASSWORD is not set — skipping email.')
    return { success: false, error: 'Email credentials not configured.' }
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: `Your Order — ${BRAND_NAME} #${data.orderId.toString().slice(-6).toUpperCase()}`,
      html: buildReceiptHtml(data),
    })
    return { success: true }
  } catch (err) {
    console.error('[mailer] Failed to send receipt email:', (err as Error).message)
    return { success: false, error: (err as Error).message }
  }
}

export async function sendOrderStatusEmail(data: {
  customerName: string
  email: string
  orderId: string
  newStatus: 'confirmed' | 'shipped' | 'delivered'
  total: number
}): Promise<{ success: boolean; error?: string }> {
  const transporter = getTransporter()
  if (!transporter || !process.env.GMAIL_USER) {
    console.error('[mailer] GMAIL_USER or GMAIL_APP_PASSWORD is not set — skipping status email.')
    return { success: false, error: 'Email credentials not configured.' }
  }

  try {
    await transporter.sendMail({
      from: `"${BRAND_NAME}" <${process.env.GMAIL_USER}>`,
      to: data.email,
      subject: `Order ${data.newStatus} — ${BRAND_NAME} #${data.orderId.toString().slice(-6).toUpperCase()}`,
      html: buildStatusHtml(data),
    })
    return { success: true }
  } catch (err) {
    console.error('[mailer] Failed to send status email:', (err as Error).message)
    return { success: false, error: (err as Error).message }
  }
}
