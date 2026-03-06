import type { Express } from "express";
import type { Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  app.get(api.items.list.path, async (req, res) => {
    const itemsList = await storage.getItems();
    res.json(itemsList);
  });

  app.post(api.invoices.create.path, async (req, res) => {
    try {
      const input = api.invoices.create.input.parse(req.body);
      const invoice = await storage.createInvoice(input);
      res.status(201).json(invoice);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.invoices.get.path, async (req, res) => {
    const id = Number(req.params.id);
    const invoice = await storage.getInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: 'Invoice not found' });
    }
    res.json(invoice);
  });

  app.post(api.invoices.addItem.path, async (req, res) => {
    try {
      const invoiceId = Number(req.params.id);
      const input = api.invoices.addItem.input.parse(req.body);
      
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice || invoice.status === 'closed') {
         return res.status(404).json({ message: 'Active invoice not found' });
      }

      const itemsList = await storage.getItems();
      const item = itemsList.find(i => i.id === input.itemId);
      if (!item) {
         return res.status(404).json({ message: 'Item not found' });
      }

      const invoiceItem = await storage.addInvoiceItem({
        invoiceId,
        itemId: input.itemId,
        quantity: input.quantity,
        priceAtTime: item.price
      });
      
      await updateInvoiceTotals(invoiceId);

      res.status(200).json(invoiceItem);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  app.delete(api.invoices.removeItem.path, async (req, res) => {
    const invoiceId = Number(req.params.id);
    const itemId = Number(req.params.itemId);
    
    await storage.removeInvoiceItem(invoiceId, itemId);
    await updateInvoiceTotals(invoiceId);
    
    res.status(204).send();
  });

  app.post(api.invoices.checkout.path, async (req, res) => {
    try {
      const invoiceId = Number(req.params.id);
      const input = api.invoices.checkout.input.parse(req.body);
      
      const invoice = await storage.getInvoice(invoiceId);
      if (!invoice) {
        return res.status(404).json({ message: 'Invoice not found' });
      }

      if (input.cashPaid < invoice.finalAmount) {
        return res.status(400).json({ message: 'Cash paid is less than final amount' });
      }

      const cashBack = input.cashPaid - invoice.finalAmount;

      const updated = await storage.updateInvoice(invoiceId, {
        cashPaid: input.cashPaid,
        cashBack,
        status: 'closed'
      });

      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({ message: err.errors[0].message });
      }
      throw err;
    }
  });

  async function updateInvoiceTotals(invoiceId: number) {
    const invoice = await storage.getInvoice(invoiceId);
    if (!invoice) return;

    let subTotal = 0;
    for (const item of invoice.items) {
      subTotal += item.priceAtTime * item.quantity;
    }

    let discount = 0;
    if (subTotal > 3000) {
      discount = Math.floor(subTotal * 0.20);
    }

    const afterDiscount = subTotal - discount;
    const tax = Math.floor(afterDiscount * 0.05);
    const finalAmount = afterDiscount + tax;

    await storage.updateInvoice(invoiceId, {
      subTotal,
      discount,
      tax,
      finalAmount
    });
  }

  // Seed database
  await seedDatabase();

  return httpServer;
}

async function seedDatabase() {
  const existingItems = await storage.getItems();
  if (existingItems.length === 0) {
    await storage.createItem({ name: "Zinger Burger", price: 250 });
    await storage.createItem({ name: "Beef Burger", price: 250 });
    await storage.createItem({ name: "Cold Drink", price: 250 });
    await storage.createItem({ name: "Desert", price: 250 });
  }
}