# ポケット会計

買い物中にカゴの中身の合計金額をリアルタイムで把握できるスマートフォン向けWebアプリケーション（PWA）です。

## 🚀 主な機能

### ✅ 基本機能（Phase 1完了）
- **商品手動入力**: 価格、商品名、数量の入力
- **税込/税抜計算**: 消費税率の切り替え対応
- **リアルタイム合計**: 商品追加時の即座な合計金額更新
- **商品管理**: 一覧表示、個別削除、数量編集
- **データ永続化**: ローカルストレージによる自動保存・復元

### 🆕 OCR機能（Phase 2完了）
- **価格自動認識**: カメラで値札を撮影して価格を自動抽出
- **画像アップロード**: ファイル選択による価格認識
- **日本円対応**: ¥1,000、1000円等の多様な価格表記に対応
- **信頼度ランキング**: 複数の価格候補を信頼度順で表示
- **画像前処理**: コントラスト向上・グレースケール変換で認識精度向上
- **カメラ切り替え**: 前面/背面カメラの切り替え対応

## 🌐 デプロイメント

このプロジェクトはGitHub Actionsを使用してGitHub Pagesに自動デプロイされます。

### 自動デプロイメント

- **トリガー**: `main`ブランチへのpush時に自動実行
- **ビルドプロセス**: 
  1. 依存関係のインストール
  2. Lintチェック
  3. テスト実行
  4. 本番ビルド
  5. GitHub Pagesへのデプロイ

### GitHub Pagesの設定

リポジトリ設定でGitHub Pagesを有効にするには：

1. リポジトリの「Settings」タブを開く
2. 左メニューから「Pages」を選択
3. Sourceで「GitHub Actions」を選択
4. ワークフローが完了すると、アプリが `https://username.github.io/pocket-shopping-calculator/` でアクセス可能

### 手動デプロイメント

GitHub Actionsタブから「GitHub Pagesへのデプロイ」ワークフローを手動実行することも可能です。

## 🛠 技術スタック

- **フレームワーク**: React 18 + TypeScript
- **ビルドツール**: Vite
- **スタイリング**: Tailwind CSS
- **状態管理**: React Context API + useReducer
- **データ保存**: localStorage
- **OCRエンジン**: Tesseract.js v6.0.1
- **カメラAPI**: MediaDevices API
- **アイコン**: Lucide React

## 📱 対応環境

- **ブラウザ**: 
  - iOS Safari 12+
  - Android Chrome 70+
  - デスクトップブラウザ（Chrome, Firefox, Safari, Edge）
- **画面サイズ**: 320px〜428px幅対応（スマートフォン最適化）
- **カメラ**: HTTPS環境でのみ利用可能

## 🚀 セットアップ

### 前提条件
- Node.js 14以上
- npm または yarn

### インストール

```bash
# リポジトリをクローン
git clone <repository-url>
cd pocket-shopping-calculator

# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

### ビルド

```bash
# 本番用ビルド
npm run build

# ビルド結果をプレビュー
npm run preview
```

## 📖 使い方

### 基本的な使い方

1. **商品追加**: 「商品を追加」ボタンから手動で価格・商品名・数量を入力
2. **税設定**: 税込/税抜を切り替えて計算方式を選択
3. **合計確認**: リアルタイムで更新される合計金額を確認
4. **商品管理**: 追加した商品の削除や数量変更

### OCR機能の使い方

1. **価格スキャン**: 「価格をスキャン」ボタンをタップ
2. **撮影**: カメラで値札を撮影、または画像ファイルを選択
3. **認識結果確認**: 検出された価格と信頼度を確認
4. **価格確定**: 「この価格で追加」で商品リストに追加

### OCR使用時のコツ

- **明るい場所**で撮影する
- **値札に正面から**カメラを向ける
- **価格部分を画面中央**に配置する
- **手ブレを避けて**しっかりと固定する

## 🏗 アーキテクチャ

### ディレクトリ構造

```
src/
├── components/          # 再利用可能なコンポーネント
├── context/            # React Context（状態管理）
├── router/
│   └── components/     # ページ固有のコンポーネント
│       ├── AddItemForm/    # 商品追加フォーム
│       ├── ItemList/       # 商品一覧
│       ├── OCRCamera/      # OCRカメラ機能
│       ├── TaxModeToggle/  # 税設定切り替え
│       └── TotalDisplay/   # 合計金額表示
├── types/              # TypeScript型定義
└── utils/              # ユーティリティ関数
    ├── calculations.ts # 税計算ロジック
    ├── storage.ts      # ローカルストレージ管理
    ├── ocr.ts          # OCR処理
    └── camera.ts       # カメラ機能
```

### データフロー

1. **ユーザー操作** → UI コンポーネント
2. **状態更新** → React Context（useReducer）
3. **データ永続化** → localStorage
4. **OCR処理** → Tesseract.js Worker
5. **カメラ操作** → MediaDevices API

## 🔧 開発情報

### 利用可能なスクリプト

```bash
npm run dev          # 開発サーバー起動
npm run build        # 本番ビルド
npm run preview      # ビルド結果プレビュー
npm run lint         # ESLint実行
```

### OCR設定

OCRエンジンの設定は `src/utils/ocr.ts` で調整可能：

```typescript
const DEFAULT_OCR_SETTINGS = {
  language: 'eng',                    // 認識言語
  engineMode: OEM.LSTM_ONLY,         // エンジンモード
  pageSegMode: PSM.SPARSE_TEXT,      // ページセグメンテーション
};
```

### 価格認識パターン

以下の価格パターンに対応：

- `¥1,000` / `¥1000.00`
- `1000円` / `1,000.00円`
- `1000¥`
- `1000` / `1,000.00`

## 🚧 今後の予定（Phase 3）

- [ ] **PWA対応**: Service Worker実装
- [ ] **オフライン機能**: キャッシュ戦略
- [ ] **アプリマニフェスト**: ホーム画面追加対応
- [ ] **プッシュ通知**: 買い物リマインダー
- [ ] **履歴機能**: 過去の買い物記録

## 📄 ライセンス

MIT License

## 🤝 コントリビューション

プルリクエストやイシューの報告を歓迎します。

---

**開発状況**: Phase 2（OCR機能）完了 ✅  
**次のマイルストーン**: Phase 3（PWA対応）
