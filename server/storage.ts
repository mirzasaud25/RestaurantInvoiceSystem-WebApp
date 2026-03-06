import { db } from "./db";
import {
  items,
  invoices,
  invoiceItems,
  type Item,
  type InsertItem,
  type Invoice,
  type InsertInvoice,
  type InvoiceItem,
  type InsertInvoiceItem,
  type InvoiceWithItems
} from "@shared/schema";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  getItems(): Promise<Item[]>;
  createItem(item: InsertItem): Promise<Item>;
  
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  getInvoice(id: number): Promise<InvoiceWithItems | undefined>;
  updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice>;
  
  addInvoiceItem(item: InsertInvoiceItem): Promise<InvoiceItem>;
  removeInvoiceItem(invoiceId: number, itemId: number): Promise<void>;
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
}

export class DatabaseStorage implements IStorage {
  async getItems(): Promise<Item[]> {
    return await db.select().from(items);
  }

  async createItem(item: InsertItem): Promise<Item> {
    const [created] = await db.insert(items).values(item).returning();
    return created;
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const invoiceNo = `INV-${Date.now()}`;
    const [created] = await db.insert(invoices).values({ ...invoice, invoiceNo }).returning();
    return created;
  }

  async getInvoice(id: number): Promise<InvoiceWithItems | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    if (!invoice) return undefined;

    const itemsForInvoice = await db.select({
      invoiceItem: invoiceItems,
      item: items
    })
    .from(invoiceItems)
    .innerJoin(items, eq(invoiceItems.itemId, items.id))
    .where(eq(invoiceItems.invoiceId, id));

    const formattedItems = itemsForInvoice.map(row => ({
      ...row.invoiceItem,
      item: row.item
    }));

    return {
      ...invoice,
      items: formattedItems
    };
  }

  async updateInvoice(id: number, updates: Partial<InsertInvoice>): Promise<Invoice> {
    const [updated] = await db.update(invoices).set(updates).where(eq(invoices.id, id)).returning();
    return updated;
  }

  async addInvoiceItem(insertData: InsertInvoiceItem): Promise<InvoiceItem> {
    const [created] = await db.insert(invoiceItems).values(insertData).returning();
    return created;
  }

  async removeInvoiceItem(invoiceId: number, itemId: number): Promise<void> {
    await db.delete(invoiceItems)
      .where(and(eq(invoiceItems.invoiceId, invoiceId), eq(invoiceItems.itemId, itemId)));
  }

  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
}

export const storage = new DatabaseStorage();