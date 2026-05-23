import { Resend } from "resend";

import type { TriggeredAlert } from "@/lib/alerts/evaluate-alerts";
import { createServerSupabaseClient } from "@/lib/supabase/server";

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
}

function buildEmailHtml(alerts: TriggeredAlert[]) {
  const rows = alerts
    .map(
      (alert) => `
      <tr>
        <td style="padding:12px;border-bottom:1px solid #1a2420;color:#e2e8f0;">${alert.product_name}</td>
        <td style="padding:12px;border-bottom:1px solid #1a2420;color:#94a3b8;">${alert.competitor}</td>
        <td style="padding:12px;border-bottom:1px solid #1a2420;color:#34d399;font-weight:700;">${alert.message}</td>
      </tr>`,
    )
    .join("");

  return `
    <div style="background:#060908;color:#f8fafc;font-family:Arial,sans-serif;padding:32px;">
      <h1 style="color:#10b981;margin:0 0 8px;">PriceSense Alert</h1>
      <p style="color:#94a3b8;margin:0 0 24px;">A price threshold was triggered on your tracked listing.</p>
      <table style="width:100%;border-collapse:collapse;background:#0a0f0d;border-radius:12px;overflow:hidden;">
        <thead>
          <tr style="background:#111916;">
            <th style="padding:12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;">Product</th>
            <th style="padding:12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;">Store</th>
            <th style="padding:12px;text-align:left;color:#64748b;font-size:12px;text-transform:uppercase;">Signal</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#64748b;font-size:12px;margin-top:24px;">Competitor Price Intelligence Engine</p>
    </div>`;
}

export async function sendTriggeredAlertEmails(
  productId: string,
  triggeredAlerts: TriggeredAlert[],
) {
  if (triggeredAlerts.length === 0) return { sent: 0 };

  const resend = getResendClient();
  if (!resend) return { sent: 0, skipped: "RESEND_API_KEY not set" };

  const supabase = createServerSupabaseClient();

  const { data: product } = await supabase
    .from("products")
    .select("user_id")
    .eq("id", productId)
    .maybeSingle();

  if (!product?.user_id) return { sent: 0, skipped: "No user on product" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("email, email_alerts_enabled")
    .eq("id", product.user_id)
    .maybeSingle();

  if (!profile?.email || profile.email_alerts_enabled === false) {
    return { sent: 0, skipped: "Alerts disabled or no email" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() ?? "PriceSense <onboarding@resend.dev>";

  await resend.emails.send({
    from,
    to: profile.email,
    subject: `Price alert: ${triggeredAlerts[0].product_name}`,
    html: buildEmailHtml(triggeredAlerts),
  });

  return { sent: 1, to: profile.email };
}
