import { createWorker } from 'tesseract.js'

let worker: Tesseract.Worker | null = null

/**
 * OCRワーカーを初期化する
 */
async function initializeWorker(): Promise<Tesseract.Worker> {
  if (worker) {
    return worker
  }

  worker = await createWorker('jpn+eng', 1, {
    logger: m => {
      if (m.status === 'recognizing text') {
        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`)
      }
    }
  })

  // OCRオプションを設定
  await worker.setParameters({
    tessedit_char_whitelist: '0123456789¥,$.,', // 数字と価格関連文字のみ
    tessedit_pageseg_mode: '8', // 単一単語として処理
  })

  return worker
}

/**
 * 画像にOCR処理を実行する
 */
export async function performOCR(imageData: string): Promise<Tesseract.RecognizeResult> {
  const ocrWorker = await initializeWorker()
  
  try {
    const result = await ocrWorker.recognize(imageData)
    return result
  } catch (error) {
    console.error('OCR processing failed:', error)
    throw new Error(`OCR処理に失敗しました: ${error instanceof Error ? error.message : '不明なエラー'}`)
  }
}

/**
 * 価格らしき数字を抽出する
 */
export function extractPrices(text: string): number[] {
  // 日本円の価格パターンを検索
  const patterns = [
    /¥([\d,]+)/g,           // ¥298, ¥1,280
    /＄([\d,]+)/g,           // ＄298、＄1,280
    /([\d,]+)円/g,         // 298円, 1,280円
    /\b([\d,]{2,})\b/g,      // 298, 1280, 1,280
  ]

  const prices: number[] = []
  
  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(text)) !== null) {
      const priceStr = match[1].replace(/,/g, '') // カンマを除去
      const price = parseInt(priceStr, 10)
      
      // 妄当な価格範囲でフィルタリング（1円〜100万円）
      if (price >= 1 && price <= 1000000) {
        prices.push(price)
      }
    }
  }
  
  // 重複を除去してソート
  return [...new Set(prices)].sort((a, b) => a - b)
}

/**
 * OCRワーカーを終了する
 */
export async function terminateOCRWorker(): Promise<void> {
  if (worker) {
    await worker.terminate()
    worker = null
  }
}