import { useState, useRef } from 'react'
import { performOCR } from '../utils/ocr'

interface OCRResult {
  text: string
  confidence: number
  processingTime: number
  detectedNumbers: string[]
}

export default function OCRTest() {
  const [isProcessing, setIsProcessing] = useState(false)
  const [result, setResult] = useState<OCRResult | null>(null)
  const [logs, setLogs] = useState<string[]>([])
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        setSelectedImage(imageData)
        addLog(`画像アップロード: ${file.name} (${(file.size / 1024).toFixed(1)}KB)`)
      }
      reader.readAsDataURL(file)
    }
  }

  const processOCR = async () => {
    if (!selectedImage) {
      addLog('エラー: 画像が選択されていません')
      return
    }

    setIsProcessing(true)
    setResult(null)
    addLog('OCR処理を開始します...')

    try {
      const startTime = performance.now()
      const ocrResult = await performOCR(selectedImage)
      const endTime = performance.now()
      const processingTime = Math.round(endTime - startTime)

      // 数字を抽出（価格の検出用）
      const numbers = ocrResult.data.text.match(/\d+/g) || []
      const detectedNumbers = numbers.filter(num => num.length >= 2) // 2桁以上の数字

      const result: OCRResult = {
        text: ocrResult.data.text.trim(),
        confidence: Math.round(ocrResult.data.confidence),
        processingTime,
        detectedNumbers
      }

      setResult(result)
      addLog(`OCR完了: ${processingTime}ms, 信頼度: ${result.confidence}%`)
      addLog(`検出テキスト: "${result.text.slice(0, 50)}${result.text.length > 50 ? '...' : ''}"`)
      
      if (detectedNumbers.length > 0) {
        addLog(`検出数字: ${detectedNumbers.join(', ')}`)
      }
    } catch (error) {
      console.error('OCR Error:', error)
      addLog(`OCRエラー: ${error instanceof Error ? error.message : '不明なエラー'}`)
    } finally {
      setIsProcessing(false)
    }
  }

  const clearResults = () => {
    setResult(null)
    setSelectedImage(null)
    setLogs([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    addLog('結果をクリアしました')
  }

  // サンプル画像ボタンのハンドラ（テスト用）
  const loadSampleImage = async () => {
    try {
      // Canvasでサンプルの価格タグを作成
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')!
      canvas.width = 300
      canvas.height = 100
      
      // 背景
      ctx.fillStyle = '#ffffff'
      ctx.fillRect(0, 0, 300, 100)
      
      // ボーダー
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2
      ctx.strokeRect(5, 5, 290, 90)
      
      // 価格テキスト
      ctx.fillStyle = '#000000'
      ctx.font = 'bold 36px Arial'
      ctx.textAlign = 'center'
      ctx.fillText('¥298', 150, 60)
      
      const imageData = canvas.toDataURL('image/png')
      setSelectedImage(imageData)
      addLog('サンプル画像を読み込みました: ¥298')
    } catch (error) {
      addLog('サンプル画像の作成に失敗しました')
    }
  }

  return (
    <div className="space-y-6">
      {/* OCRテスト */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">🔍 OCRテスト</h2>
        
        <div className="space-y-4">
          {/* 画像アップロード */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              テスト画像を選択
            </label>
            <div className="flex gap-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="flex-1 text-sm text-gray-500 file:mr-2 file:py-2 file:px-3 file:rounded file:border-0 file:text-sm file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
              />
              <button
                onClick={loadSampleImage}
                className="px-3 py-2 bg-gray-500 hover:bg-gray-600 text-white text-sm rounded font-medium transition-colors"
              >
                サンプル
              </button>
            </div>
          </div>

          {/* 選択された画像 */}
          {selectedImage && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                選択された画像
              </label>
              <img
                src={selectedImage}
                alt="OCRテスト用画像"
                className="w-full max-w-sm border rounded-lg"
              />
            </div>
          )}

          {/* OCR実行ボタン */}
          <button
            onClick={processOCR}
            disabled={!selectedImage || isProcessing}
            className="w-full py-3 px-4 bg-primary-500 hover:bg-primary-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
          >
            {isProcessing ? (
              <div className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                OCR処理中...
              </div>
            ) : (
              'OCR実行'
            )}
          </button>
        </div>
      </div>

      {/* OCR結果 */}
      {result && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-md font-semibold mb-3">📊 OCR結果</h3>
          
          <div className="space-y-3">
            {/* パフォーマンス指標 */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-blue-50 rounded-lg p-3">
                <div className="text-xs text-blue-600 font-medium">処理時間</div>
                <div className="text-lg font-bold text-blue-700">{result.processingTime}ms</div>
              </div>
              <div className="bg-green-50 rounded-lg p-3">
                <div className="text-xs text-green-600 font-medium">信頼度</div>
                <div className="text-lg font-bold text-green-700">{result.confidence}%</div>
              </div>
            </div>

            {/* 検出テキスト */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                検出テキスト
              </label>
              <div className="bg-gray-50 border rounded-lg p-3">
                <p className="text-sm font-mono whitespace-pre-wrap">
                  {result.text || '（テキストが検出されませんでした）'}
                </p>
              </div>
            </div>

            {/* 検出数字 */}
            {result.detectedNumbers.length > 0 && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  検出された数字（価格候補）
                </label>
                <div className="flex flex-wrap gap-2">
                  {result.detectedNumbers.map((number, index) => (
                    <span
                      key={index}
                      className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-sm font-medium"
                    >
                      {number}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* コントロール */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <button
          onClick={clearResults}
          className="w-full py-2 px-4 bg-gray-500 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
        >
          結果をクリア
        </button>
      </div>

      {/* ログ */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h3 className="text-md font-semibold mb-3">📄 ログ</h3>
        <div className="bg-gray-50 rounded border p-3 h-32 overflow-y-auto">
          {logs.length === 0 ? (
            <p className="text-gray-500 text-sm">ログはまだありません</p>
          ) : (
            <div className="space-y-1">
              {logs.map((log, index) => (
                <div key={index} className="text-xs font-mono text-gray-700">
                  {log}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}