import { useShoppingContext } from "../../../../../shared/components/context/ShoppingContext";
import type { TaxMode } from "../../../../../types";

export interface UseTaxModeToggleReturn {
  taxMode: TaxMode;
  taxRate: number;
  handleTaxModeChange: (mode: TaxMode) => void;
}

export const useTaxModeToggle = (): UseTaxModeToggleReturn => {
  const { session, dispatch } = useShoppingContext();
  const { taxMode, taxRate } = session;

  const handleTaxModeChange = (mode: TaxMode) => {
    dispatch({ type: "SET_TAX_MODE", payload: mode });
  };

  return {
    taxMode,
    taxRate,
    handleTaxModeChange,
  };
};
