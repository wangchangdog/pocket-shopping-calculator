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

### Phase 3: PWA対応・最適化
**目標**: Progressive Web App対応によるネイティブアプリ体験の提供

#### 完了項目
- [x] Vite PWAプラグイン導入（vite-plugin-pwa）
- [x] Web App Manifest作成（`public/manifest.json`）
- [x] Service Worker自動生成・登録
- [x] PWAアイコン生成（72x72〜512x512の8サイズ）
- [x] PWAインストールプロンプト実装
- [x] オフライン対応・キャッシュ戦略
- [x] アプリ更新通知機能
- [x] PWA状態管理（React Context）

#### 技術実装詳細
- **PWAフレームワーク**: Vite PWA Plugin + Workbox
- **Service Worker**: 自動生成（generateSW戦略）
- **キャッシュ戦略**: 
  - アプリリソース: Precache
  - 画像: CacheFirst（30日間）
  - フォント: CacheFirst（1年間）
- **マニフェスト**: 日本語対応、ショートカット機能付き
- **アイコン**: Canvas APIで動的生成（電卓+カメラデザイン）

#### 実装機能
- [x] ホーム画面へのインストール対応
- [x] スタンドアロンモード表示
- [x] オフライン動作（基本機能）
- [x] 自動アップデート通知
- [x] インストールプロンプト（24時間間隔制御）
- [x] PWA状態監視（オンライン/オフライン）
- [x] アプリショートカット（新規計算開始）

### Phase 4: 追加機能・改善（予定）
- [ ] 履歴機能の実装
- [ ] データエクスポート機能
- [ ] 設定画面の追加
- [ ] アクセシビリティ対応強化

## 技術スタック

### 確定技術
- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API + useReducer
- **データ保存**: localStorage
- **OCRエンジン**: Tesseract.js v6.0.1
- **PWA**: Vite PWA Plugin + Workbox
- **アイコン**: Lucide React

### 検証予定技術
- **アナリティクス**: Google Analytics（将来的）

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

// PWA関連
interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  updateSW: () => Promise<void>;
  offlineReady: boolean;
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

- **Phase 3 PWA対応実装完了**
  - PWA技術スタック構築
    - vite-plugin-pwa v0.21.1導入
    - Workbox v7統合
    - TypeScript型定義追加
  - Web App Manifest実装
    - 日本語対応マニフェスト作成
    - 8サイズのPWAアイコン生成
    - アプリショートカット設定
  - Service Worker実装
    - 自動生成戦略（generateSW）
    - キャッシュ戦略設定
      - プリキャッシュ: アプリリソース
      - ランタイムキャッシュ: 画像、フォント
    - オフライン対応
  - PWA UI実装
    - インストールプロンプト（`PWAInstallPrompt`）
    - 更新通知システム
    - PWA状態管理（`PWAContext`）
  - アイコン生成システム
    - Canvas APIベースの動的生成
    - 電卓+カメラのオリジナルデザイン
    - 複数サイズ自動生成

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

### ✅ PWA機能
- ホーム画面へのインストール
- オフライン動作対応
- 自動アップデート通知
- スタンドアロンモード表示
- アプリアイコン・スプラッシュ画面
- プッシュ通知対応（基盤）
- キャッシュ最適化

### ✅ UI/UX
- スマートフォン最適化デザイン
- タッチ操作対応
- レスポンシブレイアウト
- 直感的な操作フロー
- フルスクリーンカメラインターフェース
- リアルタイムプレビュー
- PWAインストールガイダンス

### ✅ データ管理
- ローカルストレージでの永続化
- セッション管理
- データの自動保存
- オフラインデータ同期

## 課題・検討事項

### 技術的課題
- [x] OCRの精度検証 → Tesseract.js + 画像前処理で対応
- [x] カメラAPI対応ブラウザの確認 → MediaDevices API使用
- [x] PWA対応時のキャッシュ戦略 → Workboxで最適化済み
- [ ] 大量データ時のパフォーマンス最適化

### UI/UX課題
- [x] スマートフォン最適化 → 完了
- [x] 片手操作対応 → 完了
- [x] PWAインストール体験 → 完了
- [ ] アクセシビリティ対応

### PWA最適化
- [x] Service Worker実装
- [x] オフライン対応
- [x] インストール体験
- [ ] プッシュ通知機能
- [ ] バックグラウンド同期

## 次のアクション
1. ✅ 基本的なReactコンポーネント構造の実装
2. ✅ 商品追加・削除機能の実装
3. ✅ 税計算ロジックの実装
4. ✅ ローカルストレージ連携の実装
5. ✅ OCR機能の技術検証・実装
6. ✅ PWA対応の実装
7. **次回**: 履歴機能・設定画面の実装開始 