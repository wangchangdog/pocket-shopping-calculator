import { useShoppingContext } from "../../../../../shared/components/context/ShoppingContext";
import { calculateSubtotal, calculateTotalTax } from "../../../../../shared/utils/calculations";
import type { ShoppingItem, TaxMode } from "../../../../../types";

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
  const itemCount = items.reduce(
    (sum: number, item: ShoppingItem) => sum + item.quantity,
    0
  );

  return {
    totalAmount,
    subtotal,
    taxAmount,
    itemCount,
    taxMode,
    taxRate,
  };
};
