import { Router, type IRouter } from "express";
import { db, tripsTable } from "@workspace/db";
import { eq, ilike, gte, lte, and, type SQL } from "drizzle-orm";
import { requireAdmin } from "../middleware/requireAdmin";

const router: IRouter = Router();

router.get("/", async (req, res) => {
  try {
    const { destination, minPrice, maxPrice, featured } = req.query;
    const conditions: SQL[] = [];

    if (destination) {
      conditions.push(ilike(tripsTable.destination, `%${destination}%`));
    }
    if (minPrice) {
      conditions.push(gte(tripsTable.price, Number(minPrice)));
    }
    if (maxPrice) {
      conditions.push(lte(tripsTable.price, Number(maxPrice)));
    }
    if (featured === "true") {
      conditions.push(eq(tripsTable.featured, true));
    }

    const trips = conditions.length > 0
      ? await db.select().from(tripsTable).where(and(...conditions))
      : await db.select().from(tripsTable);

    res.json(trips);
  } catch (err) {
    req.log.error({ err }, "Get trips error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [trip] = await db.select().from(tripsTable).where(eq(tripsTable.id, id));
    if (!trip) {
      res.status(404).json({ error: "not_found", message: "Trip not found" });
      return;
    }
    res.json(trip);
  } catch (err) {
    req.log.error({ err }, "Get trip error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.post("/", requireAdmin, async (req, res) => {
  try {
    const { title, description, destination, country, imageUrl, price, duration, maxCapacity, startDate, endDate, featured, includes } = req.body;

    const [trip] = await db.insert(tripsTable).values({
      title,
      description,
      destination,
      country,
      imageUrl,
      price,
      duration,
      maxCapacity,
      availableSpots: maxCapacity,
      startDate,
      endDate,
      featured: featured ?? false,
      includes: includes ?? [],
    }).returning();

    res.status(201).json(trip);
  } catch (err) {
    req.log.error({ err }, "Create trip error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.put("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { title, description, destination, country, imageUrl, price, duration, maxCapacity, startDate, endDate, featured, includes } = req.body;

    const [trip] = await db.update(tripsTable).set({
      title,
      description,
      destination,
      country,
      imageUrl,
      price,
      duration,
      maxCapacity,
      startDate,
      endDate,
      featured,
      includes,
    }).where(eq(tripsTable.id, id)).returning();

    if (!trip) {
      res.status(404).json({ error: "not_found", message: "Trip not found" });
      return;
    }

    res.json(trip);
  } catch (err) {
    req.log.error({ err }, "Update trip error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

router.delete("/:id", requireAdmin, async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(tripsTable).where(eq(tripsTable.id, id));
    res.json({ success: true, message: "Trip deleted" });
  } catch (err) {
    req.log.error({ err }, "Delete trip error");
    res.status(500).json({ error: "internal_error", message: "Internal server error" });
  }
});

export default router;
