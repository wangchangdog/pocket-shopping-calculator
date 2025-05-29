import type React from "react";
import { useAddItemForm } from "./functions/useAddItemForm";

export const AddItemForm: React.FC = () => {
  const {
    isOpen,
    formData,
    setFormData,
    handleSubmit,
    handleCancel,
    handleOpenForm,
  } = useAddItemForm();

  if (!isOpen) {
    return (
      <div className="mb-6">
        <button
          type="button"
          onClick={handleOpenForm}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <span className="text-xl">+</span>
          <span>商品を追加</span>
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">商品を追加</h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="itemName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            商品名（任意）
          </label>
          <input
            type="text"
            id="itemName"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="商品名を入力"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div>
          <label
            htmlFor="itemPrice"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            価格 *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-gray-500">¥</span>
            <input
              type="number"
              id="itemPrice"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
              placeholder="0"
              min="0"
              step="1"
              required={true}
              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="itemQuantity"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            数量
          </label>
          <input
            type="number"
            id="itemQuantity"
            value={formData.quantity}
            onChange={(e) =>
              setFormData({ ...formData, quantity: e.target.value })
            }
            min="1"
            step="1"
            required={true}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="flex space-x-3 pt-2">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-md transition-colors"
          >
            追加
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors"
          >
            キャンセル
          </button>
        </div>
      </form>
    </div>
  );
};
