import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { type InvoiceWithItems } from "@shared/schema";

// Custom error handling parser
async function fetchWithZod<T>(url: string, options: RequestInit, schema?: any): Promise<T> {
  const res = await fetch(url, { ...options, credentials: "omit" }); // omitted for pure local demo without cookies
  
  if (!res.ok) {
    let errorMessage = "An error occurred";
    try {
      const errData = await res.json();
      errorMessage = errData.message || errorMessage;
    } catch {
      errorMessage = res.statusText;
    }
    throw new Error(errorMessage);
  }

  // Handle 204 No Content
  if (res.status === 204) return {} as T;

  const data = await res.json();
  if (schema) {
    const result = schema.safeParse(data);
    if (!result.success) {
      console.error("Zod parse error:", result.error);
      throw new Error("Invalid response format from server");
    }
    return result.data;
  }
  return data;
}

export function useItems() {
  return useQuery({
    queryKey: [api.items.list.path],
    queryFn: () => fetchWithZod(api.items.list.path, { method: api.items.list.method }, api.items.list.responses[200])
  });
}

export function useInvoice(id: number | null) {
  return useQuery<InvoiceWithItems>({
    queryKey: [api.invoices.get.path, id],
    queryFn: () => {
      const url = buildUrl(api.invoices.get.path, { id: id! });
      return fetchWithZod(url, { method: api.invoices.get.method }, api.invoices.get.responses[200]);
    },
    enabled: !!id,
  });
}

export function useCreateInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: { cashierName: string; cashierId: string; counterNo: string }) => {
      return fetchWithZod(api.invoices.create.path, {
        method: api.invoices.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }, api.invoices.create.responses[201]);
    }
  });
}

export function useAddInvoiceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, itemId, quantity }: { invoiceId: number; itemId: number; quantity: number }) => {
      const url = buildUrl(api.invoices.addItem.path, { id: invoiceId });
      return fetchWithZod(url, {
        method: api.invoices.addItem.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      }, api.invoices.addItem.responses[200]);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.get.path, variables.invoiceId] });
    }
  });
}

export function useRemoveInvoiceItem() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, itemId }: { invoiceId: number; itemId: number }) => {
      const url = buildUrl(api.invoices.removeItem.path, { id: invoiceId, itemId });
      return fetchWithZod(url, {
        method: api.invoices.removeItem.method,
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.get.path, variables.invoiceId] });
    }
  });
}

export function useCheckoutInvoice() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ invoiceId, cashPaid }: { invoiceId: number; cashPaid: number }) => {
      const url = buildUrl(api.invoices.checkout.path, { id: invoiceId });
      return fetchWithZod(url, {
        method: api.invoices.checkout.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cashPaid }),
      }, api.invoices.checkout.responses[200]);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.invoices.get.path, variables.invoiceId] });
    }
  });
}
