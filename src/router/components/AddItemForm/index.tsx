import { Camera } from "lucide-react";
import type React from "react";
import { useState } from "react";
import OCRCamera from "../../../shared/components/OCRCamera";
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

  const [isOCRCameraOpen, setIsOCRCameraOpen] = useState(false);

  const handlePriceDetected = (price: number, productName?: string) => {
    setFormData({
      ...formData,
      price: price.toString(),
      name: productName || formData.name,
    });
    setIsOCRCameraOpen(false);
  };

  if (!isOpen) {
    return (
      <div className="mb-6 space-y-3">
        <button
          type="button"
          onClick={handleOpenForm}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <span className="text-xl">+</span>
          <span>商品を追加</span>
        </button>

        <button
          type="button"
          onClick={() => setIsOCRCameraOpen(true)}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-4 px-6 rounded-lg shadow-md transition-colors flex items-center justify-center space-x-2"
        >
          <Camera size={20} />
          <span>価格をスキャン</span>
        </button>

        <OCRCamera
          isOpen={isOCRCameraOpen}
          onClose={() => setIsOCRCameraOpen(false)}
          onPriceDetected={handlePriceDetected}
        />
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
          <div className="flex space-x-2">
            <div className="flex-1 relative">
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
            <button
              type="button"
              onClick={() => setIsOCRCameraOpen(true)}
              className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-md transition-colors flex items-center justify-center"
              title="価格をスキャン"
            >
              <Camera size={18} />
            </button>
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

      <OCRCamera
        isOpen={isOCRCameraOpen}
        onClose={() => setIsOCRCameraOpen(false)}
        onPriceDetected={handlePriceDetected}
      />
    </div>
  );
};
