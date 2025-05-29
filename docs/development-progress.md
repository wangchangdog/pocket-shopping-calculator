# ポケット会計 - 開発進捗管理

このファイルは、ポケット会計の開発進捗を管理するためのファイルです。

## 開発フェーズ

### Phase 1: 技術検証・MVP実装
**目標**: 基本的な手動入力機能と税込/税抜計算の実装

#### 完了項目
- [x] プロジェクト初期設定
- [x] 基本UI構成の実装
- [x] 商品手動入力機能
- [x] 税込/税抜計算機能
- [x] ローカルストレージ保存機能
- [x] 商品一覧表示機能
- [x] 商品削除機能
- [x] 合計金額リアルタイム更新

#### 技術検証項目
- [x] React + TypeScript + Vite環境構築
- [x] Tailwind CSS UI実装
- [x] ローカルストレージでのデータ永続化
- [x] レスポンシブデザイン対応

### Phase 2: OCR機能実装
**目標**: カメラを使用した価格自動認識機能の実装

#### 完了項目
- [x] OCRライブラリ調査・選定（Tesseract.js採用）
- [x] OCRユーティリティ実装（`src/utils/ocr.ts`）
- [x] カメラユーティリティ実装（`src/utils/camera.ts`）
- [x] OCRカメラコンポーネント実装（`src/router/components/OCRCamera/`）
- [x] AddItemFormへのOCR機能統合
- [x] 価格認識・抽出ロジック実装
- [x] 画像前処理機能（コントラスト向上、グレースケール変換）

#### 技術実装詳細
- **OCRエンジン**: Tesseract.js v6.0.1
- **価格認識パターン**: 日本円対応（¥、円記号）
- **カメラ機能**: MediaDevices API使用
- **画像処理**: Canvas API使用
- **UI統合**: 既存フォームにシームレス統合

#### 実装機能
- [x] カメラ撮影による価格認識
- [x] 画像ファイルアップロード対応
- [x] 複数価格候補の信頼度ランキング
- [x] 認識結果の確認・修正UI
- [x] エラーハンドリング
- [x] カメラ切り替え（前面/背面）
- [x] リアルタイムプレビュー

### Phase 3: PWA対応・最適化（予定）
- [ ] Service Worker実装
- [ ] オフライン対応
- [ ] アプリマニフェスト作成

## 技術スタック

### 確定技術
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API + useReducer
- **データ保存**: localStorage
- **OCRエンジン**: Tesseract.js v6.0.1
- **アイコン**: Lucide React

### 検証予定技術
- **PWA**: Workbox

## データ構造実装

```typescript
// 商品アイテム
interface ShoppingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  addedAt: string;
}

// 買い物セッション
interface ShoppingSession {
  sessionId: string;
  taxMode: 'included' | 'excluded';
  taxRate: number;
  items: ShoppingItem[];
  totalAmount: number;
  createdAt: string;
  updatedAt: string;
}

// アプリ設定
interface AppSettings {
  defaultTaxRate: number;
  defaultTaxMode: 'included' | 'excluded';
  enableHistory: boolean;
}

// OCR関連
interface OCRResult {
  text: string;
  confidence: number;
  bbox: { x0: number; y0: number; x1: number; y1: number; };
}

interface OCRProcessResult {
  recognizedText: string;
  confidence: number;
  detectedPrice?: number;
  suggestions: string[];
}
```

## 実装メモ

### 2024-12-19
- プロジェクト開始
- 要件定義書・シーケンス図確認完了
- 開発進捗管理ファイル作成
- **Phase 1 MVP実装完了**
  - 型定義作成（`src/types/index.ts`）
  - 計算ロジック実装（`src/utils/calculations.ts`）
  - ローカルストレージ管理（`src/utils/storage.ts`）
  - 状態管理（`src/context/ShoppingContext.tsx`）
  - UIコンポーネント実装
    - 合計金額表示（`TotalDisplay`）
    - 税設定切り替え（`TaxModeToggle`）
    - 商品追加フォーム（`AddItemForm`）
    - 商品一覧（`ItemList`）
  - メインアプリ統合（`src/App.tsx`）
  - スマートフォン向けCSS最適化

- **Phase 2 OCR機能実装完了**
  - OCRライブラリ調査・比較分析
    - Tesseract.js、EasyOCR、@gutenye/ocr-browser等を検証
    - オフライン動作、ブラウザ対応、精度を総合評価
  - Tesseract.js v6.0.1採用決定
  - OCRユーティリティ実装
    - 価格認識パターン（¥、円対応）
    - 信頼度ベース候補ランキング
    - 画像前処理（グレースケール、コントラスト向上）
  - カメラ機能実装
    - MediaDevices API統合
    - 前面/背面カメラ切り替え
    - 画像キャプチャ・リサイズ
  - OCRカメラコンポーネント実装
    - フルスクリーンカメラUI
    - リアルタイムプレビュー
    - 認識結果確認画面
  - 既存UIへの統合
    - AddItemFormにカメラボタン追加
    - シームレスな価格入力フロー

## 実装済み機能

### ✅ 基本機能
- 商品の手動入力（価格、商品名、数量）
- 税込/税抜の切り替え
- リアルタイム合計金額計算
- 商品一覧表示
- 商品の個別削除
- 数量の編集
- セッションデータの自動保存・復元

### ✅ OCR機能
- カメラによる価格自動認識
- 画像ファイルからの価格抽出
- 日本円価格パターン認識（¥1,000、1000円等）
- 複数価格候補の信頼度ランキング
- 認識結果の確認・修正UI
- 画像前処理による認識精度向上
- エラーハンドリング・リトライ機能

### ✅ UI/UX
- スマートフォン最適化デザイン
- タッチ操作対応
- レスポンシブレイアウト
- 直感的な操作フロー
- フルスクリーンカメラインターフェース
- リアルタイムプレビュー

### ✅ データ管理
- ローカルストレージでの永続化
- セッション管理
- データの自動保存

## 課題・検討事項

### 技術的課題
- [x] OCRの精度検証 → Tesseract.js + 画像前処理で対応
- [x] カメラAPI対応ブラウザの確認 → MediaDevices API使用
- [ ] PWA対応時のキャッシュ戦略

### UI/UX課題
- [x] スマートフォン最適化 → 完了
- [x] 片手操作対応 → 完了
- [ ] アクセシビリティ対応

### OCR精度向上
- [x] 画像前処理実装
- [x] 価格パターン最適化
- [ ] 機械学習モデルの追加検討（将来的）

## 次のアクション
1. ✅ 基本的なReactコンポーネント構造の実装
2. ✅ 商品追加・削除機能の実装
3. ✅ 税計算ロジックの実装
4. ✅ ローカルストレージ連携の実装
5. ✅ OCR機能の技術検証・実装
6. **次回**: PWA対応の実装開始 