import nodemailer from "nodemailer";
import { logger } from "./logger";
import { LOGO_B64 } from "./logo-b64";

const GMAIL_USER = "chouiaartravelagency@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

const LOGO_SRC = `data:image/jpeg;base64,${LOGO_B64}`;

function createTransport() {
  if (!GMAIL_PASS) {
    logger.warn("GMAIL_APP_PASSWORD not set — email sending disabled");
    return null;
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });
}

export async function sendPasswordResetEmail(toEmail: string, code: string, userName?: string): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    logger.warn({ toEmail }, "Email not sent (no GMAIL_APP_PASSWORD)");
    return false;
  }

  const greeting = userName ? `مرحباً ${userName} 👋` : "مرحباً 👋";

  try {
    await transport.sendMail({
      from: `"وكالة شويعر للسياحة" <${GMAIL_USER}>`,
      to: toEmail,
      subject: "رمز استعادة كلمة المرور — وكالة شويعر",
      html: `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<body style="margin:0;padding:0;background:#f2f4f8;font-family:Arial,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f2f4f8;padding:32px 16px;">
    <tr>
      <td align="center">

        <!-- Card -->
        <table width="520" cellpadding="0" cellspacing="0"
          style="max-width:520px;width:100%;background:#ffffff;border-radius:16px;
                 overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.10);">

          <!-- Logo at top -->
          <tr>
            <td style="padding:0;">
              <img src="${LOGO_SRC}"
                alt="وكالة شويعر للسياحة والأسفار"
                width="520"
                style="width:100%;max-width:520px;height:auto;display:block;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 28px 24px 28px;">

              <h2 style="color:#1a1a2e;margin:0 0 10px 0;font-size:22px;text-align:center;">
                ${greeting}
              </h2>
              <p style="color:#555;font-size:15px;line-height:1.8;margin:0 0 24px 0;text-align:center;">
                لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.<br>
                استخدم الرمز التالي:
              </p>

              <!-- Code box -->
              <div style="background:#c0392b;border-radius:12px;padding:20px 24px;
                           text-align:center;margin:0 0 24px 0;">
                <p style="margin:0 0 6px 0;color:#f5c6c2;font-size:13px;letter-spacing:1px;">
                  رمز إعادة تعيين كلمة المرور
                </p>
                <span style="font-size:46px;font-weight:bold;letter-spacing:16px;
                              color:#ffffff;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>

              <!-- Warning -->
              <p style="color:#888;font-size:13px;text-align:center;margin:0;">
                ⚠️ هذا الرمز صالح لمدة <strong>30 دقيقة</strong> فقط.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;border-top:1px solid #eee;
                        padding:16px 24px;text-align:center;">
              <p style="color:#aaa;font-size:11px;margin:0;line-height:1.8;">
                © 2026 وكالة شويعر للسياحة والأسفار — CHOUIAAR TRAVEL AGENCY<br>
                <span style="font-size:10px;">هذه رسالة آلية، يرجى عدم الرد عليها</span>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`,
    });
    logger.info({ toEmail }, "Password reset email sent");
    return true;
  } catch (err) {
    logger.error({ err, toEmail }, "Failed to send password reset email");
    return false;
  }
}
