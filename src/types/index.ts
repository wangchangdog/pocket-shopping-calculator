// ============================================================================
// 型定義ファイル
// ============================================================================

/**
 * 買い物セッション
 */
export interface ShoppingSession {
  sessionId: string
  taxMode: 'included' | 'excluded'
  taxRate: number // 消費税率（%）
  items: ShoppingItem[]
  totalAmount: number
  createdAt: string
  updatedAt: string
}

/**
 * 商品アイテム
 */
export interface ShoppingItem {
  id: string
  name: string
  price: number
  quantity: number
  addedAt: string
}

/**
 * アプリ設定
 */
export interface AppSettings {
  defaultTaxRate: number
  defaultTaxMode: 'included' | 'excluded'
  enableHistory: boolean
  enableOCR: boolean
}

/**
 * カメラ設定
 */
export interface CameraConstraints {
  facingMode: 'user' | 'environment'
  width: { ideal: number }
  height: { ideal: number }
}

/**
 * OCR結果
 */
export interface OCRResult {
  text: string
  confidence: number
  processingTime: number
  detectedNumbers: string[]
  detectedPrices: number[]
}

/**
 * ストレージ統計
 */
export interface StorageStats {
  localStorage: {
    used: number
    available: number
    quota: number
  }
  indexedDB: {
    supported: boolean
    quota?: number
    used?: number
  }
}

/**
 * パフォーマンス指標
 */
export interface PerformanceMetrics {
  deviceInfo: {
    userAgent: string
    platform: string
    memory?: number
    cores?: number
  }
  networkInfo: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
  timing: {
    domLoading: number
    domInteractive: number
    domComplete: number
    loadEventEnd: number
  }
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

/**
 * テスト結果
 */
export interface TestResult {
  id: string
  testType: 'camera' | 'ocr' | 'storage' | 'performance'
  success: boolean
  duration: number
  data: any
  timestamp: string
  notes?: string
}