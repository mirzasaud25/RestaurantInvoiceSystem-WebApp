import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { type InvoiceWithItems } from "@shared/schema";
import { formatCurrency } from "@/lib/utils";
import { Printer, X } from "lucide-react";
import { format } from "date-fns";
import logoImg from "@assets/Gemini_Generated_Image_gmbgwmgmbgwmgmbg_1772055003421.png";

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: InvoiceWithItems;
}

export function ReceiptModal({ isOpen, onClose, invoice }: ReceiptModalProps) {
  // Group identical items for display
  const itemsMap = new Map<number, { item: any; quantity: number; priceAtTime: number }>();
  invoice.items.forEach((invItem) => {
    const existing = itemsMap.get(invItem.itemId);
    if (existing) {
      existing.quantity += invItem.quantity;
    } else {
      itemsMap.set(invItem.itemId, {
        item: invItem.item,
        quantity: invItem.quantity,
        priceAtTime: invItem.priceAtTime,
      });
    }
  });
  const groupedItems = Array.from(itemsMap.values());

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      {/* Hidden title for accessibility */}
      <DialogTitle className="sr-only">Receipt</DialogTitle>
      <DialogDescription className="sr-only">Printable receipt for the transaction.</DialogDescription>

      <DialogContent className="sm:max-w-[400px] p-0 overflow-hidden bg-white text-black">
        {/* Actions - hidden when printing */}
        <div className="flex justify-between items-center gap-2 p-2 bg-slate-100 print:hidden border-b">
          <Button variant="outline" size="sm" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Print
          </Button>
          <Button variant="default" size="sm" onClick={onClose} className="font-bold bg-[#166534] hover:bg-[#15803d] text-white">
            Confirm
          </Button>
        </div>

        {/* Printable Area */}
        <div id="receipt-print-area" className="p-8 font-mono text-sm bg-white">
          <div className="text-center mb-6">
            <div className="w-24 h-24 mx-auto mb-4 grayscale">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-2xl font-bold mb-1 tracking-widest uppercase">PEACE FASTFOOD</h1>
            <p className="text-xs text-gray-500">Surjani Town Karachi</p>
            <p className="text-xs text-gray-500">Tel: 032122325215</p>
          </div>

          <div className="border-y border-dashed border-gray-300 py-3 mb-4 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Receipt:</span>
              <span className="font-semibold">{invoice.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{format(new Date(invoice.createdAt), "dd MMM yyyy, HH:mm")}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{invoice.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Counter:</span>
              <span>{invoice.counterNo}</span>
            </div>
          </div>

          <div className="mb-4">
            <div className="grid grid-cols-[1fr_50px_80px] font-bold border-b border-gray-800 pb-1 mb-2">
              <span>Item</span>
              <span className="text-center">Qty</span>
              <span className="text-right">Total</span>
            </div>
            <div className="space-y-2">
              {groupedItems.map((invItem, idx) => (
                <div key={idx} className="grid grid-cols-[1fr_50px_80px] items-start text-xs">
                  <div>
                    <div className="font-semibold">{invItem.item.name}</div>
                    <div className="text-[10px] text-gray-600">
                      {formatCurrency(invItem.priceAtTime)}
                    </div>
                  </div>
                  <div className="text-center font-medium">{invItem.quantity}</div>
                  <div className="text-right font-semibold">
                    {formatCurrency(invItem.quantity * invItem.priceAtTime)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="border-t border-dashed border-gray-300 pt-3 space-y-1">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatCurrency(invoice.subTotal)}</span>
            </div>
            {invoice.discount > 0 && (
              <div className="flex justify-between text-gray-600 font-bold italic">
                <span>You Saved</span>
                <span>{formatCurrency(invoice.discount)}</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Tax (5%)</span>
              <span>{formatCurrency(invoice.tax)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 mt-2 border-t border-gray-800">
              <span>TOTAL</span>
              <span>{formatCurrency(invoice.finalAmount)}</span>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-dashed border-gray-300 space-y-1 text-xs">
            <div className="flex justify-between">
              <span>Cash Paid:</span>
              <span>{formatCurrency(invoice.cashPaid)}</span>
            </div>
            <div className="flex justify-between font-bold">
              <span>Change:</span>
              <span>{formatCurrency(invoice.cashBack)}</span>
            </div>
          </div>

          <div className="text-center mt-8 text-xs text-gray-500 border-t border-dashed border-gray-300 pt-4">
            <p className="font-bold text-gray-800 mb-1">Software Developed by MSH</p>
            <p>Thank you for your visit!</p>
            <p>Please come again</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
