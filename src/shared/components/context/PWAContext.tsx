import { createOfflineListener, createUpdateNotification, type PWAUpdateInfo } from '@/shared/utils/pwa';
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';

interface PWAContextValue extends PWAUpdateInfo {
  isOnline: boolean;
  showUpdatePrompt: boolean;
  dismissUpdatePrompt: () => void;
}

const PWAContext = createContext<PWAContextValue | null>(null);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider = ({ children }: PWAProviderProps) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);

  const {
    updateServiceWorker,
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
  } = useRegisterSW({
    onRegistered(r: any) {
      console.log('Service Worker が登録されました:', r);
    },
    onRegisterError(error: any) {
      console.error('Service Worker の登録に失敗しました:', error);
    },
    onNeedRefresh() {
      console.log('新しいコンテンツが利用可能です');
      setShowUpdatePrompt(true);
    },
    onOfflineReady() {
      console.log('アプリをオフラインで使用する準備ができました');
      setOfflineReady(true);
    },
  });

  // オフライン状態の監視
  useEffect(() => {
    const cleanup = createOfflineListener(setIsOnline);
    return cleanup;
  }, []);

  // 自動更新通知の表示
  useEffect(() => {
    if (needRefresh && !showUpdatePrompt) {
      // 自動更新通知を表示（ユーザーが明示的に閉じるまで表示）
      const cleanup = createUpdateNotification(async () => {
        await updateServiceWorker(true);
        setNeedRefresh(false);
        setShowUpdatePrompt(false);
      });

      return cleanup;
    }
  }, [needRefresh, showUpdatePrompt, updateServiceWorker, setNeedRefresh]);

  const handleUpdateSW = async () => {
    try {
      await updateServiceWorker(true);
      setNeedRefresh(false);
      setShowUpdatePrompt(false);
    } catch (error) {
      console.error('Service Worker の更新に失敗しました:', error);
    }
  };

  const dismissUpdatePrompt = () => {
    setShowUpdatePrompt(false);
  };

  const contextValue: PWAContextValue = {
    isUpdateAvailable: needRefresh,
    updateSW: handleUpdateSW,
    offlineReady,
    isOnline,
    showUpdatePrompt,
    dismissUpdatePrompt,
  };

  return <PWAContext.Provider value={contextValue}>{children}</PWAContext.Provider>;
};

export const usePWA = (): PWAContextValue => {
  const context = useContext(PWAContext);
  if (!context) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

export default PWAProvider; 