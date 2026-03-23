import { Router, type IRouter } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, or } from "drizzle-orm";
import crypto from "crypto";

const router: IRouter = Router();

function hashPassword(password: string): string {
  return crypto.createHash("sha256").update(password + "travel-agency-salt").digest("hex");
}

function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: "bad_request", message: "البريد الإلكتروني وكلمة المرور مطلوبان" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "بيانات الدخول غير صحيحة" });
      return;
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      res.status(401).json({ error: "unauthorized", message: "بيانات الدخول غير صحيحة" });
      return;
    }

    if (!user.verified && user.role !== "admin") {
      const code = generateVerificationCode();
      await db.update(usersTable).set({ verificationCode: code }).where(eq(usersTable.id, user.id));

      res.status(403).json({
        error: "not_verified",
        message: "الحساب غير مفعّل. تم إرسال رمز التفعيل",
        verificationCode: code,
        email: user.email,
      });
      return;
    }

    (req.session as any).userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: user.verified,
        createdAt: user.createdAt,
      },
      message: "تم تسجيل الدخول بنجاح",
    });
  } catch (err) {
    req.log.error({ err }, "Login error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.post("/register", async (req, res) => {
  try {
    const { email, password, name, phone } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: "bad_request", message: "الاسم والبريد الإلكتروني وكلمة المرور مطلوبة" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (existing) {
      res.status(409).json({ error: "conflict", message: "البريد الإلكتروني مسجل مسبقاً" });
      return;
    }

    const hashed = hashPassword(password);

    const [user] = await db
      .insert(usersTable)
      .values({
        email,
        password: hashed,
        name,
        phone: phone || null,
        role: "user",
        verified: true,
        verificationCode: null,
      })
      .returning();

    // Create session immediately after registration
    (req.session as any).userId = user.id;

    res.status(201).json({
      message: "تم إنشاء الحساب بنجاح",
      user: { id: user.id, email: user.email, name: user.name, role: user.role, verified: true },
    });
  } catch (err) {
    req.log.error({ err }, "Register error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { email, code } = req.body;
    if (!email || !code) {
      res.status(400).json({ error: "bad_request", message: "البريد الإلكتروني والرمز مطلوبان" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "الحساب غير موجود" });
      return;
    }

    if (user.verified) {
      res.json({ message: "الحساب مفعّل مسبقاً" });
      return;
    }

    if (user.verificationCode !== code) {
      res.status(400).json({ error: "invalid_code", message: "رمز التفعيل غير صحيح" });
      return;
    }

    await db.update(usersTable).set({ verified: true, verificationCode: null }).where(eq(usersTable.id, user.id));

    (req.session as any).userId = user.id;

    res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        verified: true,
        createdAt: user.createdAt,
      },
      message: "تم تفعيل الحساب بنجاح!",
    });
  } catch (err) {
    req.log.error({ err }, "Verify error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.post("/resend-code", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ error: "bad_request", message: "البريد الإلكتروني مطلوب" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "الحساب غير موجود" });
      return;
    }

    if (user.verified) {
      res.json({ message: "الحساب مفعّل مسبقاً" });
      return;
    }

    const code = generateVerificationCode();
    await db.update(usersTable).set({ verificationCode: code }).where(eq(usersTable.id, user.id));

    res.json({
      message: "تم إرسال رمز التفعيل",
      verificationCode: code,
    });
  } catch (err) {
    req.log.error({ err }, "Resend code error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { emailOrPhone } = req.body;
    if (!emailOrPhone) {
      res.status(400).json({ error: "bad_request", message: "البريد الإلكتروني أو رقم الهاتف مطلوب" });
      return;
    }

    const [user] = await db
      .select()
      .from(usersTable)
      .where(or(eq(usersTable.email, emailOrPhone), eq(usersTable.phone, emailOrPhone)));

    if (!user) {
      res.status(404).json({ error: "not_found", message: "لم يتم العثور على حساب مرتبط بهذه البيانات" });
      return;
    }

    const code = generateVerificationCode();
    await db.update(usersTable).set({ resetToken: code }).where(eq(usersTable.id, user.id));

    res.json({
      message: "تم إرسال رمز استرجاع كلمة المرور",
      email: user.email,
      resetToken: code,
    });
  } catch (err) {
    req.log.error({ err }, "Forgot password error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      res.status(400).json({ error: "bad_request", message: "الرمز وكلمة المرور الجديدة مطلوبان" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.resetToken, token));
    if (!user) {
      res.status(400).json({ error: "invalid_token", message: "رمز الاسترجاع غير صحيح أو منتهي الصلاحية" });
      return;
    }

    const hashed = hashPassword(newPassword);
    await db.update(usersTable).set({ password: hashed, resetToken: null }).where(eq(usersTable.id, user.id));

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Reset password error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.post("/logout", (req, res) => {
  req.session.destroy(() => {
    res.json({ success: true, message: "تم تسجيل الخروج بنجاح" });
  });
});

router.get("/me", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(401).json({ error: "unauthorized", message: "User not found" });
      return;
    }

    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      phone: user.phone,
      role: user.role,
      verified: user.verified,
      createdAt: user.createdAt,
    });
  } catch (err) {
    req.log.error({ err }, "Get me error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.put("/profile", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "يجب تسجيل الدخول" });
      return;
    }

    const { name, phone } = req.body;
    const updates: Record<string, any> = {};
    if (name && name.trim()) updates.name = name.trim();
    if (phone !== undefined) updates.phone = phone || null;

    if (Object.keys(updates).length === 0) {
      res.status(400).json({ error: "bad_request", message: "لا توجد بيانات للتحديث" });
      return;
    }

    const [updated] = await db.update(usersTable).set(updates).where(eq(usersTable.id, userId)).returning();
    res.json({
      message: "تم تحديث البيانات بنجاح",
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        role: updated.role,
        verified: updated.verified,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Update profile error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.put("/change-password", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "يجب تسجيل الدخول" });
      return;
    }

    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      res.status(400).json({ error: "bad_request", message: "كلمة المرور الحالية والجديدة مطلوبتان" });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ error: "bad_request", message: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "المستخدم غير موجود" });
      return;
    }

    const hashedCurrent = hashPassword(currentPassword);
    if (user.password !== hashedCurrent) {
      res.status(400).json({ error: "wrong_password", message: "كلمة المرور الحالية غير صحيحة" });
      return;
    }

    const hashedNew = hashPassword(newPassword);
    await db.update(usersTable).set({ password: hashedNew }).where(eq(usersTable.id, userId));

    res.json({ message: "تم تغيير كلمة المرور بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Change password error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.put("/change-email", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "يجب تسجيل الدخول" });
      return;
    }

    const { newEmail, password } = req.body;
    if (!newEmail || !password) {
      res.status(400).json({ error: "bad_request", message: "البريد الإلكتروني الجديد وكلمة المرور مطلوبان" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId));
    if (!user) {
      res.status(404).json({ error: "not_found", message: "المستخدم غير موجود" });
      return;
    }

    const hashed = hashPassword(password);
    if (user.password !== hashed) {
      res.status(400).json({ error: "wrong_password", message: "كلمة المرور غير صحيحة" });
      return;
    }

    const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, newEmail));
    if (existing && existing.id !== userId) {
      res.status(409).json({ error: "conflict", message: "هذا البريد الإلكتروني مستخدم بالفعل" });
      return;
    }

    const [updated] = await db.update(usersTable).set({ email: newEmail }).where(eq(usersTable.id, userId)).returning();
    res.json({
      message: "تم تغيير البريد الإلكتروني بنجاح",
      user: {
        id: updated.id,
        email: updated.email,
        name: updated.name,
        phone: updated.phone,
        role: updated.role,
        verified: updated.verified,
        createdAt: updated.createdAt,
      },
    });
  } catch (err) {
    req.log.error({ err }, "Change email error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

export default router;
export { hashPassword };
