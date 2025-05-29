import { useShoppingContext } from "@/context/ShoppingContext";
import type { ShoppingItem } from "@/types";
import { useState } from "react";

export interface UseItemRowReturn {
  isEditing: boolean;
  editQuantity: string;
  setEditQuantity: (quantity: string) => void;
  handleDelete: () => void;
  handleQuantityEdit: () => void;
  handleQuantitySubmit: () => void;
  handleQuantityCancel: () => void;
}

export const useItemRow = (item: ShoppingItem): UseItemRowReturn => {
  const { dispatch } = useShoppingContext();
  const [isEditing, setIsEditing] = useState(false);
  const [editQuantity, setEditQuantity] = useState(item.quantity.toString());

  const handleDelete = () => {
    if (window.confirm(`「${item.name}」を削除しますか？`)) {
      dispatch({ type: "REMOVE_ITEM", payload: item.id });
    }
  };

  const handleQuantityEdit = () => {
    setIsEditing(true);
    setEditQuantity(item.quantity.toString());
  };

  const validateQuantity = (
    quantity: string
  ): { isValid: boolean; error?: string } => {
    const newQuantity = Number.parseInt(quantity);

    if (Number.isNaN(newQuantity) || newQuantity <= 0) {
      return { isValid: false, error: "正しい数量を入力してください" };
    }

    return { isValid: true };
  };

  const handleQuantitySubmit = () => {
    const validation = validateQuantity(editQuantity);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const newQuantity = Number.parseInt(editQuantity);
    dispatch({
      type: "UPDATE_QUANTITY",
      payload: { id: item.id, quantity: newQuantity },
    });
    setIsEditing(false);
  };

  const handleQuantityCancel = () => {
    setEditQuantity(item.quantity.toString());
    setIsEditing(false);
  };

  return {
    isEditing,
    editQuantity,
    setEditQuantity,
    handleDelete,
    handleQuantityEdit,
    handleQuantitySubmit,
    handleQuantityCancel,
  };
};
