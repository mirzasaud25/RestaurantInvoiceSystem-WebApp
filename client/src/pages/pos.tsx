import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useCashier } from "@/lib/cashier-context";
import { useItems, useCreateInvoice, useAddInvoiceItem } from "@/hooks/use-pos";
import { ItemCard } from "@/components/pos/item-card";
import { CartPane } from "@/components/pos/cart-pane";
import { type Item } from "@shared/schema";
import { Store, LogOut, Clock, Search, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import logoImg from "@assets/Gemini_Generated_Image_gmbgwmgmbgwmgmbg_1772055003421.png";

export default function POS() {
  const [, setLocation] = useLocation();
  const { isConfigured, cashierName, counterNo, activeInvoiceId, setActiveInvoice, logout } = useCashier();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [time, setTime] = useState(new Date());

  const { data: items, isLoading: itemsLoading } = useItems();
  const createInvoiceMutation = useCreateInvoice();
  const addItemMutation = useAddInvoiceItem();

  // Redirect to setup if not configured
  useEffect(() => {
    if (!isConfigured) {
      setLocation("/");
    }
  }, [isConfigured, setLocation]);

  // Live clock
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    logout();
    setLocation("/");
  };

  const handleItemClick = async (item: Item) => {
    try {
      let currentInvoiceId = activeInvoiceId;

      // If no active invoice, create one first
      if (!currentInvoiceId) {
        const newInvoice = await createInvoiceMutation.mutateAsync({
          cashierName,
          cashierId: "temp", // Will be taken from context in full app, hardcoded here for brevity if context lacks it
          counterNo
        });
        currentInvoiceId = newInvoice.id;
        setActiveInvoice(newInvoice.id);
      }

      // Add item to invoice
      await addItemMutation.mutateAsync({
        invoiceId: currentInvoiceId,
        itemId: item.id,
        quantity: 1
      });
      
    } catch (error: any) {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  if (!isConfigured) return null;

  const filteredItems = items?.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex h-screen w-full bg-muted/20 overflow-hidden">
      {/* Left Pane - Menu */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Header */}
        <header className="h-20 px-6 flex items-center justify-between bg-card border-b border-border/50 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 flex items-center justify-center overflow-hidden rounded-xl">
              <img src={logoImg} alt="Logo" className="w-full h-full object-contain" />
            </div>
            <div>
              <h1 className="font-bold font-display text-lg leading-tight">Peace FastFood</h1>
              <p className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                {counterNo} <span className="w-1 h-1 rounded-full bg-border inline-block" /> {cashierName}
              </p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-8 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
            <Input 
              placeholder="Search menu..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-12 bg-muted/50 border-transparent focus-visible:bg-background rounded-xl"
            />
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 px-3 py-1.5 rounded-lg">
              <Clock className="w-4 h-4" />
              {format(time, "HH:mm")}
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10">
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </header>

        {/* Menu Grid */}
        <main className="flex-1 overflow-y-auto p-6">
          {itemsLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="w-8 h-8 animate-spin text-primary/50" />
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 pb-20">
              {filteredItems?.map(item => (
                <ItemCard 
                  key={item.id} 
                  item={item} 
                  onClick={handleItemClick}
                  disabled={createInvoiceMutation.isPending || addItemMutation.isPending}
                />
              ))}
              {filteredItems?.length === 0 && (
                <div className="col-span-full text-center py-20 text-muted-foreground">
                  <p className="text-lg font-medium">No items found</p>
                  <p className="text-sm">Try a different search term.</p>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Right Pane - Cart */}
      <div className="w-[400px] xl:w-[450px] shrink-0 h-full">
        <CartPane />
      </div>
    </div>
  );
}
