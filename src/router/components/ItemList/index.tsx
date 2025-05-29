import type React from "react";
import { ItemRow } from "./components/ItemRow";
import { useItemList } from "./functions/useItemList";

export const ItemList: React.FC = () => {
  const { items, handleClearAll } = useItemList();

  if (items.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg p-8 text-center">
        <div className="text-gray-400 mb-2">
          <svg
            className="w-12 h-12 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-label="空のカゴ"
          >
            <title>空のカゴ</title>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-sm">まだ商品が追加されていません</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">
          商品一覧 ({items.length}件)
        </h3>
        <button
          type="button"
          onClick={handleClearAll}
          className="text-sm text-red-600 hover:text-red-800 underline"
        >
          すべて削除
        </button>
      </div>

      <div className="space-y-3">
        {items.map((item) => (
          <ItemRow key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
};
