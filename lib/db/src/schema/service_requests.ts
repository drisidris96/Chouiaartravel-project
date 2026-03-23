import { pgTable, serial, text, timestamp, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const serviceRequestStatusEnum = pgEnum("service_request_status", ["pending", "in_progress", "done", "cancelled"]);

export const serviceRequestsTable = pgTable("service_requests", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  address: text("address").notNull(),
  phone: text("phone").notNull(),
  passportNumber: text("passport_number").notNull(),
  serviceDescription: text("service_description").notNull(),
  status: serviceRequestStatusEnum("status").notNull().default("pending"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertServiceRequestSchema = createInsertSchema(serviceRequestsTable).omit({ id: true, createdAt: true, status: true });
export type InsertServiceRequest = z.infer<typeof insertServiceRequestSchema>;
export type ServiceRequest = typeof serviceRequestsTable.$inferSelect;
