import { Router, type IRouter } from "express";
import { db, supportMessagesTable } from "@workspace/db";
import { sendMail } from "../lib/email";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

const MAX_FILES = 5;
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "application/pdf"];

// POST /api/support — public: submit a support message
router.post("/", async (req, res) => {
  try {
    const { name, phone, email, message, attachments } = req.body;
    if (!name || !message || (!phone && !email)) {
      res.status(400).json({ error: "bad_request", message: "الاسم والرسالة مطلوبان مع وسيلة تواصل" });
      return;
    }

    // Validate attachments
    let validatedAttachments: { name: string; type: string; data: string }[] = [];
    if (attachments && Array.isArray(attachments)) {
      if (attachments.length > MAX_FILES) {
        res.status(400).json({ error: "too_many_files", message: `الحد الأقصى ${MAX_FILES} ملفات` });
        return;
      }
      for (const file of attachments) {
        if (!file.name || !file.type || !file.data) continue;
        if (!ALLOWED_TYPES.includes(file.type)) {
          res.status(400).json({ error: "invalid_type", message: "يُسمح فقط بصور JPG/PNG وملفات PDF" });
          return;
        }
        const sizeBytes = Buffer.byteLength(file.data, "base64");
        if (sizeBytes > MAX_FILE_BYTES) {
          res.status(400).json({ error: "file_too_large", message: `الملف "${file.name}" يتجاوز 5MB` });
          return;
        }
        validatedAttachments.push({ name: file.name, type: file.type, data: file.data });
      }
    }

    // Save to database
    await db.insert(supportMessagesTable).values({
      name,
      phone: phone || null,
      email: email || null,
      message,
      attachments: validatedAttachments.length > 0 ? validatedAttachments : [],
    });

    // Build attachment summary for email
    const attachmentHtml = validatedAttachments.length > 0
      ? `<tr>
          <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top;">المرفقات</td>
          <td style="padding: 10px 0; color: #111827;">
            ${validatedAttachments.map(f => `<span style="display:inline-block;background:#e0f2fe;color:#0369a1;border-radius:6px;padding:2px 8px;font-size:12px;margin:2px;">📎 ${f.name}</span>`).join(" ")}
          </td>
        </tr>`
      : "";

    const htmlBody = `
      <div dir="rtl" style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1a3a5c, #2a5298); padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 22px;">📩 رسالة دعم جديدة</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0;">من نموذج المساعدة والدعم — وكالة شويعر</p>
        </div>
        <div style="background: #f9fafb; padding: 28px; border: 1px solid #e5e7eb; border-top: none;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px; width: 130px;">الاسم الكامل</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;">${name}</td>
            </tr>
            ${phone ? `<tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">رقم الهاتف</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;" dir="ltr">${phone}</td>
            </tr>` : ""}
            ${email ? `<tr>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; color: #6b7280; font-size: 13px;">البريد الإلكتروني</td>
              <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb; font-weight: bold; color: #111827;" dir="ltr">${email}</td>
            </tr>` : ""}
            <tr>
              <td style="padding: 10px 0; color: #6b7280; font-size: 13px; vertical-align: top; border-bottom: 1px solid #e5e7eb;">الرسالة</td>
              <td style="padding: 10px 0; color: #111827; line-height: 1.7; border-bottom: 1px solid #e5e7eb;">${message.replace(/\n/g, "<br>")}</td>
            </tr>
            ${attachmentHtml}
          </table>
          ${validatedAttachments.length > 0 ? `<p style="margin-top:16px;color:#6b7280;font-size:12px;">⚠️ تحتوي الرسالة على ${validatedAttachments.length} مرفق، راجع لوحة الأدمين لتنزيلها.</p>` : ""}
        </div>
        <div style="background: #e0f2fe; padding: 14px 28px; border: 1px solid #bae6fd; border-top: none; border-radius: 0 0 12px 12px; font-size: 12px; color: #0369a1; text-align: center;">
          يُرجى الرد في أقرب وقت ممكن على العميل — وكالة شويعر للسياحة والأسفار
        </div>
      </div>
    `;

    await sendMail({
      to: "chouiaartravelagency@gmail.com",
      subject: `📩 دعم جديد من: ${name}${validatedAttachments.length > 0 ? ` (${validatedAttachments.length} مرفق)` : ""}`,
      html: htmlBody,
    });

    res.status(200).json({ message: "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً." });
  } catch (err) {
    req.log.error({ err }, "Support message error");
    res.status(500).json({ error: "internal_error", message: "فشل إرسال الرسالة. حاول مرة أخرى." });
  }
});

// GET /api/support — admin only: get all support messages
router.get("/", requireAdmin, async (req, res) => {
  try {
    const messages = await db
      .select()
      .from(supportMessagesTable)
      .orderBy(supportMessagesTable.createdAt);
    res.json({ messages });
  } catch (err) {
    req.log.error({ err }, "Get support messages error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

// PATCH /api/support/:id/read — mark a message as read
router.patch("/:id/read", requireAdmin, async (req, res) => {
  try {
    const [updated] = await db
      .update(supportMessagesTable)
      .set({ isRead: true })
      .where(eq(supportMessagesTable.id, Number(req.params.id)))
      .returning();
    res.json({ message: updated });
  } catch (err) {
    req.log.error({ err }, "Mark support message read error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

export default router;
