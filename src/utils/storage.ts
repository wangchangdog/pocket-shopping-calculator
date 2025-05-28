import type { AppSettings, ShoppingSession } from "../types";

const STORAGE_KEYS = {
  session: "pocket-shopping-session",
  settings: "pocket-shopping-settings",
} as const;

/**
 * セッションデータをローカルストレージに保存
 */
export const saveSession = (session: ShoppingSession): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.session, JSON.stringify(session));
  } catch (error) {
    console.error("セッションデータの保存に失敗しました:", error);
  }
};

/**
 * セッションデータをローカルストレージから読み込み
 */
export const loadSession = (): ShoppingSession | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.session);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("セッションデータの読み込みに失敗しました:", error);
    return null;
  }
};

/**
 * セッションデータをクリア
 */
export const clearSession = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEYS.session);
  } catch (error) {
    console.error("セッションデータのクリアに失敗しました:", error);
  }
};

/**
 * 設定データをローカルストレージに保存
 */
export const saveSettings = (settings: AppSettings): void => {
  try {
    localStorage.setItem(STORAGE_KEYS.settings, JSON.stringify(settings));
  } catch (error) {
    console.error("設定データの保存に失敗しました:", error);
  }
};

/**
 * 設定データをローカルストレージから読み込み
 */
export const loadSettings = (): AppSettings | null => {
  try {
    const data = localStorage.getItem(STORAGE_KEYS.settings);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error("設定データの読み込みに失敗しました:", error);
    return null;
  }
};

/**
 * デフォルト設定を取得
 */
export const getDefaultSettings = (): AppSettings => ({
  defaultTaxRate: 10,
  defaultTaxMode: "included",
  enableHistory: false,
});

/**
 * デフォルトセッションを作成
 */
export const createDefaultSession = (
  settings?: AppSettings
): ShoppingSession => {
  const defaultSettings = settings || getDefaultSettings();
  const now = new Date().toISOString();

  return {
    sessionId: `session-${Date.now()}`,
    taxMode: defaultSettings.defaultTaxMode,
    taxRate: defaultSettings.defaultTaxRate,
    items: [],
    totalAmount: 0,
    createdAt: now,
    updatedAt: now,
  };
};
