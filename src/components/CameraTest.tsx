import { useRef, useState } from 'react'
import { useCamera } from '../hooks/useCamera'

export default function CameraTest() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [logs, setLogs] = useState<string[]>([])

  const { isStreaming, error, startCamera, stopCamera } = useCamera(videoRef)

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)])
  }

  const captureImage = () => {
    const video = videoRef.current
    const canvas = canvasRef.current
    
    if (!video || !canvas) {
      addLog('エラー: ビデオまたはキャンバスが見つかりません')
      return
    }

    const context = canvas.getContext('2d')
    if (!context) {
      addLog('エラー: Canvas contextが取得できません')
      return
    }

    // カメラのアスペクト比を保持
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    
    context.drawImage(video, 0, 0)
    const imageData = canvas.toDataURL('image/jpeg', 0.8)
    setCapturedImage(imageData)
    
    addLog(`画像キャプチャ成功: ${video.videoWidth}x${video.videoHeight}`)
  }

  const clearCapture = () => {
    setCapturedImage(null)
    addLog('キャプチャした画像をクリアしました')
  }

  const downloadImage = () => {
    if (!capturedImage) return
    
    const link = document.createElement('a')
    link.href = capturedImage
    link.download = `captured-${Date.now()}.jpg`
    link.click()
    addLog('画像をダウンロードしました')
  }

  return (
    <div className="space-y-6">
      {/* カメラコントロール */}
      <div className="bg-white rounded-lg p-4 shadow-sm">
        <h2 className="text-lg font-semibold mb-4">📸 カメラテスト</h2>
        
        <div className="space-y-4">
          {/* カメラストリーム */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {!isStreaming && (
              <div className="absolute inset-0 flex items-center justify-center text-white">
                <div className="text-center">
                  <div className="text-4xl mb-2">📹</div>
                  <p className="text-sm">カメラ停止中</p>
                </div>
              </div>
            )}
          </div>

          {/* エラー表示 */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-red-700 text-sm">
                <span className="font-medium">エラー:</span> {error}
              </p>
            </div>
          )}

          {/* コントロールボタン */}
          <div className="flex gap-2">
            <button
              onClick={isStreaming ? stopCamera : startCamera}
              className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
                isStreaming
                  ? 'bg-red-500 hover:bg-red-600 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
              }`}
            >
              {isStreaming ? 'ストップ' : 'カメラ開始'}
            </button>
            
            <button
              onClick={captureImage}
              disabled={!isStreaming}
              className="flex-1 py-3 px-4 rounded-lg font-medium bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white transition-colors"
            >
              撮影
            </button>
          </div>
        </div>
      </div>

      {/* キャプチャした画像 */}
      {capturedImage && (
        <div className="bg-white rounded-lg p-4 shadow-sm">
          <h3 className="text-md font-semibold mb-3">🖼️ キャプチャ画像</h3>
          
          <div className="space-y-3">
            <img
              src={capturedImage}
              alt="キャプチャした画像"
              className="w-full rounded-lg border"
            />
            
            <div className="flex gap-2">
              <button
                onClick={downloadImage}
                className="flex-1 py-2 px-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                ダウンロード
              </button>
              <button
                onClick={clearCapture}
                className="flex-1 py-2 px-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                クリア
              </button>
            </div>
          </div>
        </div>
      )}

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

      {/* 非表示キャンバス */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}