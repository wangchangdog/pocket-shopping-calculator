/**
 * PWAの更新状態を管理するユーティリティ
 */

export interface PWAUpdateInfo {
  isUpdateAvailable: boolean;
  updateSW: () => Promise<void>;
  offlineReady: boolean;
}

/**
 * Service Workerの登録状態をチェック
 */
export const isServiceWorkerSupported = (): boolean => {
  return "serviceWorker" in navigator;
};

/**
 * PWAのインストール状態をチェック
 */
export const isPWAInstalled = (): boolean => {
  // Standalone mode (Android Chrome, Edge)
  if (window.matchMedia("(display-mode: standalone)").matches) {
    return true;
  }

  // iOS Safari
  if ((window.navigator as { standalone?: boolean }).standalone === true) {
    return true;
  }

  return false;
};

/**
 * デバイスタイプを判定
 */
export const getDeviceType = (): "mobile" | "desktop" => {
  const userAgent = navigator.userAgent.toLowerCase();
  const isMobile =
    /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
      userAgent
    );
  return isMobile ? "mobile" : "desktop";
};

/**
 * オフライン状態を監視するフック用ヘルパー
 */
export const createOfflineListener = (
  callback: (isOnline: boolean) => void
) => {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
};

/**
 * PWA更新通知を表示するためのヘルパー
 */
export const createUpdateNotification = (updateSW: () => Promise<void>) => {
  const notification = document.createElement("div");
  notification.className = "fixed top-4 left-4 right-4 z-50 mx-auto max-w-sm";
  notification.innerHTML = `
    <div class="bg-blue-500 text-white p-4 rounded-lg shadow-lg">
      <div class="flex items-center justify-between">
        <div>
          <p class="font-medium">アップデートが利用可能です</p>
          <p class="text-sm opacity-90">新しい機能と改善が含まれています</p>
        </div>
        <button id="update-btn" class="bg-white text-blue-500 px-3 py-1 rounded text-sm font-medium ml-3">
          更新
        </button>
      </div>
    </div>
  `;

  const updateBtn = notification.querySelector("#update-btn");
  updateBtn?.addEventListener("click", async () => {
    await updateSW();
    document.body.removeChild(notification);
  });

  document.body.appendChild(notification);

  // 30秒後に自動で非表示
  const timeoutId = setTimeout(() => {
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  }, 30000);

  return () => {
    clearTimeout(timeoutId);
    if (document.body.contains(notification)) {
      document.body.removeChild(notification);
    }
  };
};

/**
 * PWAのアナリティクス情報を取得
 */
export const getPWAAnalytics = () => {
  return {
    isInstalled: isPWAInstalled(),
    deviceType: getDeviceType(),
    isOnline: navigator.onLine,
    userAgent: navigator.userAgent,
    referrer: document.referrer,
    timestamp: Date.now(),
  };
};
