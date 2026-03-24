import { Router, type IRouter } from "express";
import { db, bookingsTable, tripsTable, visaRequestsTable, reservationsTable, serviceRequestsTable, supportMessagesTable } from "@workspace/db";
import { eq, count, sum, desc } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/stats", requireAdmin, async (req, res) => {
  try {
    const [tripsCount] = await db.select({ count: count() }).from(tripsTable);
    const [bookingsCount] = await db.select({ count: count() }).from(bookingsTable);
    const [pendingCount] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "pending"));
    const [confirmedCount] = await db.select({ count: count() }).from(bookingsTable).where(eq(bookingsTable.status, "confirmed"));
    const [revenueResult] = await db.select({ total: sum(bookingsTable.totalPrice) }).from(bookingsTable).where(eq(bookingsTable.status, "confirmed"));

    const destinationsResult = await db
      .select({ destination: tripsTable.destination, count: count(bookingsTable.id) })
      .from(bookingsTable)
      .leftJoin(tripsTable, eq(bookingsTable.tripId, tripsTable.id))
      .groupBy(tripsTable.destination);

    res.json({
      totalTrips: tripsCount.count,
      totalBookings: bookingsCount.count,
      pendingBookings: pendingCount.count,
      confirmedBookings: confirmedCount.count,
      totalRevenue: Number(revenueResult.total ?? 0),
      popularDestinations: destinationsResult.map(d => ({ destination: d.destination ?? "Unknown", count: d.count })),
    });
  } catch (err) {
    req.log.error({ err }, "Get admin stats error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.get("/notifications", requireAdmin, async (req, res) => {
  try {
    const notifications: any[] = [];

    const visas = await db.select().from(visaRequestsTable).orderBy(desc(visaRequestsTable.createdAt)).limit(20);
    for (const v of visas) {
      notifications.push({
        id: `visa-${v.id}`,
        type: "visa",
        title: `طلب تأشيرة — ${v.destination}`,
        desc: `${v.firstName} ${v.lastName} — ${v.phone}`,
        time: v.createdAt,
        read: false,
      });
    }

    const bookings = await db.select({ b: bookingsTable, t: tripsTable })
      .from(bookingsTable)
      .leftJoin(tripsTable, eq(bookingsTable.tripId, tripsTable.id))
      .orderBy(desc(bookingsTable.createdAt))
      .limit(15);
    for (const { b, t } of bookings) {
      notifications.push({
        id: `booking-${b.id}`,
        type: "booking",
        title: `حجز رحلة — ${t?.title ?? "رحلة"}`,
        desc: `${b.guestName} — ${b.numberOfPeople} أشخاص`,
        time: b.createdAt,
        read: false,
      });
    }

    const reservations = await db.select().from(reservationsTable).orderBy(desc(reservationsTable.createdAt)).limit(15);
    for (const r of reservations) {
      notifications.push({
        id: `reservation-${r.id}`,
        type: "reservation",
        title: `طلب حجز — ${r.type === "hotel" ? "فندق" : "طيران"}`,
        desc: `${r.firstName} ${r.lastName} — ${r.destination}`,
        time: r.createdAt,
        read: false,
      });
    }

    const services = await db.select().from(serviceRequestsTable).orderBy(desc(serviceRequestsTable.createdAt)).limit(10);
    for (const s of services) {
      notifications.push({
        id: `service-${s.id}`,
        type: "service",
        title: `طلب خدمة أخرى`,
        desc: `${s.firstName} ${s.lastName} — ${s.phone}`,
        time: s.createdAt,
        read: false,
      });
    }

    const supports = await db.select().from(supportMessagesTable).orderBy(desc(supportMessagesTable.createdAt)).limit(15);
    for (const m of supports) {
      notifications.push({
        id: `support-${m.id}`,
        type: "support",
        title: `رسالة دعم — ${m.name}`,
        desc: m.message.length > 60 ? m.message.slice(0, 60) + "..." : m.message,
        time: m.createdAt,
        read: m.isRead,
        dbId: m.id,
      });
    }

    notifications.sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

    res.json(notifications.slice(0, 50));
  } catch (err) {
    req.log.error({ err }, "Get notifications error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

export default router;
