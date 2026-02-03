import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

interface Toast {
  id: number;
  message: string;
  type: 'info' | 'simulation';
}

interface SimulationContextType {
  guidedMode: boolean;
  setGuidedMode: (enabled: boolean) => void;
  showToast: (message: string, type?: 'info' | 'simulation') => void;
  toasts: Toast[];
}

const SimulationContext = createContext<SimulationContextType | undefined>(undefined);

export const SimulationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [guidedMode, setGuidedMode] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);

  const showToast = useCallback((message: string, type: 'info' | 'simulation' = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  return (
    <SimulationContext.Provider value={{ guidedMode, setGuidedMode, showToast, toasts }}>
      {children}
    </SimulationContext.Provider>
  );
};

export const useSimulation = () => {
  const context = useContext(SimulationContext);
  if (!context) {
    throw new Error('useSimulation must be used within a SimulationProvider');
  }
  return context;
};