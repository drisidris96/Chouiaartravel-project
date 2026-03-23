import { Router, type IRouter } from "express";
import { db, bookingsTable, tripsTable } from "@workspace/db";
import { eq, count, sum } from "drizzle-orm";
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
      .select({
        destination: tripsTable.destination,
        count: count(bookingsTable.id),
      })
      .from(bookingsTable)
      .leftJoin(tripsTable, eq(bookingsTable.tripId, tripsTable.id))
      .groupBy(tripsTable.destination);

    res.json({
      totalTrips: tripsCount.count,
      totalBookings: bookingsCount.count,
      pendingBookings: pendingCount.count,
      confirmedBookings: confirmedCount.count,
      totalRevenue: Number(revenueResult.total ?? 0),
      popularDestinations: destinationsResult.map(d => ({
        destination: d.destination ?? "Unknown",
        count: d.count,
      })),
    });
  } catch (err) {
    req.log.error({ err }, "Get admin stats error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

export default router;
