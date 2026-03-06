import { useState } from "react";
import { useLocation } from "wouter";
import { useCashier } from "@/lib/cashier-context";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Store, MonitorSmartphone, BadgeAlert, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import logoImg from "@assets/Gemini_Generated_Image_gmbgwmgmbgwmgmbg_1772055003421.png";

export default function Setup() {
  const [, setLocation] = useLocation();
  const { setCashier } = useCashier();
  
  const [formData, setFormData] = useState({
    cashierName: "",
    cashierId: "",
    counterNo: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.cashierName && formData.cashierId && formData.counterNo) {
      setCashier(formData);
      setLocation("/pos");
    }
  };

  return (
    <div className="min-h-screen bg-muted/30 flex items-center justify-center p-4">
      {/* Decorative Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-success/5 blur-[100px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="mx-auto w-32 h-32 mb-4 drop-shadow-2xl">
            <img 
              src={logoImg} 
              alt="Peace FastFood Logo" 
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>
          <h1 className="text-3xl font-bold font-display tracking-tight text-foreground">Peace FastFood</h1>
          <p className="text-muted-foreground mt-2">POS Terminal Setup</p>
        </div>

        <Card className="border-border/50 shadow-xl bg-background/80 backdrop-blur-xl">
          <CardHeader>
            <CardTitle>Open Register</CardTitle>
            <CardDescription>Enter your details to start the shift.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="cashierName" className="flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 text-muted-foreground" />
                  Cashier Name
                </Label>
                <Input 
                  id="cashierName" 
                  placeholder="e.g. Jane Doe"
                  value={formData.cashierName}
                  onChange={e => setFormData(p => ({...p, cashierName: e.target.value}))}
                  required
                  className="h-12 bg-background"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="cashierId" className="flex items-center gap-2">
                  <BadgeAlert className="w-4 h-4 text-muted-foreground" />
                  Cashier ID
                </Label>
                <Input 
                  id="cashierId" 
                  placeholder="e.g. EMP-1042"
                  value={formData.cashierId}
                  onChange={e => setFormData(p => ({...p, cashierId: e.target.value}))}
                  required
                  className="h-12 bg-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="counterNo" className="flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-muted-foreground" />
                  Counter Number
                </Label>
                <Input 
                  id="counterNo" 
                  placeholder="e.g. Counter 01"
                  value={formData.counterNo}
                  onChange={e => setFormData(p => ({...p, counterNo: e.target.value}))}
                  required
                  className="h-12 bg-background"
                />
              </div>

              <Button type="submit" className="w-full h-12 text-lg mt-4 group bg-[#166534] hover:bg-[#15803d] text-white font-bold">
                Start Shift
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
