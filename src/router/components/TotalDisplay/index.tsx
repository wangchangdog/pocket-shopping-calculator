import type React from "react";
import { formatPrice } from "../../../utils/calculations";
import { useTotalDisplay } from "./functions/useTotalDisplay";

export const TotalDisplay: React.FC = () => {
  const { totalAmount, subtotal, taxAmount, itemCount, taxMode, taxRate } =
    useTotalDisplay();

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
      <div className="text-center">
        <h2 className="text-lg font-semibold text-gray-700 mb-2">合計金額</h2>
        <div className="text-4xl font-bold text-blue-600 mb-4">
          ¥{formatPrice(totalAmount)}
        </div>

        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex justify-between">
            <span>商品点数:</span>
            <span>{itemCount}点</span>
          </div>

          {taxMode === "excluded" ? (
            <>
              <div className="flex justify-between">
                <span>小計（税抜）:</span>
                <span>¥{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>消費税（{taxRate}%）:</span>
                <span>¥{formatPrice(taxAmount)}</span>
              </div>
            </>
          ) : (
            <>
              <div className="flex justify-between">
                <span>小計（税抜）:</span>
                <span>¥{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>消費税（{taxRate}%）:</span>
                <span>¥{formatPrice(taxAmount)}</span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
