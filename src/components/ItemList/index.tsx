import type React from "react";
import { ItemListFunction } from "./function";
import { useItemList } from "./useItemList";

export const ItemList: React.FC = () => {
  const hook = useItemList();

  return <ItemListFunction hook={hook} />;
}; 