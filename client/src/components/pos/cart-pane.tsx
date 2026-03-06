import { ShoppingBag, Trash2, CreditCard, Receipt as ReceiptIcon, Loader2 } from "lucide-react";
import { useCashier } from "@/lib/cashier-context";
import { useInvoice, useRemoveInvoiceItem } from "@/hooks/use-pos";
import { formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { CheckoutModal } from "./checkout-modal";
import { ReceiptModal } from "./receipt-modal";
import { useToast } from "@/hooks/use-toast";

export function CartPane() {
  const { activeInvoiceId, setActiveInvoice } = useCashier();
  const { data: invoice, isLoading } = useInvoice(activeInvoiceId);
  const removeMutation = useRemoveInvoiceItem();
  const { toast } = useToast();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);

  // Live calculations for snappy UI
  const subTotal = invoice?.items.reduce((acc, curr) => acc + (curr.priceAtTime * curr.quantity), 0) || 0;
  const discount = subTotal > 3000 ? Math.round(subTotal * 0.2) : 0;
  const tax = Math.round((subTotal - discount) * 0.05);
  const finalAmount = (subTotal - discount) + tax;

  const isCartEmpty = !invoice || invoice.items.length === 0;
  const isCheckedOut = invoice?.status === "closed";

  // Group identical items for display
  const itemsMap = new Map<number, { item: any, quantity: number, priceAtTime: number, id: number }>();
  invoice?.items.forEach(invItem => {
    const existing = itemsMap.get(invItem.itemId);
    if (existing) {
      existing.quantity += invItem.quantity;
    } else {
      itemsMap.set(invItem.itemId, { ...invItem });
    }
  });
  const groupedItems = Array.from(itemsMap.values());

  const handleRemove = (itemId: number) => {
    if (!activeInvoiceId) return;
    removeMutation.mutate({ invoiceId: activeInvoiceId, itemId }, {
      onError: (err) => toast({ title: "Failed to remove item", description: err.message, variant: "destructive" })
    });
  };
  const handleCheckoutComplete = () => {
    setIsCheckoutOpen(false);
    setIsReceiptOpen(true);
  };

  const handleNewSale = () => {
    setIsReceiptOpen(false);
    setActiveInvoice(null);
  };

  if (isLoading && activeInvoiceId) {
    return (
      <div className="flex flex-col h-full bg-card border-l p-6">
        <Skeleton className="h-8 w-1/2 mb-6" />
        <div className="space-y-4 flex-1">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-card border-l border-border/50 shadow-2xl z-10">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border/50 bg-background/50 backdrop-blur-sm">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary" />
          Current Order
        </h2>
        {invoice && (
          <p className="text-sm text-muted-foreground mt-1 font-mono">
            #{invoice.invoiceNo}
          </p>
        )}
      </div>

      {/* Item List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        <AnimatePresence initial={false}>
          {isCartEmpty ? (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="flex flex-col items-center justify-center h-full text-muted-foreground"
            >
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <ShoppingBag className="w-10 h-10 opacity-50" />
              </div>
              <p className="text-lg font-medium">Cart is empty</p>
              <p className="text-sm">Click items on the left to add</p>
            </motion.div>
          ) : (
            groupedItems.map((invItem) => (
              <motion.div
                key={invItem.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                className="flex items-center justify-between p-3 rounded-xl bg-background border border-border/50 shadow-sm group"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground">{invItem.item.name}</h4>
                  <div className="flex items-center text-sm text-muted-foreground mt-1">
                    <span>{formatCurrency(invItem.priceAtTime)}</span>
                    <span className="mx-2">×</span>
                    <span className="font-medium text-foreground bg-muted px-2 py-0.5 rounded-md">
                      {invItem.quantity}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-bold text-foreground">
                    {formatCurrency(invItem.priceAtTime * invItem.quantity)}
                  </span>
                  {!isCheckedOut && (
                    <button
                      onClick={() => handleRemove(invItem.itemId)}
                      disabled={removeMutation.isPending}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      {removeMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                    </button>
                  )}
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>

      {/* Calculations & Checkout */}
      <div className="p-6 border-t border-border/50 bg-background/50">
        <div className="space-y-3 mb-6 text-sm">
          <div className="flex justify-between text-muted-foreground">
            <span>Subtotal</span>
            <span className="font-medium text-foreground">{formatCurrency(subTotal)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-success">
              <span>Discount (20%)</span>
              <span className="font-medium">-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-muted-foreground">
            <span>Tax (5%)</span>
            <span className="font-medium text-foreground">{formatCurrency(tax)}</span>
          </div>
          
          <div className="pt-3 border-t border-border/50 flex justify-between items-center">
            <span className="text-xl font-bold text-foreground">Total</span>
            <span className="text-3xl font-bold font-display text-[#166534]">
              {formatCurrency(finalAmount)}
            </span>
          </div>
        </div>

        {isCheckedOut ? (
          <div className="grid grid-cols-2 gap-3">
            <Button size="lg" variant="outline" className="w-full h-14 text-lg font-semibold" onClick={() => setIsReceiptOpen(true)}>
              <ReceiptIcon className="mr-2 w-5 h-5" />
              Receipt
            </Button>
            <Button size="lg" className="w-full h-14 text-lg font-semibold bg-[#166534] hover:bg-[#15803d] text-white" onClick={handleNewSale}>
              New Sale
            </Button>
          </div>
        ) : (
          <Button 
            size="lg" 
            className="w-full h-16 text-lg font-bold shadow-xl shadow-success/20 bg-[#166534] hover:bg-[#15803d] text-white transition-all active:scale-[0.98]"
            disabled={isCartEmpty || !activeInvoiceId}
            onClick={() => setIsCheckoutOpen(true)}
          >
            <CreditCard className="mr-2 w-6 h-6" />
            Charge {formatCurrency(finalAmount)}
          </Button>
        )}
      </div>

      {invoice && activeInvoiceId && (
        <>
          <CheckoutModal 
            isOpen={isCheckoutOpen} 
            onClose={() => setIsCheckoutOpen(false)}
            invoiceId={activeInvoiceId}
            totalAmount={finalAmount}
            onSuccess={handleCheckoutComplete}
          />
          <ReceiptModal
            isOpen={isReceiptOpen}
            onClose={handleNewSale}
            invoice={invoice}
          />
        </>
      )}
    </div>
  );
}
