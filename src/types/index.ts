// 商品アイテム
export interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: string;
}

// 税込/税抜モード
export type TaxMode = "included" | "excluded";

// 買い物セッション
export interface ShoppingSession {
  sessionId: string;
  taxMode: TaxMode;
  taxRate: number;
  items: ShoppingItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// アプリ設定
export interface AppSettings {
  defaultTaxRate: number;
  defaultTaxMode: TaxMode;
  enableHistory: boolean;
}

// アクション型
export type ShoppingAction =
  | { type: "ADD_ITEM"; payload: Omit<ShoppingItem, "id" | "addedAt"> }
  | { type: "REMOVE_ITEM"; payload: string }
  | { type: "UPDATE_QUANTITY"; payload: { id: string; quantity: number } }
  | { type: "SET_TAX_MODE"; payload: TaxMode }
  | { type: "SET_TAX_RATE"; payload: number }
  | { type: "CLEAR_SESSION" }
  | { type: "LOAD_SESSION"; payload: ShoppingSession };
