import { useShoppingContext } from "../../context/ShoppingContext";
import type { TaxMode } from "../../types";
import {
  calculateSubtotal,
  calculateTotalTax,
} from "../../utils/calculations";

export interface UseTotalDisplayReturn {
  totalAmount: number;
  subtotal: number;
  taxAmount: number;
  itemCount: number;
  taxMode: TaxMode;
  taxRate: number;
}

export const useTotalDisplay = (): UseTotalDisplayReturn => {
  const { session } = useShoppingContext();
  const { items, taxMode, taxRate, totalAmount } = session;

  const subtotal = calculateSubtotal(items, taxMode, taxRate);
  const taxAmount = calculateTotalTax(items, taxMode, taxRate);
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return {
    totalAmount,
    subtotal,
    taxAmount,
    itemCount,
    taxMode,
    taxRate,
  };
};
