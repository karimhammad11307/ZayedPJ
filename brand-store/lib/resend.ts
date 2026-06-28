/**
 * lib/resend.ts  (now powered by Nodemailer + Gmail)
 *
 * Branded order receipt email via Nodemailer.
 *
 * Security notes:
 *   - GMAIL_USER and GMAIL_APP_PASSWORD are read from env only; no fallback.
 *   - Customer PII (email, name) is only used for addressing; never logged.
 *   - HTML is fully server-generated (no user-supplied raw HTML).
 *   - All dynamic values are HTML-escaped to prevent XSS in email clients.
 *   - Email sending is non-blocking (fire-and-forget) in the order API route
 *     so a mail failure never prevents order creation.
 */

import nodemailer from 'nodemailer'

/* ── Types ── */
export interface OrderEmailItem {
  name:     string
  size:     string
  color:    string
  quantity: number
  price:    number
}

export interface OrderEmailData {
  orderId:      string
  customerName: string
  email:        string
  items:        OrderEmailItem[]
  total:        number
  fulfillment: {
    type:     'delivery' | 'pickup'
    address?: string
    city?:    string
  }
}

/* ── Brand constants (safe server-side values) ── */
const BRAND_NAME = 'ZAYED Clothing CO.'
const MINT       = '#4A9B7F'
const FOREST     = '#1E4D3A'
const CREAM      = '#F5F0E8'
const BROWN      = '#2C1810'

/**
 * Build a branded HTML receipt email.
 * All values are escaped to prevent any accidental XSS in email clients.
 */
function buildReceiptHtml(data: OrderEmailData): string {
  const esc = (s: string | number) =>
    String(s)
      .replace(/&/g,  '&amp;')
      .replace(/</g,  '&lt;')
      .replace(/>/g,  '&gt;')
      .replace(/"/g,  '&quot;')

  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding:10px 0; border-bottom:1px solid #E8E2D8; color:${BROWN}; font-family:Inter,sans-serif; font-size:14px;">
          ${esc(item.name)}<br/>
          <span style="color:#6B5B4E; font-size:12px;">${esc(item.size)} · ${esc(item.color)} · Qty ${esc(item.quantity)}</span>
        </td>
        <td style="padding:10px 0; border-bottom:1px solid #E8E2D8; text-align:right; color:${BROWN}; font-family:Inter,sans-serif; font-size:14px; font-weight:500;">
          EGP ${esc((item.price * item.quantity).toLocaleString())}
        </td>
      </tr>`
    )
    .join('')

  const fulfillmentInfo =
    data.fulfillment.type === 'delivery'
      ? `Delivery to ${esc(data.fulfillment.address ?? '')}${data.fulfillment.city ? `, ${esc(data.fulfillment.city)}` : ''}`
      : 'Store Pickup'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Order Confirmation — ${esc(BRAND_NAME)}</title>
</head>
<body style="margin:0; padding:0; background-color:${CREAM}; font-family:Inter,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${CREAM}; padding:40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#FAFAF8; border-radius:14px; overflow:hidden; box-shadow:0 2px 16px rgba(44,24,16,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:${FOREST}; padding:32px 40px; text-align:center;">
              <h1 style="margin:0; font-family:Georgia,serif; font-style:italic; font-weight:300; font-size:28px; color:#FAFAF8; letter-spacing:0.02em;">
                ${esc(BRAND_NAME)}
              </h1>
              <p style="margin:8px 0 0; color:#A8C9BC; font-size:13px; letter-spacing:0.08em; text-transform:uppercase;">
                Order Confirmation
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">

              <p style="margin:0 0 8px; color:#6B5B4E; font-size:13px; text-transform:uppercase; letter-spacing:0.08em;">
                Order ID
              </p>
              <p style="margin:0 0 24px; color:${BROWN}; font-size:20px; font-family:Georgia,serif; font-style:italic; font-weight:300;">
                #${esc(data.orderId)}
              </p>

              <p style="margin:0 0 4px; color:${BROWN}; font-size:14px;">
                Hello, <strong>${esc(data.customerName)}</strong> 👋
              </p>
              <p style="margin:0 0 32px; color:#6B5B4E; font-size:14px; line-height:1.6;">
                Thank you for your order! We've received your request and will confirm it shortly via WhatsApp.
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid #E8E2D8; margin-bottom:24px;">
                ${itemRows}
              </table>

              <!-- Total -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td style="padding:16px; background-color:${CREAM}; border-radius:8px;">
                    <span style="color:#6B5B4E; font-size:13px; text-transform:uppercase; letter-spacing:0.06em;">Total</span>
                    <span style="float:right; color:${BROWN}; font-size:20px; font-family:Georgia,serif; font-style:italic; font-weight:300;">
                      EGP ${esc(data.total.toLocaleString())}
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Fulfillment -->
              <p style="margin:0 0 4px; color:#6B5B4E; font-size:12px; text-transform:uppercase; letter-spacing:0.08em;">
                Fulfillment
              </p>
              <p style="margin:0 0 32px; color:${BROWN}; font-size:14px;">
                ${fulfillmentInfo}
              </p>

              <!-- Payment instructions -->
              <div style="background:${CREAM}; border-left:3px solid ${MINT}; padding:16px 20px; border-radius:0 8px 8px 0; margin-bottom:32px;">
                <p style="margin:0 0 8px; color:${BROWN}; font-size:13px; font-weight:600; text-transform:uppercase; letter-spacing:0.06em;">
                  Payment Instructions
                </p>
                <p style="margin:0; color:#6B5B4E; font-size:13px; line-height:1.6;">
                  Send your payment via <strong>InstaPay</strong> or <strong>VodafoneCash</strong>,
                  then send a screenshot on WhatsApp to confirm your order.
                </p>
              </div>

              <!-- Track order button -->
              <div style="text-align:center; margin-bottom:32px;">
                <a href="${esc(process.env.NEXT_PUBLIC_SITE_URL ?? '')}/order/${esc(data.orderId)}"
                   style="display:inline-block; background-color:${MINT}; color:#ffffff; text-decoration:none;
                          padding:14px 32px; border-radius:14px; font-size:14px; font-family:Inter,sans-serif;
                          font-weight:500; letter-spacing:0.02em;">
                  Track My Order
                </a>
              </div>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:${FOREST}; padding:24px 40px; text-align:center;">
              <p style="margin:0; color:#A8C9BC; font-size:12px;">
                © ${new Date().getFullYear()} ${esc(BRAND_NAME)} · All rights reserved
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Send a branded order receipt email to the customer.
 * Resolves to { success: true } or { success: false, error } — never throws.
 *
 * The transporter is created lazily at call-time (not at module load time)
 * so that missing env vars do not crash the Next.js build.
 */
export async function sendReceiptEmail(
  data: OrderEmailData
): Promise<{ success: boolean; error?: string }> {
  const gmailUser     = process.env.GMAIL_USER
  const gmailPassword = process.env.GMAIL_APP_PASSWORD

  if (!gmailUser || !gmailPassword) {
    console.error('[mailer] GMAIL_USER or GMAIL_APP_PASSWORD is not set — skipping email.')
    return { success: false, error: 'Email credentials not configured.' }
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user: gmailUser, pass: gmailPassword },
  })

  try {
    await transporter.sendMail({
      from:    `"${BRAND_NAME}" <${gmailUser}>`,
      to:      data.email,
      subject: `Order Confirmed — #${data.orderId} · ${BRAND_NAME}`,
      html:    buildReceiptHtml(data),
    })
    return { success: true }
  } catch (err) {
    // Log safe error only — never log email address
    console.error('[mailer] Failed to send receipt email:', (err as Error).message)
    return { success: false, error: (err as Error).message }
  }
}

