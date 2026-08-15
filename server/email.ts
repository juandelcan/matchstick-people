import { Resend } from "resend";
import { ENV } from "./_core/env";

// Lazily constructed: the Resend SDK throws at construction time if the key is
// missing, which would take the whole server down on boot.
let _resend: Resend | null = null;
function getResend(): Resend {
  if (!_resend) {
    if (!ENV.resendApiKey) throw new Error("RESEND_API_KEY is not set");
    _resend = new Resend(ENV.resendApiKey);
  }
  return _resend;
}

// ── Sender address ────────────────────────────────────────────────────────────
// While the domain is not yet verified in Resend, we use the Resend sandbox
// address. Once thematchstickpeople.com is verified, change this to:
// "The Matchstick People <orders@thematchstickpeople.com>"
const FROM_ADDRESS = ENV.fromAddress;

export interface OrderConfirmationData {
  customerName: string;
  customerEmail: string;
  orderId: string;
  items: Array<{
    name: string;
    size: string;
    quantity: number;
    price: string;
  }>;
  total: string;
  shippingAddress: {
    name: string;
    line1: string;
    line2?: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

// Exported for testing
export function buildOrderConfirmationHtmlForTest(data: OrderConfirmationData): string {
  return buildOrderConfirmationHtml(data);
}

function buildOrderConfirmationHtml(data: OrderConfirmationData): string {
  const itemRows = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E0; font-family: 'Georgia', serif; font-size: 14px; color: #0D0C0A;">
          ${item.name}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E0; font-family: monospace; font-size: 12px; color: #6B6560; text-align: center;">
          ${item.size}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E0; font-family: monospace; font-size: 12px; color: #6B6560; text-align: center;">
          ${item.quantity}
        </td>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDE9E0; font-family: monospace; font-size: 12px; color: #0D0C0A; text-align: right;">
          ${item.price}
        </td>
      </tr>
    `
    )
    .join("");

  const shippingLine2 = data.shippingAddress.line2
    ? `<br>${data.shippingAddress.line2}`
    : "";

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Order Confirmed — The Matchstick People</title>
</head>
<body style="margin: 0; padding: 0; background-color: #F5F0E8; font-family: 'Georgia', serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F5F0E8; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="padding: 0 0 32px; text-align: center; border-bottom: 2px solid #0D0C0A;">
              <p style="margin: 0 0 4px; font-family: monospace; font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #C8251A;">
                The Matchstick People
              </p>
              <h1 style="margin: 0; font-family: 'Georgia', serif; font-size: 36px; font-weight: 300; letter-spacing: -0.02em; color: #0D0C0A; line-height: 1.1;">
                Order Confirmed.
              </h1>
            </td>
          </tr>

          <!-- Greeting -->
          <tr>
            <td style="padding: 32px 0 24px;">
              <p style="margin: 0 0 12px; font-size: 15px; color: #0D0C0A; line-height: 1.7;">
                Hi ${data.customerName.split(" ")[0]},
              </p>
              <p style="margin: 0; font-size: 15px; color: #6B6560; line-height: 1.7;">
                Thank you for your order. We've received your payment and your tee is heading to production. 
                You'll receive a shipping notification with tracking details once it's on its way.
              </p>
            </td>
          </tr>

          <!-- Order reference -->
          <tr>
            <td style="padding: 0 0 24px;">
              <p style="margin: 0; font-family: monospace; font-size: 11px; letter-spacing: 0.12em; text-transform: uppercase; color: #9B948C;">
                Order reference: <span style="color: #0D0C0A;">${data.orderId}</span>
              </p>
            </td>
          </tr>

          <!-- Items table -->
          <tr>
            <td style="padding: 0 0 32px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <thead>
                  <tr>
                    <th style="padding: 0 0 12px; font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9B948C; font-weight: 400; text-align: left; border-bottom: 1px solid #D5CFC4;">Item</th>
                    <th style="padding: 0 0 12px; font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9B948C; font-weight: 400; text-align: center; border-bottom: 1px solid #D5CFC4;">Size</th>
                    <th style="padding: 0 0 12px; font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9B948C; font-weight: 400; text-align: center; border-bottom: 1px solid #D5CFC4;">Qty</th>
                    <th style="padding: 0 0 12px; font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9B948C; font-weight: 400; text-align: right; border-bottom: 1px solid #D5CFC4;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
                <tfoot>
                  <tr>
                    <td colspan="3" style="padding: 16px 0 0; font-family: monospace; font-size: 11px; letter-spacing: 0.1em; text-transform: uppercase; color: #6B6560; text-align: right;">Total</td>
                    <td style="padding: 16px 0 0; font-family: monospace; font-size: 14px; font-weight: 700; color: #0D0C0A; text-align: right;">${data.total}</td>
                  </tr>
                </tfoot>
              </table>
            </td>
          </tr>

          <!-- Shipping address -->
          <tr>
            <td style="padding: 24px; background-color: #EDE9E0; margin-bottom: 32px;">
              <p style="margin: 0 0 8px; font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9B948C;">
                Shipping to
              </p>
              <p style="margin: 0; font-size: 14px; color: #0D0C0A; line-height: 1.7;">
                ${data.shippingAddress.name}<br>
                ${data.shippingAddress.line1}${shippingLine2}<br>
                ${data.shippingAddress.city}, ${data.shippingAddress.state} ${data.shippingAddress.zip}<br>
                ${data.shippingAddress.country}
              </p>
            </td>
          </tr>

          <!-- Spacer -->
          <tr><td style="height: 32px;"></td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 0 0; border-top: 1px solid #D5CFC4; text-align: center;">
              <p style="margin: 0 0 8px; font-family: monospace; font-size: 10px; letter-spacing: 0.14em; text-transform: uppercase; color: #9B948C;">
                Questions? Reply to this email.
              </p>
              <p style="margin: 0; font-family: monospace; font-size: 10px; letter-spacing: 0.1em; color: #C8251A; text-transform: uppercase;">
                thematchstickpeople.com
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

export async function sendOrderConfirmation(
  data: OrderConfirmationData
): Promise<{ success: boolean; error?: string }> {
  if (!ENV.resendApiKey) {
    console.warn("[Email] RESEND_API_KEY not set — skipping order confirmation email");
    return { success: false, error: "RESEND_API_KEY not configured" };
  }

  try {
    const { error } = await getResend().emails.send({
      from: FROM_ADDRESS,
      to: [data.customerEmail],
      subject: `Your Matchstick People order is confirmed — ${data.orderId}`,
      html: buildOrderConfirmationHtml(data),
    });

    if (error) {
      console.error("[Email] Resend error:", error);
      return { success: false, error: error.message };
    }

    console.log(`[Email] Order confirmation sent to ${data.customerEmail}`);
    return { success: true };
  } catch (err: any) {
    console.error("[Email] Failed to send order confirmation:", err.message);
    return { success: false, error: err.message };
  }
}
