import type React from "react";
import type { ShoppingItem } from "../../types";
import { ItemRowFunction } from "./ItemRowFunction";
import { useItemRow } from "./useItemRow";

interface ItemRowProps {
  item: ShoppingItem;
}

export const ItemRow: React.FC<ItemRowProps> = ({ item }) => {
  const hook = useItemRow(item);

  return <ItemRowFunction item={item} hook={hook} />;
}; 