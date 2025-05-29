import type React from "react";
import type { ShoppingItem } from "../../../../../types";
import { formatPrice } from "../../../../../utils/calculations";
import { useItemRow } from "./functions/useItemRow";

interface ItemRowProps {
  item: ShoppingItem;
}

export const ItemRow: React.FC<ItemRowProps> = ({ item }) => {
  const {
    isEditing,
    editQuantity,
    setEditQuantity,
    handleDelete,
    handleQuantityEdit,
    handleQuantitySubmit,
    handleQuantityCancel,
  } = useItemRow(item);

  const totalPrice = item.price * item.quantity;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {item.name}
          </h4>
          <div className="mt-1 flex items-center space-x-2 text-sm text-gray-500">
            <span>¥{formatPrice(item.price)}</span>
            <span>×</span>
            {isEditing ? (
              <div className="flex items-center space-x-1">
                <input
                  type="number"
                  value={editQuantity}
                  onChange={(e) => setEditQuantity(e.target.value)}
                  min="1"
                  className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={handleQuantitySubmit}
                  className="text-blue-600 hover:text-blue-800 text-xs"
                >
                  ✓
                </button>
                <button
                  type="button"
                  onClick={handleQuantityCancel}
                  className="text-gray-600 hover:text-gray-800 text-xs"
                >
                  ✕
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleQuantityEdit}
                className="text-blue-600 hover:text-blue-800 underline"
              >
                {item.quantity}個
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-semibold text-gray-900">
              ¥{formatPrice(totalPrice)}
            </div>
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 p-1"
            title="削除"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-label="削除"
            >
              <title>削除</title>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};
