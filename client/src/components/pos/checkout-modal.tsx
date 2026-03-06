import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCheckoutInvoice } from "@/hooks/use-pos";
import { formatCurrency } from "@/lib/utils";
import { Banknote, Loader2 } from "lucide-react";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoiceId: number;
  totalAmount: number;
  onSuccess: () => void;
}

export function CheckoutModal({ isOpen, onClose, invoiceId, totalAmount, onSuccess }: CheckoutModalProps) {
  const [cashPaid, setCashPaid] = useState<string>("");
  const checkoutMutation = useCheckoutInvoice();
  
  // Quick exact amount preset
  useEffect(() => {
    if (isOpen) setCashPaid(totalAmount.toString());
  }, [isOpen, totalAmount]);

  const numCash = parseFloat(cashPaid) || 0;
  const change = Math.max(0, numCash - totalAmount);
  const isValid = numCash >= totalAmount;

  const handleCheckout = () => {
    if (!isValid) return;
    checkoutMutation.mutate(
      { invoiceId, cashPaid: numCash },
      { onSuccess: () => {
          onSuccess();
      }}
    );
  };

  const presetAmounts = [
    totalAmount,
    Math.ceil(totalAmount / 10) * 10,
    Math.ceil(totalAmount / 50) * 50,
    Math.ceil(totalAmount / 100) * 100
  ].filter((v, i, a) => a.indexOf(v) === i && v >= totalAmount);

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md border-0 shadow-2xl rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-success"></div>
        <DialogHeader className="pt-4">
          <DialogTitle className="text-2xl flex items-center gap-2">
            <Banknote className="w-6 h-6 text-success" />
            Payment
          </DialogTitle>
          <DialogDescription>
            Enter the cash amount received from the customer.
          </DialogDescription>
        </DialogHeader>

        <div className="py-6 space-y-6">
          <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
            <span className="text-muted-foreground font-medium">Total Due</span>
            <span className="text-3xl font-bold text-foreground font-display">
              {formatCurrency(totalAmount)}
            </span>
          </div>

          <div className="space-y-3">
            <Label htmlFor="cashPaid" className="text-base">Cash Received</Label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-medium text-lg">Rs.</span>
              <Input
                id="cashPaid"
                type="number"
                min={totalAmount}
                step="1"
                value={cashPaid}
                onChange={(e) => setCashPaid(e.target.value)}
                className="pl-12 h-14 text-2xl font-bold rounded-xl bg-background border-2 focus-visible:ring-success"
                autoFocus
              />
            </div>
            
            <div className="flex gap-2 mt-2">
              {presetAmounts.slice(0, 4).map(amount => (
                <Button 
                  key={amount} 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCashPaid(amount.toString())}
                  className="flex-1"
                >
                  {formatCurrency(amount)}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-primary/5 rounded-xl border border-primary/10">
            <span className="text-primary font-medium">Change Due</span>
            <span className={`text-2xl font-bold font-display ${isValid ? 'text-success' : 'text-muted-foreground'}`}>
              {formatCurrency(change)}
            </span>
          </div>
        </div>

        <DialogFooter className="sm:justify-stretch gap-2">
          <Button variant="outline" onClick={onClose} className="h-12 w-full rounded-xl bg-destructive hover:bg-destructive/90 text-white font-bold">
            Cancel
          </Button>
          <Button 
            onClick={handleCheckout} 
            disabled={!isValid || checkoutMutation.isPending}
            className="h-12 w-full rounded-xl bg-[#166534] hover:bg-[#15803d] text-white font-bold text-lg shadow-lg shadow-success/20"
          >
            {checkoutMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : "Receive Cash"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
