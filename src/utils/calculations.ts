import type { ShoppingItem, TaxMode } from "../types";

/**
 * 税込価格を計算
 */
export const calculateTaxIncluded = (
  price: number,
  taxRate: number
): number => {
  return Math.round(price * (1 + taxRate / 100));
};

/**
 * 税抜価格を計算
 */
export const calculateTaxExcluded = (
  price: number,
  taxRate: number
): number => {
  return Math.round(price / (1 + taxRate / 100));
};

/**
 * 税額を計算
 */
export const calculateTaxAmount = (
  price: number,
  taxRate: number,
  taxMode: TaxMode
): number => {
  if (taxMode === "included") {
    // 税込価格から税額を逆算
    return Math.round(price - price / (1 + taxRate / 100));
  }
  // 税抜価格から税額を計算
  return Math.round(price * (taxRate / 100));
};

/**
 * 商品リストの合計金額を計算
 */
export const calculateTotal = (
  items: ShoppingItem[],
  taxMode: TaxMode,
  taxRate: number
): number => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (taxMode === "included") {
    return subtotal;
  }
  return calculateTaxIncluded(subtotal, taxRate);
};

/**
 * 商品リストの税抜合計を計算
 */
export const calculateSubtotal = (
  items: ShoppingItem[],
  taxMode: TaxMode,
  taxRate: number
): number => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  if (taxMode === "excluded") {
    return subtotal;
  }
  return calculateTaxExcluded(subtotal, taxRate);
};

/**
 * 商品リストの税額合計を計算
 */
export const calculateTotalTax = (
  items: ShoppingItem[],
  taxMode: TaxMode,
  taxRate: number
): number => {
  const subtotal = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  return calculateTaxAmount(subtotal, taxRate, taxMode);
};

/**
 * 金額をフォーマット（カンマ区切り）
 */
export const formatPrice = (price: number): string => {
  return price.toLocaleString("ja-JP");
};
