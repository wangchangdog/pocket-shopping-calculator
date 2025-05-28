import { useCallback, useEffect, useRef, useState } from 'react'

interface UseCameraReturn {
  isStreaming: boolean
  error: string | null
  startCamera: () => Promise<void>
  stopCamera: () => void
}

export function useCamera(videoRef: React.RefObject<HTMLVideoElement>): UseCameraReturn {
  const [isStreaming, setIsStreaming] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
      streamRef.current = null
    }
    setIsStreaming(false)
    setError(null)
  }, [])

  const startCamera = useCallback(async () => {
    setError(null)
    
    try {
      // 既存のストリームを停止
      stopCamera()

      // カメラアクセスをリクエスト
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: 'environment', // 背面カメラを優先
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      }

      const stream = await navigator.mediaDevices.getUserMedia(constraints)
      streamRef.current = stream

      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setIsStreaming(true)
      }
    } catch (err) {
      let errorMessage = 'カメラアクセスに失敗しました'
      
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') {
          errorMessage = 'カメラのアクセス許可が必要です'
        } else if (err.name === 'NotFoundError') {
          errorMessage = 'カメラが見つかりません'
        } else if (err.name === 'NotSupportedError') {
          errorMessage = 'このブラウザではカメラにアクセスできません'
        }
      }
      
      setError(errorMessage)
      console.error('Camera error:', err)
    }
  }, [videoRef, stopCamera])

  // コンポーネントのアンマウント時にストリームを停止
  useEffect(() => {
    return () => {
      stopCamera()
    }
  }, [stopCamera])

  return {
    isStreaming,
    error,
    startCamera,
    stopCamera
  }
}