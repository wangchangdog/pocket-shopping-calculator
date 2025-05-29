import { AddItemForm } from "./components/AddItemForm";
import { ItemList } from "./components/ItemList";
import { TaxModeToggle } from "./components/TaxModeToggle";
import { TotalDisplay } from "./components/TotalDisplay";

export function HomePage() {
  return (
    <div className="max-w-md mx-auto px-4 py-6">
      {/* ヘッダー */}
      <header className="text-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          ポケット会計
        </h1>
        <p className="text-sm text-gray-600">
          買い物中の合計金額を簡単計算
        </p>
      </header>

      {/* 合計金額表示 */}
      <TotalDisplay />

      {/* 税設定 */}
      <TaxModeToggle />

      {/* 商品追加フォーム */}
      <AddItemForm />

      {/* 商品一覧 */}
      <ItemList />

      {/* フッター */}
      <footer className="mt-8 text-center text-xs text-gray-500">
        <p>データはお使いのデバイスにのみ保存されます</p>
      </footer>
    </div>
  );
} 