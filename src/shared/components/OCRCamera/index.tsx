import { Camera, Check, RotateCcw, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { OCRProcessResult } from '../../../types';
import { capturePhoto, isCameraAvailable, loadImageToCanvas, startCamera, stopCamera, switchCamera } from '../../utils/camera';
import { initializeOCR, preprocessImage, processImageForPrice, terminateOCR } from '../../utils/ocr';

interface OCRCameraProps {
  isOpen: boolean;
  onClose: () => void;
  onPriceDetected: (price: number, productName?: string) => void;
}

type CameraState = 'idle' | 'starting' | 'active' | 'capturing' | 'processing';

export default function OCRCamera({ isOpen, onClose, onPriceDetected }: OCRCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [ocrResult, setOcrResult] = useState<OCRProcessResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOCRInitialized, setIsOCRInitialized] = useState(false);

  // OCR初期化
  useEffect(() => {
    if (isOpen && !isOCRInitialized) {
      initializeOCR()
        .then(() => {
          setIsOCRInitialized(true);
          console.log('OCR initialized');
        })
        .catch((err) => {
          setError('OCRの初期化に失敗しました');
          console.error('OCR initialization failed:', err);
        });
    }

    return () => {
      if (isOCRInitialized) {
        terminateOCR();
        setIsOCRInitialized(false);
      }
    };
  }, [isOpen, isOCRInitialized]);

  // カメラ開始
  const handleStartCamera = async () => {
    if (!isCameraAvailable()) {
      setError('カメラが利用できません');
      return;
    }

    if (!videoRef.current) return;

    try {
      setCameraState('starting');
      setError(null);

      await startCamera(videoRef.current, { facingMode });
      setCameraState('active');
    } catch (err) {
      setError('カメラの起動に失敗しました');
      setCameraState('idle');
      console.error('Camera start failed:', err);
    }
  };

  // カメラ停止
  const handleStopCamera = () => {
    stopCamera();
    setCameraState('idle');
  };

  // 写真撮影
  const handleCapture = async () => {
    if (!videoRef.current || !canvasRef.current || !isOCRInitialized) return;

    try {
      setCameraState('capturing');
      setError(null);

      // 写真を撮影
      const canvas = capturePhoto(videoRef.current, canvasRef.current);

      // 画像前処理
      const processedCanvas = preprocessImage(canvas);

      setCameraState('processing');

      // OCR処理
      const result = await processImageForPrice(processedCanvas);
      setOcrResult(result);

      // カメラを停止
      handleStopCamera();
    } catch (err) {
      setError('画像処理に失敗しました');
      setCameraState('active');
      console.error('Capture failed:', err);
    }
  };

  // カメラ切り替え
  const handleSwitchCamera = async () => {
    if (!videoRef.current) return;

    try {
      const newFacingMode = facingMode === 'user' ? 'environment' : 'user';
      await switchCamera(videoRef.current, newFacingMode);
      setFacingMode(newFacingMode);
    } catch (err) {
      setError('カメラの切り替えに失敗しました');
      console.error('Camera switch failed:', err);
    }
  };

  // ファイル選択
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !canvasRef.current || !isOCRInitialized) return;

    try {
      setCameraState('processing');
      setError(null);

      // ファイルをキャンバスに読み込み
      const canvas = await loadImageToCanvas(file, canvasRef.current);

      // 画像前処理
      const processedCanvas = preprocessImage(canvas);

      // OCR処理
      const result = await processImageForPrice(processedCanvas);
      setOcrResult(result);
    } catch (err) {
      setError('ファイル処理に失敗しました');
      setCameraState('idle');
      console.error('File processing failed:', err);
    }
  };

  // 価格確定
  const handleConfirmPrice = (price: number) => {
    onPriceDetected(price);
    handleClose();
  };

  // 閉じる
  const handleClose = () => {
    handleStopCamera();
    setOcrResult(null);
    setError(null);
    setCameraState('idle');
    onClose();
  };

  // リトライ
  const handleRetry = () => {
    setOcrResult(null);
    setError(null);
    setCameraState('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">価格をスキャン</h2>
        <button
          onClick={handleClose}
          className="p-2 hover:bg-gray-700 rounded-full transition-colors"
        >
          <X size={24} />
        </button>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500 text-white p-3 text-center">
            {error}
          </div>
        )}

        {/* OCR結果表示 */}
        {ocrResult && (
          <div className="bg-white p-4 m-4 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold mb-3">認識結果</h3>

            {ocrResult.detectedPrice ? (
              <div className="space-y-3">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600">
                    ¥{ocrResult.detectedPrice.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500">
                    信頼度: {ocrResult.confidence.toFixed(1)}%
                  </div>
                </div>

                {ocrResult.suggestions.length > 1 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">
                      その他の候補:
                    </h4>
                    <div className="space-y-1">
                      {ocrResult.suggestions.slice(1).map((suggestion, index) => (
                        <div key={index} className="text-sm text-gray-600">
                          {suggestion}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={() => handleConfirmPrice(ocrResult.detectedPrice!)}
                    className="flex-1 bg-green-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-600 transition-colors flex items-center justify-center"
                  >
                    <Check size={20} className="mr-2" />
                    この価格で追加
                  </button>
                  <button
                    onClick={handleRetry}
                    className="bg-gray-500 text-white py-3 px-4 rounded-lg font-medium hover:bg-gray-600 transition-colors"
                  >
                    再撮影
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="text-gray-600">価格を認識できませんでした</div>
                <div className="text-sm text-gray-500">
                  認識されたテキスト: {ocrResult.recognizedText || 'なし'}
                </div>
                <button
                  onClick={handleRetry}
                  className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                >
                  再試行
                </button>
              </div>
            )}
          </div>
        )}

        {/* カメラビュー */}
        {cameraState !== 'idle' && !ocrResult && (
          <div className="flex-1 relative">
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />

            {/* オーバーレイ */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="border-2 border-white border-dashed w-64 h-40 rounded-lg"></div>
            </div>

            {/* 撮影ボタン */}
            {cameraState === 'active' && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={handleCapture}
                  className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Camera size={32} className="text-gray-800" />
                </button>
              </div>
            )}

            {/* カメラ切り替えボタン */}
            {cameraState === 'active' && (
              <button
                onClick={handleSwitchCamera}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            )}

            {/* 処理中表示 */}
            {(cameraState === 'capturing' || cameraState === 'processing') && (
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-3"></div>
                  <div className="text-gray-700">
                    {cameraState === 'capturing' ? '撮影中...' : '価格を認識中...'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* 初期状態 */}
        {cameraState === 'idle' && !ocrResult && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-6">
            <div className="text-white text-center space-y-2">
              <h3 className="text-xl font-semibold">価格をスキャンしましょう</h3>
              <p className="text-gray-300">
                値札にカメラを向けて価格を自動認識します
              </p>
            </div>

            <div className="space-y-4 w-full max-w-sm">
              <button
                onClick={handleStartCamera}
                disabled={cameraState !== 'idle' || !isOCRInitialized}
                className="w-full bg-blue-500 text-white py-4 px-6 rounded-lg font-medium hover:bg-blue-600 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Camera size={24} className="mr-3" />
                {cameraState !== 'idle' ? 'カメラ起動中...' : 'カメラを起動'}
              </button>

              <div className="text-center text-gray-400">または</div>

              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!isOCRInitialized}
                className="w-full bg-gray-600 text-white py-4 px-6 rounded-lg font-medium hover:bg-gray-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Upload size={24} className="mr-3" />
                画像ファイルを選択
              </button>
            </div>

            {!isOCRInitialized && (
              <div className="text-yellow-400 text-center">
                OCRエンジンを初期化中...
              </div>
            )}
          </div>
        )}
      </div>

      {/* 隠しファイル入力 */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* 隠しキャンバス */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
} 