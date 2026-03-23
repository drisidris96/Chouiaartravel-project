import { pgTable, serial, text, timestamp, pgEnum, date } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const visaRequestStatusEnum = pgEnum("visa_request_status", ["pending", "processing", "approved", "rejected", "cancelled"]);

export const visaRequestsTable = pgTable("visa_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  birthDate: date("birth_date").notNull(),
  birthPlace: text("birth_place").notNull(),
  profession: text("profession").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  passportNumber: text("passport_number").notNull(),
  passportIssueDate: date("passport_issue_date").notNull(),
  passportIssuePlace: text("passport_issue_place").notNull(),
  passportExpiryDate: date("passport_expiry_date").notNull(),
  destination: text("destination").notNull(),
  travelDate: date("travel_date"),
  visaType: text("visa_type").default("tourism"),
  duration: text("duration"),
  photoUrl: text("photo_url"),
  passportPhotoUrl: text("passport_photo_url"),
  notes: text("notes"),
  status: visaRequestStatusEnum("status").notNull().default("pending"),
  adminNotes: text("admin_notes"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertVisaRequestSchema = createInsertSchema(visaRequestsTable).omit({ id: true, createdAt: true, status: true, adminNotes: true });
export type InsertVisaRequest = z.infer<typeof insertVisaRequestSchema>;
export type VisaRequest = typeof visaRequestsTable.$inferSelect;
