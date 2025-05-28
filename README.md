# ポケット会計 - 技術検証プロトタイプ

[![Deploy to GitHub Pages](https://github.com/wangchangdog/pocket-shopping-calculator/actions/workflows/deploy.yml/badge.svg)](https://github.com/wangchangdog/pocket-shopping-calculator/actions/workflows/deploy.yml)

実店舗での買い物時に商品の合計金額をリアルタイムで計算するスマートフォン向けWebアプリケーションの技術検証プロトタイプです。

## 🚀 デモサイト

**[📱 技術検証デモを試す →](https://wangchangdog.github.io/pocket-shopping-calculator/)**

HTTPS環境でカメラ機能を含む全ての技術検証が可能です。

## 📋 検証項目

この技術検証プロトタイプでは以下の核心技術の動作確認を行います：

### 📸 カメラテスト
- **Camera API**: スマートフォンでのカメラアクセス
- **画像キャプチャ**: 高解像度での撮影機能
- **エラーハンドリング**: 権限・デバイス対応確認

### 🔍 OCRテスト
- **Tesseract.js**: 日本語価格認識精度
- **処理時間測定**: 実用レベルの速度確認
- **価格抽出**: 複数パターンでの認識テスト

### 💾 ストレージテスト
- **localStorage**: 容量・速度・信頼性検証
- **データ永続化**: アプリ再起動時の復元確認
- **パフォーマンス**: 大量データでの動作確認

### ⚡ パフォーマンステスト
- **デバイス性能**: CPU・メモリ・FPS測定
- **ネットワーク**: 接続速度・遅延確認
- **総合評価**: 実用性スコア算出

## 🛠️ 技術スタック

### フロントエンド
- **Vite** - 高速開発環境
- **React 18** + **TypeScript** - モダンUI開発
- **Tailwind CSS** - ユーティリティファーストCSS

### 品質管理
- **Biome** - 高速linter/formatter
- **GitHub Actions** - CI/CD自動化
- **GitHub Pages** - 静的サイトホスティング

### 核心ライブラリ
- **Tesseract.js** - ブラウザOCRエンジン
- **Camera API** - デバイスカメラアクセス
- **PWA** - オフライン対応・アプリライク体験

## 📱 対応環境

- **iOS Safari 12+**
- **Android Chrome 70+**
- **HTTPS必須** (カメラ機能のため)
- **画面幅**: 320px〜428px最適化

## 🏗️ ローカル開発

```bash
# 依存関係インストール
npm install

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# Linting
npm run lint

# プレビュー
npm run preview
```

## 📊 検証結果の評価基準

### ⭐ 合格基準
- **OCR精度**: 90%以上
- **処理時間**: 5秒以内
- **カメラ起動**: 3秒以内
- **ストレージ**: 1MB以上利用可能

### 🎯 実用性判定
検証結果に基づいて本格実装の技術選択を決定します：

- ✅ **高評価**: そのまま採用
- ⚠️ **要改善**: 代替手段検討
- ❌ **不適合**: 技術変更必要

## 🗂️ プロジェクト構造

```
src/
├── components/           # 検証用UIコンポーネント
│   ├── CameraTest.tsx   # カメラ機能テスト
│   ├── OCRTest.tsx      # OCR機能テスト
│   ├── StorageTest.tsx  # ストレージテスト
│   └── PerformanceTest.tsx # パフォーマンステスト
├── hooks/
│   └── useCamera.ts     # カメラ操作hook
├── utils/
│   ├── ocr.ts          # OCR処理ユーティリティ
│   ├── constants.ts    # アプリ定数
│   └── helpers.ts      # ヘルパー関数
├── types/
│   └── index.ts        # TypeScript型定義
└── App.tsx             # メインアプリケーション
```

## 📈 次のステップ

技術検証完了後の開発ロードマップ：

### Phase 1 (MVP)
- 基本的な手動入力機能
- 税込/税抜計算
- ローカルストレージ保存

### Phase 2
- OCR機能実装
- UI/UX改善
- PWA対応

### Phase 3
- 履歴機能
- 設定カスタマイズ
- パフォーマンス最適化

## 📄 ドキュメント

- [要件定義書](./docs/requirements.md) - 詳細な機能要件と技術仕様
- [シーケンス図](./docs/sequence-diagram.md) - ユーザーフローとシステム動作

## 🤝 コントリビューション

技術検証結果やフィードバックを歓迎します：

1. 検証結果の共有
2. パフォーマンス改善提案
3. 新しい検証項目の提案
4. バグレポート

## 📝 ライセンス

MIT License

---

> 💡 この技術検証により、実用的なお買い物計算アプリの実現可能性を確認します。
> 
> 🔬 **検証目標**: ユーザーにとって実用的な速度と精度を達成すること