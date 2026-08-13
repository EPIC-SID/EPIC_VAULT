// ─── Brevo Transactional Email Service Module ─────────────────────────────────

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email'

const BREVO_API_KEY = import.meta.env.VITE_BREVO_API_KEY || ''
const SENDER_EMAIL  = import.meta.env.VITE_BREVO_SENDER_EMAIL || 'epicsid6@gmail.com'
const SENDER_NAME   = import.meta.env.VITE_BREVO_SENDER_NAME || 'EPIC_VAULT Store'

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
  const fmt = (n: number) =>
    '₹' + Number(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const itemsRows = items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #1e293b;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #64748b; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #e2e8f0; font-size: 13px; color: #0f172a; text-align: right; font-weight: bold;">${fmt(item.price * item.quantity)}</td>
      </tr>`
    )
    .join('')

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; }
        .header { text-align: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 20px; margin-bottom: 24px; }
        .brand { font-size: 24px; font-weight: 800; color: #2563eb; letter-spacing: -0.5px; }
        .order-badge { background: #eff6ff; color: #1d4ed8; font-family: monospace; font-weight: 700; padding: 4px 10px; border-radius: 6px; font-size: 12px; }
        .table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .footer { border-top: 1px solid #f1f5f9; margin-top: 28px; padding-top: 16px; text-align: center; font-size: 11px; color: #94a3b8; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="brand">EPIC_VAULT</div>
          <p style="color: #64748b; font-size: 12px; margin-top: 4px;">Order Confirmation & Receipt</p>
        </div>

        <h2 style="color: #0f172a; font-size: 18px; margin: 0 0 8px 0;">Thank you for your order, ${customerName}! 🎉</h2>
        <p style="color: #475569; font-size: 13px; line-height: 1.5; margin: 0 0 16px 0;">
          We have received your order <span class="order-badge">#${orderId}</span> and our team is processing it for fast delivery.
        </p>

        <table class="table">
          <thead>
            <tr style="background-color: #f8fafc;">
              <th style="padding: 8px 10px; text-align: left; font-size: 11px; text-transform: uppercase; color: #475569;">Item</th>
              <th style="padding: 8px 10px; text-align: center; font-size: 11px; text-transform: uppercase; color: #475569;">Qty</th>
              <th style="padding: 8px 10px; text-align: right; font-size: 11px; text-transform: uppercase; color: #475569;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRows}
          </tbody>
        </table>

        <div style="background-color: #f8fafc; border-radius: 12px; padding: 16px; text-align: right; margin-top: 16px;">
          <span style="font-size: 12px; color: #64748b;">Total Amount Paid: </span>
          <span style="font-size: 20px; font-weight: 800; color: #0f172a; margin-left: 8px;">${fmt(totalAmount)}</span>
        </div>

        <div class="footer">
          © 2026 EPIC_VAULT — Pimpri Chinchwad College of Engineering, Pune
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
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 20px; }
        .container { max-width: 580px; margin: 0 auto; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; padding: 32px; }
        .brand { font-size: 24px; font-weight: 800; color: #2563eb; text-align: center; margin-bottom: 24px; }
        .status-box { background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0; }
        .status-title { font-size: 18px; font-weight: 800; color: #1e40af; margin: 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="brand">EPIC_VAULT</div>
        <h2 style="color: #0f172a; font-size: 18px;">Order Status Update 📦</h2>
        <p style="color: #475569; font-size: 13px;">
          Your order <strong>#${orderId}</strong> has a new status update:
        </p>

        <div class="status-box">
          <div class="status-title">${newStatus}</div>
        </div>

        <p style="color: #64748b; font-size: 12px;">
          You can track your live shipment details anytime in your EPIC_VAULT profile.
        </p>
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
