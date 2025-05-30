import { AlertCircle, Camera, Check, CheckCircle, RotateCcw, Upload, X } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import type { OCRProcessResult } from '../../../types';
import { capturePhoto, isCameraAvailable, loadImageToCanvas, startCamera, stopCamera, switchCamera } from '../../utils/camera';
import { advancedPreprocessImage, analyzeImageQuality, initializeOCR, preprocessImage, processImageForPrice, terminateOCR, type ImageQualityResult } from '../../utils/ocr';

interface OCRCameraProps {
  isOpen: boolean;
  onClose: () => void;
  onPriceDetected: (price: number, productName?: string) => void;
}

type CameraState = 'idle' | 'starting' | 'active' | 'capturing' | 'analyzing' | 'processing';

export default function OCRCamera({ isOpen, onClose, onPriceDetected }: OCRCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [cameraState, setCameraState] = useState<CameraState>('idle');
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [ocrResult, setOcrResult] = useState<OCRProcessResult | null>(null);
  const [qualityResult, setQualityResult] = useState<ImageQualityResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOCRInitialized, setIsOCRInitialized] = useState(false);
  const [useAdvancedProcessing, setUseAdvancedProcessing] = useState(true);
  const [processedImageUrl, setProcessedImageUrl] = useState<string | null>(null);

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

      // 元の画像をDataURLとして保存（背景表示用）
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      setProcessedImageUrl(imageUrl);

      setCameraState('analyzing');

      // 画質評価
      const quality = analyzeImageQuality(canvas);
      setQualityResult(quality);

      // 画質が低すぎる場合は警告
      if (quality.rating === 'very_poor' || quality.rating === 'poor') {
        setError(`画質が不十分です (スコア: ${quality.score}/100)`);
        setCameraState('active');
        return;
      }

      setCameraState('processing');

      // 画像前処理（高度な処理またはベーシック処理）
      const processedCanvas = useAdvancedProcessing
        ? advancedPreprocessImage(canvas)
        : preprocessImage(canvas);

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
      setCameraState('analyzing');
      setError(null);

      // ファイルをキャンバスに読み込み
      const canvas = await loadImageToCanvas(file, canvasRef.current);

      // 元の画像をDataURLとして保存（背景表示用）
      const imageUrl = canvas.toDataURL('image/jpeg', 0.8);
      setProcessedImageUrl(imageUrl);

      // 画質評価
      const quality = analyzeImageQuality(canvas);
      setQualityResult(quality);

      setCameraState('processing');

      // 画像前処理
      const processedCanvas = useAdvancedProcessing
        ? advancedPreprocessImage(canvas)
        : preprocessImage(canvas);

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
    setQualityResult(null);
    setProcessedImageUrl(null);
    setError(null);
    setCameraState('idle');
    onClose();
  };

  // リトライ
  const handleRetry = () => {
    setOcrResult(null);
    setQualityResult(null);
    setProcessedImageUrl(null);
    setError(null);
    setCameraState('idle');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col overflow-y-scroll">
      {/* ヘッダー */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <h2 className="text-lg font-semibold">価格をスキャン</h2>
        <div className="flex items-center space-x-3">
          {/* 高度処理切り替え */}
          <label className="flex items-center text-sm">
            <input
              type="checkbox"
              checked={useAdvancedProcessing}
              onChange={(e) => setUseAdvancedProcessing(e.target.checked)}
              className="mr-2"
            />
            高精度モード
          </label>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-700 rounded-full transition-colors"
          >
            <X size={24} />
          </button>
        </div>
      </div>

      {/* メインコンテンツ */}
      <div className="flex-1 flex flex-col">
        {/* エラー表示 */}
        {error && (
          <div className="bg-red-500 text-white p-3 text-center flex items-center justify-center">
            <AlertCircle size={20} className="mr-2" />
            {error}
          </div>
        )}

        {/* 画質結果表示 */}
        {qualityResult && (
          <div className={`p-3 text-center text-white ${qualityResult.rating === 'excellent' || qualityResult.rating === 'good'
            ? 'bg-green-600'
            : qualityResult.rating === 'reasonable'
              ? 'bg-yellow-600'
              : 'bg-red-600'
            }`}>
            <div className="flex items-center justify-center">
              {(qualityResult.rating === 'excellent' || qualityResult.rating === 'good') ? (
                <CheckCircle size={20} className="mr-2" />
              ) : (
                <AlertCircle size={20} className="mr-2" />
              )}
              画質スコア: {qualityResult.score}/100 ({qualityResult.rating})
            </div>
            {qualityResult.issues.length > 0 && (
              <div className="text-sm mt-1">
                {qualityResult.recommendations.join(', ')}
              </div>
            )}
          </div>
        )}

        {/* OCR結果表示 */}
        {ocrResult && (
          <div className="flex-1 flex flex-col overflow-scroll bg-gray-100">
            {/* 結果表示（上部固定） */}
            <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3 text-center">認識結果</h3>

              {ocrResult.detectedPrice ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      ¥{ocrResult.detectedPrice.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      信頼度: {ocrResult.confidence.toFixed(1)}%
                    </div>
                  </div>

                  {ocrResult.suggestions.length > 1 && (
                    <div className="bg-gray-50 p-3 rounded-lg">
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
                  <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
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

              {qualityResult && (
                <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">画質詳細</h4>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div>スコア: {qualityResult.score}/100</div>
                    <div>評価: {qualityResult.rating}</div>
                    {qualityResult.issues.length > 0 && (
                      <div>問題点: {qualityResult.issues.join(', ')}</div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* 読み込み画像表示（下部スクロール可能） */}
            <div className="flex-1 overflow-y-auto bg-gray-50">
              {processedImageUrl ? (
                <div className="p-4 h-fit overflow-y-scroll">
                  <h4 className="text-sm font-medium text-gray-700 mb-2 text-center">
                    読み込み画像
                  </h4>
                  <div className="bg-white rounded-lg shadow-sm overflow-auto">
                    <img
                      src={processedImageUrl}
                      alt="読み込まれた画像"
                      className="w-fit h-auto block"
                      style={{
                        maxHeight: 'none', // 画像の実際のサイズで表示
                        minHeight: '200px', // 最小高さを確保
                      }}
                    />
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center p-8">
                  <div className="text-center text-gray-500">
                    <div className="text-lg mb-2">画像がありません</div>
                    <div className="text-sm">
                      カメラで撮影するか、ファイルを選択してください
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* カメラビュー / 処理中画面 */}
        {cameraState !== 'idle' && !ocrResult && (
          <div className="flex-1 relative">
            {/* 処理中で画像がある場合、または画質エラーで画像がある場合は背景として表示 */}
            {((cameraState === 'analyzing' || cameraState === 'processing') ||
              (cameraState === 'active' && processedImageUrl && error)) && processedImageUrl ? (
              <div
                className="absolute inset-0 bg-no-repeat opacity-40"
                style={{
                  backgroundImage: `url(${processedImageUrl})`,
                  backgroundSize: 'contain',
                  backgroundPosition: 'center',
                }}
              />
            ) : (
              /* カメラ映像表示 */
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                playsInline
                muted
              />
            )}

            {/* オーバーレイ（カメラアクティブ時のみ、エラーがない場合） */}
            {cameraState === 'active' && !error && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="border-2 border-white border-dashed w-64 h-40 rounded-lg"></div>
              </div>
            )}

            {/* 撮影ボタン（エラーがない場合のみ） */}
            {cameraState === 'active' && !error && (
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={handleCapture}
                  className="bg-white rounded-full p-4 shadow-lg hover:bg-gray-100 transition-colors"
                >
                  <Camera size={32} className="text-gray-800" />
                </button>
              </div>
            )}

            {/* カメラ切り替えボタン（エラーがない場合のみ） */}
            {cameraState === 'active' && !error && (
              <button
                onClick={handleSwitchCamera}
                className="absolute top-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-colors"
              >
                <RotateCcw size={20} />
              </button>
            )}

            {/* エラー時の再撮影ボタン */}
            {cameraState === 'active' && error && processedImageUrl && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="bg-white bg-opacity-95 rounded-lg p-6 text-center backdrop-blur-sm shadow-lg max-w-sm mx-4">
                  <div className="text-red-500 mb-4">
                    <AlertCircle size={48} className="mx-auto mb-2" />
                    <div className="font-medium">画質が不十分です</div>
                  </div>
                  <div className="text-sm text-gray-600 mb-4">
                    撮影した画像の品質を改善してください
                  </div>
                  <button
                    onClick={() => {
                      setError(null);
                      setQualityResult(null);
                      setProcessedImageUrl(null);
                    }}
                    className="bg-blue-500 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-600 transition-colors"
                  >
                    再撮影
                  </button>
                </div>
              </div>
            )}

            {/* 処理中表示 */}
            {(cameraState === 'capturing' || cameraState === 'analyzing' || cameraState === 'processing') && !error && (
              <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                <div className="bg-white bg-opacity-95 rounded-lg p-6 text-center backdrop-blur-sm shadow-lg">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <div className="text-gray-700 font-medium">
                    {cameraState === 'capturing' && '撮影中...'}
                    {cameraState === 'analyzing' && '画質を分析中...'}
                    {cameraState === 'processing' && '価格を認識中...'}
                  </div>
                  {(cameraState === 'analyzing' || cameraState === 'processing') && (
                    <div className="text-sm text-gray-500 mt-2">
                      撮影した画像を処理しています
                    </div>
                  )}
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
              {useAdvancedProcessing && (
                <p className="text-sm text-yellow-300">
                  高精度モードが有効です
                </p>
              )}
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