import type { CameraSettings } from '../../types';

/**
 * デフォルトのカメラ設定
 */
const DEFAULT_CAMERA_SETTINGS: CameraSettings = {
  facingMode: 'environment', // 背面カメラ（値札撮影用）
  width: 1280,
  height: 720,
};

/**
 * カメラストリーム
 */
let currentStream: MediaStream | null = null;

/**
 * カメラが利用可能かチェック
 */
export function isCameraAvailable(): boolean {
  return !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
}

/**
 * カメラストリームを開始
 */
export async function startCamera(
  videoElement: HTMLVideoElement,
  settings: Partial<CameraSettings> = {}
): Promise<MediaStream> {
  if (!isCameraAvailable()) {
    throw new Error('カメラが利用できません');
  }

  const config = { ...DEFAULT_CAMERA_SETTINGS, ...settings };

  try {
    // 既存のストリームがあれば停止
    if (currentStream) {
      stopCamera();
    }

    const constraints: MediaStreamConstraints = {
      video: {
        facingMode: config.facingMode,
        width: { ideal: config.width },
        height: { ideal: config.height },
      },
      audio: false,
    };

    currentStream = await navigator.mediaDevices.getUserMedia(constraints);
    videoElement.srcObject = currentStream;

    return new Promise((resolve, reject) => {
      videoElement.onloadedmetadata = () => {
        videoElement.play()
          .then(() => resolve(currentStream!))
          .catch(reject);
      };
      videoElement.onerror = reject;
    });
  } catch (error) {
    console.error('Camera start failed:', error);
    throw new Error('カメラの起動に失敗しました');
  }
}

/**
 * カメラストリームを停止
 */
export function stopCamera(): void {
  if (currentStream) {
    currentStream.getTracks().forEach(track => {
      track.stop();
    });
    currentStream = null;
  }
}

/**
 * 写真を撮影
 */
export function capturePhoto(
  videoElement: HTMLVideoElement,
  canvasElement: HTMLCanvasElement
): HTMLCanvasElement {
  const ctx = canvasElement.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  // ビデオの実際のサイズを取得
  const videoWidth = videoElement.videoWidth;
  const videoHeight = videoElement.videoHeight;

  // キャンバスサイズを設定
  canvasElement.width = videoWidth;
  canvasElement.height = videoHeight;

  // ビデオフレームをキャンバスに描画
  ctx.drawImage(videoElement, 0, 0, videoWidth, videoHeight);

  return canvasElement;
}

/**
 * 利用可能なカメラデバイスを取得
 */
export async function getAvailableCameras(): Promise<MediaDeviceInfo[]> {
  if (!isCameraAvailable()) {
    return [];
  }

  try {
    const devices = await navigator.mediaDevices.enumerateDevices();
    return devices.filter(device => device.kind === 'videoinput');
  } catch (error) {
    console.error('Failed to enumerate cameras:', error);
    return [];
  }
}

/**
 * カメラの向きを切り替え
 */
export async function switchCamera(
  videoElement: HTMLVideoElement,
  facingMode: 'user' | 'environment'
): Promise<MediaStream> {
  return startCamera(videoElement, { facingMode });
}

/**
 * 画像ファイルをキャンバスに読み込み
 */
export function loadImageToCanvas(
  file: File,
  canvasElement: HTMLCanvasElement
): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        const ctx = canvasElement.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas context not available'));
          return;
        }

        // キャンバスサイズを画像に合わせて設定
        canvasElement.width = img.width;
        canvasElement.height = img.height;

        // 画像をキャンバスに描画
        ctx.drawImage(img, 0, 0);
        resolve(canvasElement);
      };

      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'));
    reader.readAsDataURL(file);
  });
}

/**
 * キャンバスから画像データURLを取得
 */
export function canvasToDataURL(
  canvasElement: HTMLCanvasElement,
  format: string = 'image/jpeg',
  quality: number = 0.8
): string {
  return canvasElement.toDataURL(format, quality);
}

/**
 * 画像のリサイズ
 */
export function resizeImage(
  sourceCanvas: HTMLCanvasElement,
  targetCanvas: HTMLCanvasElement,
  maxWidth: number = 800,
  maxHeight: number = 600
): HTMLCanvasElement {
  const ctx = targetCanvas.getContext('2d');
  if (!ctx) {
    throw new Error('Canvas context not available');
  }

  const { width: originalWidth, height: originalHeight } = sourceCanvas;
  
  // アスペクト比を保持してリサイズ
  let { width, height } = calculateResizedDimensions(
    originalWidth,
    originalHeight,
    maxWidth,
    maxHeight
  );

  targetCanvas.width = width;
  targetCanvas.height = height;

  // リサイズして描画
  ctx.drawImage(sourceCanvas, 0, 0, originalWidth, originalHeight, 0, 0, width, height);
  
  return targetCanvas;
}

/**
 * リサイズ後の寸法を計算
 */
function calculateResizedDimensions(
  originalWidth: number,
  originalHeight: number,
  maxWidth: number,
  maxHeight: number
): { width: number; height: number } {
  let width = originalWidth;
  let height = originalHeight;

  // 最大幅を超える場合
  if (width > maxWidth) {
    height = (height * maxWidth) / width;
    width = maxWidth;
  }

  // 最大高さを超える場合
  if (height > maxHeight) {
    width = (width * maxHeight) / height;
    height = maxHeight;
  }

  return { width: Math.round(width), height: Math.round(height) };
} 