// ============================================================================
// ユーティリティヘルパー関数
// ============================================================================

import { PRICE_PATTERNS, PRICE_LIMITS } from './constants'

/**
 * バイト数を人間が読みやすい形式にフォーマット
 */
export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`
}

/**
 * 数値を日本円形式でフォーマット
 */
export function formatCurrency(amount: number): string {
  return `¥${amount.toLocaleString()}`
}

/**
 * ユニークIDを生成
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * タイムスタンプを生成
 */
export function generateTimestamp(): string {
  return new Date().toISOString()
}

/**
 * 価格らしき数字を抽出する
 */
export function extractPrices(text: string): number[] {
  const prices: number[] = []
  
  for (const pattern of PRICE_PATTERNS) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const priceStr = match[1].replace(/,/g, '') // カンマを除去
      const price = parseInt(priceStr, 10)
      
      // 妥当な価格範囲でフィルタリング
      if (price >= PRICE_LIMITS.min && price <= PRICE_LIMITS.max) {
        prices.push(price)
      }
    }
  }
  
  // 重複を除去してソート
  return [...new Set(prices)].sort((a, b) => a - b)
}

/**
 * デバウンス関数
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => func(...args), delay)
  }
}

/**
 * スロットル関数
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let lastCall = 0
  
  return (...args: Parameters<T>) => {
    const now = Date.now()
    if (now - lastCall >= delay) {
      lastCall = now
      func(...args)
    }
  }
}

/**
 * ローカルストレージのセーフな操作
 */
export const safeLocalStorage = {
  get: <T>(key: string, defaultValue: T): T => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : defaultValue
    } catch (error) {
      console.warn(`Failed to get item from localStorage: ${key}`, error)
      return defaultValue
    }
  },
  
  set: <T>(key: string, value: T): boolean => {
    try {
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch (error) {
      console.warn(`Failed to set item to localStorage: ${key}`, error)
      return false
    }
  },
  
  remove: (key: string): boolean => {
    try {
      localStorage.removeItem(key)
      return true
    } catch (error) {
      console.warn(`Failed to remove item from localStorage: ${key}`, error)
      return false
    }
  },
  
  clear: (): boolean => {
    try {
      localStorage.clear()
      return true
    } catch (error) {
      console.warn('Failed to clear localStorage', error)
      return false
    }
  }
}

/**
 * パフォーマンス測定
 */
export function measurePerformance<T>(
  operation: () => T | Promise<T>,
  label?: string
): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve) => {
    const startTime = performance.now()
    
    try {
      const result = await operation()
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      if (label) {
        console.log(`${label}: ${duration}ms`)
      }
      
      resolve({ result, duration })
    } catch (error) {
      const endTime = performance.now()
      const duration = Math.round(endTime - startTime)
      
      if (label) {
        console.error(`${label} failed after ${duration}ms:`, error)
      }
      
      throw error
    }
  })
}

/**
 * ブラウザの機能サポート確認
 */
export const browserSupport = {
  getUserMedia: (): boolean => {
    return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
  },
  
  webWorkers: (): boolean => {
    return typeof Worker !== 'undefined'
  },
  
  serviceWorker: (): boolean => {
    return 'serviceWorker' in navigator
  },
  
  localStorage: (): boolean => {
    try {
      const test = '__localStorage_test__'
      localStorage.setItem(test, test)
      localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  },
  
  indexedDB: (): boolean => {
    return 'indexedDB' in window
  },
  
  canvas: (): boolean => {
    try {
      const canvas = document.createElement('canvas')
      return !!(canvas.getContext && canvas.getContext('2d'))
    } catch {
      return false
    }
  }
}

/**
 * デバイス情報を取得
 */
export function getDeviceInfo() {
  return {
    userAgent: navigator.userAgent,
    platform: navigator.platform,
    language: navigator.language,
    cookieEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    memory: (navigator as any).deviceMemory,
    cores: navigator.hardwareConcurrency,
    connection: (navigator as any).connection,
    screen: {
      width: screen.width,
      height: screen.height,
      availWidth: screen.availWidth,
      availHeight: screen.availHeight,
      colorDepth: screen.colorDepth,
      pixelDepth: screen.pixelDepth
    },
    viewport: {
      width: window.innerWidth,
      height: window.innerHeight
    }
  }
}