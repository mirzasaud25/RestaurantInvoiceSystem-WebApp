import { z } from 'zod';
import { insertItemSchema, items, insertInvoiceSchema, invoices, insertInvoiceItemSchema, invoiceItems } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  items: {
    list: {
      method: 'GET' as const,
      path: '/api/items' as const,
      responses: {
        200: z.array(z.custom<typeof items.$inferSelect>()),
      },
    },
  },
  invoices: {
    create: {
      method: 'POST' as const,
      path: '/api/invoices' as const,
      input: z.object({
        cashierName: z.string(),
        cashierId: z.string(),
        counterNo: z.string()
      }),
      responses: {
        201: z.custom<typeof invoices.$inferSelect>(),
      }
    },
    get: {
      method: 'GET' as const,
      path: '/api/invoices/:id' as const,
      responses: {
        200: z.any(), // Will map to InvoiceWithItems type
        404: errorSchemas.notFound,
      }
    },
    addItem: {
      method: 'POST' as const,
      path: '/api/invoices/:id/items' as const,
      input: z.object({
        itemId: z.number(),
        quantity: z.number()
      }),
      responses: {
        200: z.custom<typeof invoiceItems.$inferSelect>(),
        404: errorSchemas.notFound,
      }
    },
    removeItem: {
      method: 'DELETE' as const,
      path: '/api/invoices/:id/items/:itemId' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      }
    },
    checkout: {
      method: 'POST' as const,
      path: '/api/invoices/:id/checkout' as const,
      input: z.object({
        cashPaid: z.number()
      }),
      responses: {
        200: z.custom<typeof invoices.$inferSelect>(),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
      }
    }
  }
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
