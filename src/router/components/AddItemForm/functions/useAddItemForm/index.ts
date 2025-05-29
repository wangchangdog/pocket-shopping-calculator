import { useShoppingContext } from "@/context/ShoppingContext";
import type React from "react";
import { useState } from "react";

export interface FormData {
  name: string;
  price: string;
  quantity: string;
}

export interface UseAddItemFormReturn {
  isOpen: boolean;
  formData: FormData;
  setIsOpen: (isOpen: boolean) => void;
  setFormData: (formData: FormData) => void;
  handleSubmit: (e: React.FormEvent) => void;
  handleCancel: () => void;
  handleOpenForm: () => void;
}

const initialFormData: FormData = {
  name: "",
  price: "",
  quantity: "1",
};

export const useAddItemForm = (): UseAddItemFormReturn => {
  const { dispatch } = useShoppingContext();
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<FormData>(initialFormData);

  const resetForm = () => {
    setFormData(initialFormData);
  };

  const validateForm = (
    data: FormData
  ): { isValid: boolean; error?: string } => {
    const price = Number.parseFloat(data.price);
    const quantity = Number.parseInt(data.quantity);

    if (Number.isNaN(price) || price <= 0) {
      return { isValid: false, error: "正しい価格を入力してください" };
    }

    if (Number.isNaN(quantity) || quantity <= 0) {
      return { isValid: false, error: "正しい数量を入力してください" };
    }

    return { isValid: true };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validation = validateForm(formData);
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    const price = Number.parseFloat(formData.price);
    const quantity = Number.parseInt(formData.quantity);

    dispatch({
      type: "ADD_ITEM",
      payload: {
        name: formData.name || "商品",
        price,
        quantity,
      },
    });

    resetForm();
    setIsOpen(false);
  };

  const handleCancel = () => {
    resetForm();
    setIsOpen(false);
  };

  const handleOpenForm = () => {
    setIsOpen(true);
  };

  return {
    isOpen,
    formData,
    setIsOpen,
    setFormData,
    handleSubmit,
    handleCancel,
    handleOpenForm,
  };
};
