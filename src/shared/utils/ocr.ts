import { OEM, PSM, createWorker } from "tesseract.js";
import type { OCRProcessResult, OCRResult, OCRSettings } from "../../types";

/**
 * デフォルトのOCR設定
 */
const DEFAULT_OCR_SETTINGS: OCRSettings = {
  language: "eng",
  engineMode: OEM.LSTM_ONLY,
  pageSegMode: PSM.SPARSE_TEXT,
};

/**
 * 価格パターンの正規表現
 */
const PRICE_PATTERNS = [
  /¥\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // ¥1,000 or ¥1000.00
  /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*円/g, // 1000円 or 1,000.00円
  /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)\s*¥/g, // 1000¥
  /(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g, // 1000 or 1,000.00
];

/**
 * Tesseract.jsワーカーのシングルトンインスタンス
 */
let ocrWorker: Awaited<ReturnType<typeof createWorker>> | null = null;

/**
 * OCRワーカーを初期化
 */
export async function initializeOCR(
  settings: Partial<OCRSettings> = {}
): Promise<void> {
  if (ocrWorker) {
    return;
  }

  const config = { ...DEFAULT_OCR_SETTINGS, ...settings };

  try {
    ocrWorker = await createWorker(
      config.language,
      config.engineMode as number,
      {
        logger: (_m) => {
          if (process.env.NODE_ENV === "development") {
            // OCR初期化ログはデバッグ時のみ出力
          }
        },
      }
    );

    await ocrWorker.setParameters({
      // biome-ignore lint/style/useNamingConvention: Tesseract.js API requirement
      tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      // biome-ignore lint/style/useNamingConvention: Tesseract.js API requirement
      tessedit_char_whitelist: "0123456789¥円,.",
    });
  } catch (error) {
    console.error("Failed to initialize OCR worker:", error);
    throw error;
  }
}

/**
 * OCRワーカーを終了
 */
export async function terminateOCR(): Promise<void> {
  if (ocrWorker) {
    await ocrWorker.terminate();
    ocrWorker = null;
  }
}

/**
 * 画像から文字を認識
 */
export async function recognizeText(
  imageSource: string | File | HTMLCanvasElement | HTMLImageElement
): Promise<OCRResult[]> {
  if (!ocrWorker) {
    throw new Error(
      "OCR worker is not initialized. Call initializeOCR() first."
    );
  }

  try {
    const { data } = await ocrWorker.recognize(imageSource);

    // Tesseract.js v6では、data.textから全体テキストを取得
    // 個別の単語情報は簡略化されているため、全体テキストを使用
    const fullText = data.text || "";

    // 全体テキストから一つのOCRResultを作成
    return [
      {
        text: fullText,
        confidence: data.confidence || 0,
        bbox: {
          x0: 0,
          y0: 0,
          x1: 0,
          y1: 0,
        },
      },
    ];
  } catch (error) {
    console.error("OCR recognition failed:", error);
    throw new Error("文字認識に失敗しました");
  }
}

/**
 * 価格を抽出・解析
 */
export function extractPrices(text: string): number[] {
  const prices: number[] = [];

  for (const pattern of PRICE_PATTERNS) {
    let match: RegExpExecArray | null = null;
    do {
      match = pattern.exec(text);
      if (match !== null) {
        const priceStr = match[1] || match[0];
        const cleanPrice = priceStr.replace(/[¥円,\s]/g, "");
        const price = Number.parseFloat(cleanPrice);

        if (!Number.isNaN(price) && price > 0 && price < 1000000) {
          // 0円〜100万円の範囲
          prices.push(price);
        }
      }
    } while (match !== null);
  }

  return [...new Set(prices)]; // 重複を除去
}

/**
 * 価格候補を信頼度でソート
 */
export function rankPriceCandidates(
  ocrResults: OCRResult[],
  extractedPrices: number[]
): Array<{ price: number; confidence: number; source: string }> {
  const candidates: Array<{
    price: number;
    confidence: number;
    source: string;
  }> = [];

  // OCR結果から価格を抽出
  for (const result of ocrResults) {
    const prices = extractPrices(result.text);
    for (const price of prices) {
      candidates.push({
        price,
        confidence: result.confidence,
        source: result.text,
      });
    }
  }

  // 全体テキストからの価格も追加
  for (const price of extractedPrices) {
    const existingCandidate = candidates.find((c) => c.price === price);
    if (!existingCandidate) {
      candidates.push({
        price,
        confidence: 50, // デフォルト信頼度
        source: "extracted",
      });
    }
  }

  // 信頼度でソート
  return candidates.sort((a, b) => b.confidence - a.confidence);
}

/**
 * 画像から価格を認識・処理
 */
export async function processImageForPrice(
  imageSource: string | File | HTMLCanvasElement | HTMLImageElement
): Promise<OCRProcessResult> {
  try {
    // OCR実行
    const ocrResults = await recognizeText(imageSource);

    // 全テキストを結合
    const fullText = ocrResults.map((r) => r.text).join(" ");

    // 価格を抽出
    const extractedPrices = extractPrices(fullText);

    // 価格候補をランキング
    const rankedCandidates = rankPriceCandidates(ocrResults, extractedPrices);

    // 最も信頼度の高い価格を選択
    const bestCandidate = rankedCandidates[0];

    // 提案リストを作成（上位3つまで）
    const suggestions = rankedCandidates
      .slice(0, 3)
      .map(
        (c) =>
          `¥${c.price.toLocaleString()} (信頼度: ${c.confidence.toFixed(1)}%)`
      );

    return {
      recognizedText: fullText,
      confidence: bestCandidate?.confidence || 0,
      detectedPrice: bestCandidate?.price,
      suggestions,
    };
  } catch (error) {
    console.error("Price processing failed:", error);
    throw new Error("価格認識処理に失敗しました");
  }
}

/**
 * 画像の前処理（コントラスト向上など）
 */
export function preprocessImage(canvas: HTMLCanvasElement): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // グレースケール変換とコントラスト向上
  for (let i = 0; i < data.length; i += 4) {
    const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;

    // コントラスト向上
    const contrast = 1.5;
    const factor = (259 * (contrast + 255)) / (255 * (259 - contrast));
    const enhancedGray = factor * (gray - 128) + 128;

    data[i] = enhancedGray; // R
    data[i + 1] = enhancedGray; // G
    data[i + 2] = enhancedGray; // B
    // data[i + 3] はアルファ値なのでそのまま
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * 高度な画像前処理（OCR精度向上版）
 */
export function advancedPreprocessImage(
  canvas: HTMLCanvasElement
): HTMLCanvasElement {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  // 1. ノイズ除去（メディアンフィルター近似）
  const denoisedData = applyMedianFilter(data, canvas.width, canvas.height);

  // 2. 適応的二値化（局所しきい値）
  const binaryData = applyAdaptiveBinarization(
    denoisedData,
    canvas.width,
    canvas.height
  );

  // 3. モルフォロジー処理（文字の補強）
  const morphData = applyMorphology(binaryData, canvas.width, canvas.height);

  // 4. コントラスト強化
  const enhancedData = enhanceContrast(morphData, 2.0); // より強いコントラスト

  // 結果を適用
  for (let i = 0; i < data.length; i += 4) {
    const gray = enhancedData[i / 4];
    data[i] = gray; // R
    data[i + 1] = gray; // G
    data[i + 2] = gray; // B
    // data[i + 3] はアルファ値なのでそのまま
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas;
}

/**
 * メディアンフィルター近似（ノイズ除去）
 */
function applyMedianFilter(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number[] {
  const result = new Array(width * height);

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const pixels = [];

      // 3x3の近傍を取得
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const idx = ((y + dy) * width + (x + dx)) * 4;
          const gray =
            data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;
          pixels.push(gray);
        }
      }

      // 中央値を取得
      pixels.sort((a, b) => a - b);
      result[y * width + x] = pixels[4]; // 中央値
    }
  }

  return result;
}

/**
 * 適応的二値化
 */
function applyAdaptiveBinarization(
  data: number[],
  width: number,
  height: number
): number[] {
  const result = new Array(width * height);
  const windowSize = 15; // 局所ウィンドウサイズ

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // 局所領域の平均を計算
      let sum = 0;
      let count = 0;

      for (let dy = -windowSize; dy <= windowSize; dy++) {
        for (let dx = -windowSize; dx <= windowSize; dx++) {
          const ny = y + dy;
          const nx = x + dx;

          if (ny >= 0 && ny < height && nx >= 0 && nx < width) {
            sum += data[ny * width + nx] || 0;
            count++;
          }
        }
      }

      const threshold = sum / count - 10; // 少し厳しめのしきい値
      const pixel = data[y * width + x] || 0;
      result[y * width + x] = pixel > threshold ? 255 : 0;
    }
  }

  return result;
}

/**
 * モルフォロジー処理（文字の補強）
 */
function applyMorphology(
  data: number[],
  width: number,
  height: number
): number[] {
  // クロージング操作（穴埋め）
  const dilated = dilate(data, width, height);
  const closed = erode(dilated, width, height);
  return closed;
}

/**
 * 膨張処理
 */
function dilate(data: number[], width: number, height: number): number[] {
  const result = [...data];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (data[y * width + x] === 255) {
        // 白ピクセルの周囲も白にする
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            result[(y + dy) * width + (x + dx)] = 255;
          }
        }
      }
    }
  }

  return result;
}

/**
 * 収縮処理
 */
function erode(data: number[], width: number, height: number): number[] {
  const result = [...data];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (data[y * width + x] === 255) {
        // 周囲に黒ピクセルがあれば黒にする
        let hasBlack = false;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (data[(y + dy) * width + (x + dx)] === 0) {
              hasBlack = true;
              break;
            }
          }
          if (hasBlack) {
            break;
          }
        }

        if (hasBlack) {
          result[y * width + x] = 0;
        }
      }
    }
  }

  return result;
}

/**
 * コントラスト強化
 */
function enhanceContrast(data: number[], factor: number): number[] {
  return data.map((pixel) => {
    const enhanced = ((pixel / 255 - 0.5) * factor + 0.5) * 255;
    return Math.max(0, Math.min(255, enhanced));
  });
}

/**
 * 画質評価結果
 */
export interface ImageQualityResult {
  score: number; // 0-100
  rating: "excellent" | "good" | "reasonable" | "poor" | "very_poor";
  issues: string[];
  recommendations: string[];
}

/**
 * 画質評価システム（Document Quality Analyzer風）
 */
export function analyzeImageQuality(
  canvas: HTMLCanvasElement
): ImageQualityResult {
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    throw new Error("Canvas context not available");
  }

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imageData.data;

  let validScores = 0;
  let totalScore = 0;
  const issues: string[] = [];
  const recommendations: string[] = [];

  // 1. シャープネス評価（ラプラシアン分散）
  try {
    const sharpnessScore = calculateSharpness(
      data,
      canvas.width,
      canvas.height
    );
    totalScore += sharpnessScore;
    validScores++;

    if (sharpnessScore < 20) {
      issues.push("画像がぼやけています");
      recommendations.push("カメラを安定させて再撮影してください");
    }
  } catch (error) {
    console.warn("Sharpness calculation failed:", error);
  }

  // 2. 明度評価
  try {
    const brightnessScore = calculateBrightness(data);
    totalScore += brightnessScore;
    validScores++;

    if (brightnessScore < 20) {
      issues.push("画像が暗すぎます");
      recommendations.push("明るい場所で撮影してください");
    } else if (brightnessScore > 80) {
      issues.push("画像が明るすぎます");
      recommendations.push("光が直接当たらない場所で撮影してください");
    }
  } catch (error) {
    console.warn("Brightness calculation failed:", error);
  }

  // 3. コントラスト評価
  try {
    const contrastScore = calculateContrast(data);
    totalScore += contrastScore;
    validScores++;

    if (contrastScore < 20) {
      issues.push("コントラストが低すぎます");
      recommendations.push(
        "背景と文字の差がはっきりする角度で撮影してください"
      );
    }
  } catch (error) {
    console.warn("Contrast calculation failed:", error);
  }

  // 4. 解像度評価
  try {
    const resolutionScore = calculateResolution(canvas.width, canvas.height);
    totalScore += resolutionScore;
    validScores++;

    if (resolutionScore < 20) {
      issues.push("解像度が低すぎます");
      recommendations.push("より近づいて撮影してください");
    }
  } catch (error) {
    console.warn("Resolution calculation failed:", error);
  }

  // 5. 傾き評価
  try {
    const skewScore = calculateSkew(data, canvas.width, canvas.height);
    totalScore += skewScore;
    validScores++;

    if (skewScore < 30) {
      issues.push("画像が傾いています");
      recommendations.push("文書を水平に保って撮影してください");
    }
  } catch (error) {
    console.warn("Skew calculation failed:", error);
  }

  // 有効なスコアが少なくとも1つはあることを確認
  if (validScores === 0) {
    return {
      score: 0,
      rating: "very_poor",
      issues: ["画質評価に失敗しました"],
      recommendations: ["別の画像で再試行してください"],
    };
  }

  const averageScore = totalScore / validScores;
  let rating: ImageQualityResult["rating"];

  if (averageScore >= 80) {
    rating = "excellent";
  } else if (averageScore >= 65) {
    rating = "good";
  } else if (averageScore >= 50) {
    rating = "reasonable";
  } else if (averageScore >= 30) {
    rating = "poor";
  } else {
    rating = "very_poor";
  }

  return {
    score: Math.round(averageScore),
    rating,
    issues,
    recommendations,
  };
}

/**
 * シャープネス計算（ラプラシアン分散）
 */
function calculateSharpness(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  let variance = 0;
  let count = 0;

  // 大きな画像の場合はサンプリングして高速化
  const sampleRate = Math.max(1, Math.floor(Math.min(width, height) / 100)); // 最大100x100サンプル

  for (let y = sampleRate; y < height - sampleRate; y += sampleRate) {
    for (let x = sampleRate; x < width - sampleRate; x += sampleRate) {
      const idx = (y * width + x) * 4;
      const gray =
        data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

      // ラプラシアンカーネル適用
      const laplacian = Math.abs(
        4 * gray -
          data[((y - sampleRate) * width + x) * 4] * 0.299 -
          data[((y + sampleRate) * width + x) * 4] * 0.299 -
          data[(y * width + (x - sampleRate)) * 4] * 0.299 -
          data[(y * width + (x + sampleRate)) * 4] * 0.299
      );

      variance += laplacian * laplacian;
      count++;
    }
  }

  if (count === 0) {
    return 0;
  }

  const meanVariance = variance / count;
  return Math.min(100, meanVariance / 1000); // 正規化
}

/**
 * 明度計算
 */
function calculateBrightness(data: Uint8ClampedArray): number {
  let totalBrightness = 0;
  let count = 0;

  // 大きな画像でパフォーマンス向上のためサンプリング
  const sampleRate = Math.max(1, Math.floor(data.length / (4 * 1000))); // 最大1000ピクセルサンプル

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const brightness =
      data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    totalBrightness += brightness;
    count++;
  }

  if (count === 0) {
    return 0;
  }

  const averageBrightness = totalBrightness / count;

  // 適切な明度範囲（80-180）にスコア化
  if (averageBrightness >= 80 && averageBrightness <= 180) {
    return 100;
  }
  if (averageBrightness < 80) {
    return Math.max(0, (averageBrightness / 80) * 100);
  }
  return Math.max(0, 100 - ((averageBrightness - 180) / 75) * 100);
}

/**
 * コントラスト計算
 */
function calculateContrast(data: Uint8ClampedArray): number {
  let maxBrightness = 0;
  let minBrightness = 255;

  // 大きな画像でスタックオーバーフローを避けるため、
  // サンプリングして計算を高速化
  const sampleRate = Math.max(1, Math.floor(data.length / (4 * 10000))); // 最大10000ピクセルサンプル

  for (let i = 0; i < data.length; i += 4 * sampleRate) {
    const brightness =
      data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    maxBrightness = Math.max(maxBrightness, brightness);
    minBrightness = Math.min(minBrightness, brightness);
  }

  // ゼロ除算を防ぐ
  if (maxBrightness + minBrightness === 0) {
    return 0;
  }

  const contrast =
    ((maxBrightness - minBrightness) / (maxBrightness + minBrightness)) * 100;
  return Math.min(100, contrast);
}

/**
 * 解像度評価
 */
function calculateResolution(width: number, height: number): number {
  const totalPixels = width * height;
  const minRecommended = 640 * 480; // 最低推奨解像度
  const optimal = 1280 * 720; // 最適解像度

  if (totalPixels >= optimal) {
    return 100;
  }
  if (totalPixels >= minRecommended) {
    return (
      50 + ((totalPixels - minRecommended) / (optimal - minRecommended)) * 50
    );
  }
  return (totalPixels / minRecommended) * 50;
}

/**
 * 傾き評価（簡易版）
 */
function calculateSkew(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  // エッジ検出による水平線の検出
  let horizontalEdges = 0;
  let totalEdges = 0;

  // 大きな画像の場合はサンプリングして高速化
  const sampleRate = Math.max(1, Math.floor(Math.min(width, height) / 200)); // 最大200x200サンプル

  for (let y = sampleRate; y < height - sampleRate; y += sampleRate) {
    for (let x = sampleRate; x < width - sampleRate; x += sampleRate) {
      const idx = (y * width + x) * 4;
      const gray =
        data[idx] * 0.299 + data[idx + 1] * 0.587 + data[idx + 2] * 0.114;

      const gx = Math.abs(
        gray - data[(y * width + (x - sampleRate)) * 4] * 0.299
      );
      const gy = Math.abs(
        gray - data[((y - sampleRate) * width + x) * 4] * 0.299
      );

      if (gx > 20 || gy > 20) {
        totalEdges++;
        if (gx > gy * 2) {
          horizontalEdges++;
        }
      }
    }
  }

  const horizontalRatio = totalEdges > 0 ? horizontalEdges / totalEdges : 0;
  return horizontalRatio * 100;
}
