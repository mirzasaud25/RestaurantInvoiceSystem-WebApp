import { createContext, useContext, useState, ReactNode, useEffect } from "react";

interface CashierState {
  cashierName: string;
  cashierId: string;
  counterNo: string;
  activeInvoiceId: number | null;
}

interface CashierContextType extends CashierState {
  setCashier: (data: Omit<CashierState, "activeInvoiceId">) => void;
  setActiveInvoice: (id: number | null) => void;
  logout: () => void;
  isConfigured: boolean;
}

const CashierContext = createContext<CashierContextType | undefined>(undefined);

export function CashierProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<CashierState>(() => {
    const saved = localStorage.getItem("pos_cashier_state");
    return saved ? JSON.parse(saved) : {
      cashierName: "",
      cashierId: "",
      counterNo: "",
      activeInvoiceId: null
    };
  });

  useEffect(() => {
    localStorage.setItem("pos_cashier_state", JSON.stringify(state));
  }, [state]);

  const setCashier = (data: Omit<CashierState, "activeInvoiceId">) => {
    setState(prev => ({ ...prev, ...data }));
  };

  const setActiveInvoice = (id: number | null) => {
    setState(prev => ({ ...prev, activeInvoiceId: id }));
  };

  const logout = () => {
    setState({ cashierName: "", cashierId: "", counterNo: "", activeInvoiceId: null });
    localStorage.removeItem("pos_cashier_state");
  };

  const isConfigured = Boolean(state.cashierName && state.cashierId && state.counterNo);

  return (
    <CashierContext.Provider value={{ ...state, setCashier, setActiveInvoice, logout, isConfigured }}>
      {children}
    </CashierContext.Provider>
  );
}

export function useCashier() {
  const context = useContext(CashierContext);
  if (context === undefined) {
    throw new Error("useCashier must be used within a CashierProvider");
  }
  return context;
}
