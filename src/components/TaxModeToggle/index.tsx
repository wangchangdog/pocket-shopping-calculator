import type React from "react";
import { useTaxModeToggle } from "./functions/useTaxModeToggle";

export const TaxModeToggle: React.FC = () => {
  const { taxMode, taxRate, handleTaxModeChange } = useTaxModeToggle();

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-700">税設定</h3>
        <span className="text-xs text-gray-500">消費税率: {taxRate}%</span>
      </div>

      <div className="flex bg-gray-100 rounded-lg p-1">
        <button
          type="button"
          onClick={() => handleTaxModeChange("included")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${taxMode === "included"
            ? "bg-blue-500 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          税込
        </button>
        <button
          type="button"
          onClick={() => handleTaxModeChange("excluded")}
          className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${taxMode === "excluded"
            ? "bg-blue-500 text-white shadow-sm"
            : "text-gray-600 hover:text-gray-800"
            }`}
        >
          税抜
        </button>
      </div>
    </div>
  );
}; 