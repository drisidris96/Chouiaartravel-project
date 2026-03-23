import { Router, type IRouter } from "express";
import { db, bookingsTable, tripsTable, usersTable } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    if (!userId) {
      res.status(401).json({ error: "unauthorized", message: "Not authenticated" });
      return;
    }

    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, userId)).catch(() => [null as typeof usersTable.$inferSelect | null]);

    let bookings;
    if (user?.role === "admin") {
      bookings = await db.select().from(bookingsTable).orderBy(desc(bookingsTable.createdAt));
    } else {
      bookings = await db.select().from(bookingsTable).where(eq(bookingsTable.userId, userId)).orderBy(desc(bookingsTable.createdAt));
    }

    res.json(bookings);
  } catch (err) {
    req.log.error({ err }, "Get bookings error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { tripId, guestName, guestEmail, guestPhone, numberOfPeople, specialRequests } = req.body;
    const userId = (req.session as any).userId;

    if (!tripId || !guestName || !guestEmail || !guestPhone || !numberOfPeople) {
      res.status(400).json({ error: "bad_request", message: "جميع الحقول المطلوبة يجب ملؤها" });
      return;
    }

    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, Number(tripId)));
    if (!trip) {
      res.status(404).json({ error: "not_found", message: "الرحلة غير موجودة" });
      return;
    }

    if (trip.availableSpots < numberOfPeople) {
      res.status(400).json({ error: "no_spots", message: "لا توجد أماكن كافية" });
      return;
    }

    const totalPrice = trip.price * numberOfPeople;

    const [booking] = await db.insert(bookingsTable).values({
      tripId: Number(tripId),
      userId: userId || null,
      guestName,
      guestEmail,
      guestPhone,
      numberOfPeople: Number(numberOfPeople),
      totalPrice,
      status: "pending",
      specialRequests: specialRequests || null,
    }).returning();

    await db.update(tripsTable).set({
      availableSpots: trip.availableSpots - Number(numberOfPeople),
    }).where(eq(tripsTable.id, Number(tripId)));

    res.status(201).json(booking);
  } catch (err) {
    req.log.error({ err }, "Create booking error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, Number(req.params.id)));
    if (!booking) {
      res.status(404).json({ error: "not_found", message: "Booking not found" });
      return;
    }
    res.json(booking);
  } catch (err) {
    req.log.error({ err }, "Get booking error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.patch("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const [booking] = await db.update(bookingsTable).set({ status }).where(eq(bookingsTable.id, Number(req.params.id))).returning();
    res.json(booking);
  } catch (err) {
    req.log.error({ err }, "Update booking status error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const userId = (req.session as any).userId;
    const [booking] = await db.select().from(bookingsTable).where(eq(bookingsTable.id, Number(req.params.id)));
    if (!booking) {
      res.status(404).json({ error: "not_found", message: "Booking not found" });
      return;
    }

    await db.update(bookingsTable).set({ status: "cancelled" }).where(eq(bookingsTable.id, Number(req.params.id)));
    res.json({ success: true, message: "Booking cancelled" });
  } catch (err) {
    req.log.error({ err }, "Cancel booking error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

export default router;
