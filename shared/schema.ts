import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, decimal, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const customers = pgTable("customers", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").notNull().unique(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone").notNull(),
  address: text("address"),
  city: text("city"),
  state: text("state"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const goldCalculations = pgTable("gold_calculations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  customerId: varchar("customer_id").references(() => customers.id),
  weight: decimal("weight", { precision: 10, scale: 3 }).notNull(),
  purity: decimal("purity", { precision: 5, scale: 2 }).notNull(),
  pureGoldWeight: decimal("pure_gold_weight", { precision: 10, scale: 3 }).notNull(),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const invoices = pgTable("invoices", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  invoiceNumber: varchar("invoice_number").notNull().unique(),
  customerId: varchar("customer_id").references(() => customers.id).notNull(),
  items: jsonb("items").notNull(),
  paymentType: varchar("payment_type", { length: 10 }).default("cash"), // "gold" or "cash"
  status: varchar("status", { length: 20 }).default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const customersRelations = relations(customers, ({ many }) => ({
  calculations: many(goldCalculations),
  invoices: many(invoices),
}));

export const goldCalculationsRelations = relations(goldCalculations, ({ one }) => ({
  customer: one(customers, {
    fields: [goldCalculations.customerId],
    references: [customers.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
}));

export const insertCustomerSchema = createInsertSchema(customers).omit({
  id: true,
  createdAt: true,
});

export const insertGoldCalculationSchema = createInsertSchema(goldCalculations).omit({
  id: true,
  createdAt: true,
  pureGoldWeight: true,
});

export const insertInvoiceSchema = createInsertSchema(invoices).omit({
  id: true,
  createdAt: true,
  invoiceNumber: true,
});

export type Customer = typeof customers.$inferSelect;
export type InsertCustomer = z.infer<typeof insertCustomerSchema>;
export type GoldCalculation = typeof goldCalculations.$inferSelect;
export type InsertGoldCalculation = z.infer<typeof insertGoldCalculationSchema>;
export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export interface InvoiceItem {
  itemName: string;
  weight: number;
}
