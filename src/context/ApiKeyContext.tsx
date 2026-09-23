import React, { createContext, useContext, useState, useEffect } from 'react';
import { getRawgApiKey, setRawgApiKey as persistRawgApiKey, hasRawgApiKey } from '../services/rawgApi';

interface ApiKeyContextType {
  apiKey: string;
  hasKey: boolean;
  isKeyModalOpen: boolean;
  openKeyModal: () => void;
  closeKeyModal: () => void;
  saveApiKey: (key: string) => void;
  clearApiKey: () => void;
}

const ApiKeyContext = createContext<ApiKeyContextType | undefined>(undefined);

export const ApiKeyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>(() => getRawgApiKey());
  const [hasKey, setHasKey] = useState<boolean>(() => hasRawgApiKey());
  const [isKeyModalOpen, setIsKeyModalOpen] = useState<boolean>(false);

  useEffect(() => {
    const currentKey = getRawgApiKey();
    setApiKey(currentKey);
    setHasKey(Boolean(currentKey));
  }, []);

  const saveApiKey = (key: string) => {
    persistRawgApiKey(key);
    const updated = getRawgApiKey();
    setApiKey(updated);
    setHasKey(Boolean(updated));
    if (updated) {
      setIsKeyModalOpen(false);
    }
  };

  const clearApiKey = () => {
    persistRawgApiKey('');
    setApiKey('');
    setHasKey(false);
  };

  const openKeyModal = () => setIsKeyModalOpen(true);
  const closeKeyModal = () => setIsKeyModalOpen(false);

  return (
    <ApiKeyContext.Provider
      value={{
        apiKey,
        hasKey,
        isKeyModalOpen,
        openKeyModal,
        closeKeyModal,
        saveApiKey,
        clearApiKey,
      }}
    >
      {children}
    </ApiKeyContext.Provider>
  );
};

export function useApiKey(): ApiKeyContextType {
  const context = useContext(ApiKeyContext);
  if (!context) {
    throw new Error('useApiKey deve ser utilizado dentro de um ApiKeyProvider');
  }
  return context;
}
