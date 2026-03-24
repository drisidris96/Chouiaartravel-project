import { pgTable, serial, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const supportMessagesTable = pgTable("support_messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone"),
  email: text("email"),
  message: text("message").notNull(),
  isRead: boolean("is_read").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SupportMessage = typeof supportMessagesTable.$inferSelect;
