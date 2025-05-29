import type { ShoppingItem } from "../../../../../types";
import { useShoppingContext } from "../../../../context/ShoppingContext";

export interface UseItemListReturn {
  items: ShoppingItem[];
  handleClearAll: () => void;
}

export const useItemList = (): UseItemListReturn => {
  const { session, dispatch } = useShoppingContext();
  const { items } = session;

  const handleClearAll = () => {
    if (items.length === 0) {
      return;
    }

    if (window.confirm("すべての商品を削除しますか？")) {
      dispatch({ type: "CLEAR_SESSION" });
    }
  };

  return {
    items,
    handleClearAll,
  };
}; 