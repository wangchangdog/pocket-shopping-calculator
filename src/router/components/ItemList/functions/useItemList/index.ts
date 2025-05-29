import { useShoppingContext } from "../../../../../shared/components/context/ShoppingContext";
import type { ShoppingItem } from "../../../../../types";

export interface UseItemListReturn {
  items: ShoppingItem[];
  handleClearAll: () => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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

  const removeItem = (id: string) => {
    dispatch({ type: "REMOVE_ITEM", payload: id });
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id);
      return;
    }

    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id, quantity },
    });
  };

  return {
    items,
    handleClearAll,
    removeItem,
    updateQuantity,
  };
};
