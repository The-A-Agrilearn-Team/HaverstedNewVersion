import { pgTable, text, uuid, timestamp } from "drizzle-orm/pg-core";

export const conversations = pgTable("conversations", {
  id: uuid("id").defaultRandom().primaryKey(),
  listing_id: text("listing_id"),
  buyer_id: text("buyer_id").notNull(),
  farmer_id: text("farmer_id").notNull(),
  buyer_name: text("buyer_name").notNull().default(""),
  farmer_name: text("farmer_name").notNull().default(""),
  listing_title: text("listing_title").notNull().default(""),
  last_message_at: timestamp("last_message_at", { withTimezone: true }).defaultNow().notNull(),
  last_message_preview: text("last_message_preview").notNull().default(""),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const chatMessages = pgTable("chat_messages", {
  id: uuid("id").defaultRandom().primaryKey(),
  conversation_id: uuid("conversation_id").notNull(),
  sender_id: text("sender_id").notNull(),
  content: text("content").notNull(),
  created_at: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  read_at: timestamp("read_at", { withTimezone: true }),
});

export type Conversation = typeof conversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;
