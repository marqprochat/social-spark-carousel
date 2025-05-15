
/**
 * Utilitário para gerenciar chaves de API no localStorage
 */

const STORAGE_KEY = 'social_spark_api_keys';

interface ApiKeys {
  openAiKey: string;
  unsplashKey: string;
}

export const saveApiKeys = (openAiKey: string, unsplashKey: string): void => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ openAiKey, unsplashKey }));
};

export const getApiKeys = (): ApiKeys | null => {
  const keys = localStorage.getItem(STORAGE_KEY);
  return keys ? JSON.parse(keys) : null;
};

export const hasApiKeys = (): boolean => {
  const keys = getApiKeys();
  return !!(keys && keys.openAiKey && keys.unsplashKey);
};

export const clearApiKeys = (): void => {
  localStorage.removeItem(STORAGE_KEY);
};
