import { Router, type IRouter } from "express";
import { db, visaRequestsTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.post("/", async (req, res) => {
  try {
    const {
      firstName, lastName, birthDate, birthPlace, profession,
      address, phone, passportNumber, passportIssueDate,
      passportIssuePlace, passportExpiryDate, destination,
      travelDate, visaType, duration, notes,
    } = req.body;

    if (!firstName || !lastName || !birthDate || !birthPlace || !profession ||
        !address || !phone || !passportNumber || !passportIssueDate ||
        !passportIssuePlace || !passportExpiryDate || !destination) {
      res.status(400).json({ error: "bad_request", message: "جميع الحقول المطلوبة يجب ملؤها" });
      return;
    }

    const [visaRequest] = await db
      .insert(visaRequestsTable)
      .values({
        firstName, lastName, birthDate, birthPlace, profession,
        address, phone, passportNumber, passportIssueDate,
        passportIssuePlace, passportExpiryDate, destination,
        travelDate: travelDate || null,
        visaType: visaType || "tourism",
        duration: duration || null,
        notes: notes || null,
      })
      .returning();

    res.status(201).json({ visaRequest, message: "تم تسجيل طلب الفيزا بنجاح" });
  } catch (err) {
    req.log.error({ err }, "Create visa request error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.get("/", requireAdmin, async (req, res) => {
  try {
    const visaRequests = await db.select().from(visaRequestsTable).orderBy(desc(visaRequestsTable.createdAt));
    res.json({ visaRequests });
  } catch (err) {
    req.log.error({ err }, "Get visa requests error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    const updateData: any = { status };
    if (adminNotes !== undefined) updateData.adminNotes = adminNotes;

    const [updated] = await db
      .update(visaRequestsTable)
      .set(updateData)
      .where(eq(visaRequestsTable.id, Number(req.params.id)))
      .returning();
    res.json({ visaRequest: updated });
  } catch (err) {
    req.log.error({ err }, "Update visa request error");
    res.status(500).json({ error: "internal_error", message: "خطأ في الخادم" });
  }
});

export default router;
