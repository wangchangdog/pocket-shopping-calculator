/// <reference types="vite/client" />

// グローバル型拡張
interface Navigator {
  deviceMemory?: number
  connection?: {
    effectiveType?: string
    downlink?: number
    rtt?: number
  }
}

interface Performance {
  memory?: {
    usedJSHeapSize: number
    totalJSHeapSize: number
    jsHeapSizeLimit: number
  }
}

// Tesseract.js型定義
declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string
      confidence: number
      words: Array<{
        text: string
        confidence: number
        bbox: {
          x0: number
          y0: number
          x1: number
          y1: number
        }
      }>
    }
  }

  export interface Worker {
    recognize(image: string | File | HTMLImageElement | HTMLCanvasElement): Promise<RecognizeResult>
    setParameters(params: Record<string, string | number>): Promise<void>
    terminate(): Promise<void>
  }

  export function createWorker(
    langs?: string,
    oem?: number,
    options?: {
      logger?: (info: { status: string; progress: number }) => void
    }
  ): Promise<Worker>
}