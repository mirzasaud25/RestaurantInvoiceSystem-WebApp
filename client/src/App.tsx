import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CashierProvider } from "@/lib/cashier-context";
import NotFound from "@/pages/not-found";

// Import pages
import Setup from "@/pages/setup";
import POS from "@/pages/pos";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Setup}/>
      <Route path="/pos" component={POS}/>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CashierProvider>
          <Toaster />
          <Router />
        </CashierProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
