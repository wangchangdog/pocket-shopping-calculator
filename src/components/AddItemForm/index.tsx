import type React from "react";
import { AddItemFormFunction } from "./function";
import { useAddItemForm } from "./useAddItemForm";

export const AddItemForm: React.FC = () => {
  const hook = useAddItemForm();

  return <AddItemFormFunction hook={hook} />;
}; 