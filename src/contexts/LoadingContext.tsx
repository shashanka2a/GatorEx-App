import { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  isNavigating: boolean;
  setNavigating: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);

  const setNavigating = (loading: boolean) => {
    setIsNavigating(loading);
  };

  return (
    <LoadingContext.Provider value={{ isNavigating, setNavigating }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (context === undefined) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}