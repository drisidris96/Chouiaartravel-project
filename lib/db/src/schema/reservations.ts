import { pgTable, serial, text, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const reservationTypeEnum = pgEnum("reservation_type", ["hotel", "flight", "both"]);
export const reservationStatusEnum = pgEnum("reservation_status", ["pending", "confirmed", "cancelled"]);

export const reservationsTable = pgTable("reservations", {
  id: serial("id").primaryKey(),
  type: reservationTypeEnum("type").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  passportNumber: text("passport_number").notNull(),
  destination: text("destination").notNull(),
  departureDate: date("departure_date").notNull(),
  returnDate: date("return_date").notNull(),
  notes: text("notes"),
  status: reservationStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertReservationSchema = createInsertSchema(reservationsTable).omit({ id: true, createdAt: true, status: true });
export type InsertReservation = z.infer<typeof insertReservationSchema>;
export type Reservation = typeof reservationsTable.$inferSelect;
