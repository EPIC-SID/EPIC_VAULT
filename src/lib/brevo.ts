// ─── Brevo Transactional Email Service Module ─────────────────────────────────

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || ''
const SENDER_EMAIL  = import.meta.env.VITE_BREVO_SENDER_EMAIL || 'epicsid6@gmail.com'
const SENDER_NAME   = import.meta.env.VITE_BREVO_SENDER_NAME || 'EPIC_VAULT Store'

/**
 * Returns the current application base URL dynamically
 */
export function getAppUrl(): string {
  if (import.meta.env.VITE_SITE_URL) {
    return import.meta.env.VITE_SITE_URL.replace(/\/$/, '')
  }
  if (typeof window !== 'undefined' && window.location.origin) {
    return window.location.origin.replace(/\/$/, '')
  }
  return 'https://epic-vault.vercel.app'
}

export interface EmailRecipient {
  email: string
  name?: string
}

export interface SendEmailPayload {
  to: EmailRecipient[]
  subject: string
  htmlContent: string
}

/**
 * Sends a transactional HTML email via Brevo REST API
 */
export async function sendBrevoEmail(payload: SendEmailPayload): Promise<boolean> {
  if (!BREVO_API_KEY) {
    console.warn('[Brevo] VITE_BREVO_API_KEY is not set in environment. Email logged to console:', payload.subject)
    return false
  }

  try {
    const res = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { email: SENDER_EMAIL, name: SENDER_NAME },
        to: payload.to,
        subject: payload.subject,
        htmlContent: payload.htmlContent,
      }),
    })

    if (!res.ok) {
      const errText = await res.text()
      console.error('[Brevo API Error]', res.status, errText)
      return false
    }

    console.log('[Brevo] Order Transactional email sent to:', payload.to[0].email)
    return true
  } catch (err) {
    console.error('[Brevo Exception]', err)
    return false
  }
}

/**
 * Sends Order Confirmation Email upon checkout
 */
export async function sendOrderConfirmationEmail(
  toEmail: string,
  customerName: string,
  orderId: string,
  totalAmount: number,
  items: Array<{ name: string; quantity: number; price: number }>
) {
  const siteUrl = getAppUrl()
  const orderTrackUrl = `${siteUrl}/orders/${orderId}`

  const fmt = (n: number) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b; font-weight: 500;">${item.name}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">${item.quantity}</td>
        <td style="padding: 12px 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; text-align: right; font-weight: 700;">${fmt(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 900; color: #2563eb; letter-spacing: -0.5px; text-decoration: none; display: inline-block; }
        .order-badge { background: #eff6ff; color: #1d4ed8; font-family: monospace; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .btn-track { background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px; display: inline-block; box-shadow: 0 2px 6px rgba(37, 99, 235, 0.35); }
        .footer { border-top: 1px solid #f1f5f9; margin-top: 32px; padding-top: 20px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <a href="${siteUrl}" class="brand" target="_blank">EPIC_VAULT</a>
          <p style="color: #64748b; font-size: 12px; margin: 4px 0 0 0;">Official Order Confirmation & Receipt</p>
        </div>

        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0;">Thank you for your order, ${customerName}! 🎉</h2>
        <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
          We have received your order <span class="order-badge">#${orderId.slice(0, 8)}</span> and our logistics team is processing it for dispatch.
        </p>

        <table class="table">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Item</th>
              <th style="padding: 10px; text-align: center; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Qty</th>
              <th style="padding: 10px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569; letter-spacing: 0.5px;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px 20px; text-align: right; margin-top: 16px;">
          <span style="font-size: 13px; color: #64748b;">Total Amount Paid: </span>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 8px;">${fmt(totalAmount)}</span>
        </div>

        <div style="text-align: center; margin: 28px 0 20px 0;">
          <a href="${orderTrackUrl}" class="btn-track" target="_blank">
            View & Track Your Order →
          </a>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px 0;">© 2026 EPIC_VAULT — Official E-Commerce Store</p>
          <p style="margin: 0;">
            <a href="${siteUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Visit EPIC_VAULT Online</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: [{ email: toEmail, name: customerName }],
    subject: `Order Confirmation #${orderId.slice(0, 8)} — EPIC_VAULT`,
    htmlContent,
  })
}

/**
 * Sends Order Status Update Email (Shipped, Out for Delivery, Delivered)
 */
export async function sendOrderStatusUpdateEmail(toEmail: string, orderId: string, newStatus: string) {
  const siteUrl = getAppUrl()
  const orderTrackUrl = `${siteUrl}/orders/${orderId}`

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f1f5f9; margin: 0; padding: 24px 12px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px 28px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05); }
        .brand { font-size: 24px; font-weight: 900; color: #2563eb; text-decoration: none; text-align: center; display: block; margin-bottom: 20px; }
        .status-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .status-title { font-size: 20px; font-weight: 800; color: #1e40af; margin: 0; }
        .btn-track { background-color: #2563eb; color: #ffffff !important; padding: 12px 28px; font-weight: 700; font-size: 14px; text-decoration: none; border-radius: 10px; display: inline-block; }
        .footer { border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <a href="${siteUrl}" class="brand" target="_blank">EPIC_VAULT</a>
        <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Order Status Update 📦</h2>
        <p style="color: #475569; font-size: 13px; line-height: 1.5;">
          Your order <strong>#${orderId.slice(0, 8)}</strong> has a new status update:
        </p>

        <div class="status-box">
          <div class="status-title">${newStatus}</div>
        </div>

        <div style="text-align: center; margin: 24px 0 16px 0;">
          <a href="${orderTrackUrl}" class="btn-track" target="_blank">
            Track Live Shipment →
          </a>
        </div>

        <div class="footer">
          <p style="margin: 0 0 6px 0;">© 2026 EPIC_VAULT — Official E-Commerce Store</p>
          <p style="margin: 0;">
            <a href="${siteUrl}" style="color: #2563eb; text-decoration: none; font-weight: 600;">Visit EPIC_VAULT Online</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  return sendBrevoEmail({
    to: [{ email: toEmail }],
    subject: `Order Status Update: ${newStatus} (#${orderId.slice(0, 8)})`,
    htmlContent,
  })
}

