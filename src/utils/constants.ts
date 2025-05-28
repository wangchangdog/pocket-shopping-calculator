// ============================================================================
// アプリケーション定数
// ============================================================================

/**
 * アプリケーション情報
 */
export const APP_INFO = {
  name: 'ポケット会計',
  version: '0.1.0',
  description: '実店舗での買い物時に商品の合計金額をリアルタイムで計算するアプリ',
  repository: 'https://github.com/wangchangdog/pocket-shopping-calculator',
  author: 'wangchangdog'
} as const

/**
 * デフォルト設定
 */
export const DEFAULT_SETTINGS = {
  taxRate: 10,
  taxMode: 'included',
  enableOCR: true,
  enableHistory: true
} as const

/**
 * ストレージキー
 */
export const STORAGE_KEYS = {
  currentSession: 'pocket-accounting-current-session',
  settings: 'pocket-accounting-settings',
  history: 'pocket-accounting-history',
  testResults: 'pocket-accounting-test-results'
} as const

/**
 * カメラ設定
 */
export const CAMERA_CONSTRAINTS = {
  video: {
    facingMode: 'environment', // 背面カメラを優先
    width: { ideal: 1280 },
    height: { ideal: 720 }
  },
  audio: false
} as const

/**
 * OCR設定
 */
export const OCR_CONFIG = {
  languages: 'jpn+eng',
  parameters: {
    tessedit_char_whitelist: '0123456789¥,$.,',
    tessedit_pageseg_mode: '8' // 単一単語として処理
  }
} as const

/**
 * パフォーマンス闾値
 */
export const PERFORMANCE_THRESHOLDS = {
  ocr: {
    maxProcessingTime: 10000, // 10秒
    minConfidence: 50 // 50%
  },
  camera: {
    maxStartupTime: 5000, // 5秒
    minFrameRate: 15 // 15fps
  },
  storage: {
    maxWriteTime: 1000, // 1秒
    maxReadTime: 500 // 0.5秒
  }
} as const

/**
 * 価格認識パターン
 */
export const PRICE_PATTERNS = [
  /¥([\d,]+)/g,           // ¥298, ¥1,280
  /￥([\d,]+)/g,           // ￥298、￥1,280
  /([\d,]+)円/g,         // 298円, 1,280円
  /\b([\d,]{2,})\b/g,    // 298, 1280, 1,280
] as const

/**
 * 価格範囲制限
 */
export const PRICE_LIMITS = {
  min: 1,
  max: 1000000
} as const

/**
 * エラーメッセージ
 */
export const ERROR_MESSAGES = {
  camera: {
    notAllowed: 'カメラのアクセス許可が必要です',
    notFound: 'カメラが見つかりません',
    notSupported: 'このブラウザではカメラにアクセスできません',
    unknown: 'カメラアクセスに失敗しました'
  },
  ocr: {
    processing: 'OCR処理に失敗しました',
    noText: 'テキストが検出されませんでした',
    lowConfidence: '認識精度が低すぎます'
  },
  storage: {
    quotaExceeded: 'ストレージ容量が不足しています',
    notSupported: 'ストレージがサポートされていません',
    writeError: 'データの保存に失敗しました',
    readError: 'データの読み込みに失敗しました'
  }
} as const