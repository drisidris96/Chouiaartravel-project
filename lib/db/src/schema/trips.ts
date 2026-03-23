import { pgTable, serial, text, timestamp, integer, doublePrecision, boolean, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tripsTable = pgTable("trips", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  destination: text("destination").notNull(),
  country: text("country").notNull(),
  imageUrl: text("image_url"),
  price: doublePrecision("price").notNull(),
  duration: integer("duration").notNull(),
  maxCapacity: integer("max_capacity").notNull(),
  availableSpots: integer("available_spots").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
  featured: boolean("featured").notNull().default(false),
  rating: doublePrecision("rating").notNull().default(0),
  reviewCount: integer("review_count").notNull().default(0),
  includes: text("includes").array().notNull().default([]),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTripSchema = createInsertSchema(tripsTable).omit({ id: true, createdAt: true, availableSpots: true, rating: true, reviewCount: true });
export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof tripsTable.$inferSelect;
