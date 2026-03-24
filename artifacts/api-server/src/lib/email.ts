import nodemailer from "nodemailer";
import { logger } from "./logger";
import { LOGO_B64 } from "./logo-b64";

// Namecheap Private Email (primary — sent from official domain)
const NAMECHEAP_USER = "noreply@chouiaartravel.com";
const NAMECHEAP_PASS = process.env.NAMECHEAP_EMAIL_PASSWORD;

// Gmail fallback
const GMAIL_USER = "chouiaartravelagency@gmail.com";
const GMAIL_PASS = process.env.GMAIL_APP_PASSWORD;

function createTransport() {
  if (NAMECHEAP_PASS) {
    return nodemailer.createTransport({
      host: "mail.privateemail.com",
      port: 587,
      secure: false,
      auth: { user: NAMECHEAP_USER, pass: NAMECHEAP_PASS },
    });
  }
  if (GMAIL_PASS) {
    logger.warn("Using Gmail fallback for email sending");
    return nodemailer.createTransport({
      service: "gmail",
      auth: { user: GMAIL_USER, pass: GMAIL_PASS },
    });
  }
  logger.warn("No email credentials set — email sending disabled");
  return null;
}

const SENDER_NAME = "وكالة شويعر للسياحة والأسفار";
const SENDER_EMAIL = NAMECHEAP_PASS ? NAMECHEAP_USER : GMAIL_USER;

export async function sendPasswordResetEmail(toEmail: string, code: string): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    logger.warn({ toEmail }, "Email not sent (no GMAIL_APP_PASSWORD)");
    return false;
  }

  try {
    await transport.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      replyTo: SENDER_EMAIL,
      to: toEmail,
      subject: "رمز استعادة كلمة المرور — وكالة شويعر للسياحة",
      headers: {
        "X-Priority": "1",
        "X-Mailer": "Chouiaar Travel Agency Mailer",
        "Importance": "High",
      },
      attachments: [
        {
          filename: "logo.jpg",
          content: Buffer.from(LOGO_B64, "base64"),
          contentType: "image/jpeg",
          cid: "logo@chouiaar",
        },
      ],
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

          <!-- Logo -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="cid:logo@chouiaar"
                alt="وكالة شويعر للسياحة والأسفار"
                width="520"
                style="width:100%;max-width:520px;height:auto;display:block;" />
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:32px 28px 24px 28px;text-align:center;">

              <h2 style="color:#1a1a2e;margin:0 0 12px 0;font-size:20px;">
                استعادة كلمة المرور
              </h2>
              <p style="color:#555;font-size:14px;line-height:1.9;margin:0 0 24px 0;">
                تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك.<br>
                استخدم الرمز التالي لإتمام العملية:
              </p>

              <!-- Code box -->
              <div style="background:#c0392b;border-radius:12px;padding:20px 24px;margin:0 auto 24px auto;max-width:320px;">
                <p style="margin:0 0 6px 0;color:#f5c6c2;font-size:12px;">
                  رمز إعادة تعيين كلمة المرور
                </p>
                <span style="font-size:46px;font-weight:bold;letter-spacing:16px;
                              color:#ffffff;font-family:'Courier New',monospace;">
                  ${code}
                </span>
              </div>

              <p style="color:#888;font-size:13px;margin:0 0 6px 0;">
                ⚠️ هذا الرمز صالح لمدة <strong>30 دقيقة</strong> فقط.
              </p>
              <p style="color:#aaa;font-size:12px;margin:0;">
                إذا لم تطلب إعادة تعيين كلمة المرور، تجاهل هذا البريد.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f8f9fa;border-top:1px solid #eee;padding:14px 24px;text-align:center;">
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

export interface MailAttachment {
  name: string;
  type: string;
  data: string; // base64
}

export async function sendMail({
  to,
  subject,
  html,
  attachments = [],
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: MailAttachment[];
}): Promise<boolean> {
  const transport = createTransport();
  if (!transport) {
    logger.warn({ to }, "Email not sent (no credentials configured)");
    return false;
  }
  try {
    await transport.sendMail({
      from: `"${SENDER_NAME}" <${SENDER_EMAIL}>`,
      replyTo: SENDER_EMAIL,
      to,
      subject,
      html,
      attachments: attachments.map((f) => ({
        filename: f.name,
        content: Buffer.from(f.data, "base64"),
        contentType: f.type,
      })),
    });
    logger.info({ to, subject, attachmentCount: attachments.length }, "Email sent");
    return true;
  } catch (err) {
    logger.error({ err, to }, "Failed to send email");
    return false;
  }
}
