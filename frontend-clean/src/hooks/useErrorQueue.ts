import { useState, useRef, useEffect, useCallback } from 'react';

type TimedAlert = {
  id: number;
  message: string;
  type: 'error' | 'success'; // Extendable to 'info' | 'warning'
};

export function useTimedAlerts(duration = 3000) {
  const [visibleAlerts, setVisibleAlerts] = useState<TimedAlert[]>([]);
  const nextIdRef = useRef(0);

  const addAlert = (message: string,  type: TimedAlert['type']) => {
    // const alreadyVisible = visibleAlerts.some(e => e.message === message);
    // if (alreadyVisible) return;

    const id = ++nextIdRef.current;
    const newAlert = { id, message, type };

    setVisibleAlerts(prev => [...prev, newAlert]);

    setTimeout(() => {
      setVisibleAlerts(prev => prev.filter(e => e.id !== id));
    }, duration);
  };

  const addError = useCallback((message: string) => {
    addAlert(message, 'error');
  }, [addAlert]);

  const addSuccess = useCallback((message: string) => {
    addAlert(message, 'success');
  }, [addAlert]);

  const dismissAlert = (id: number) => {
    setVisibleAlerts(prev => prev.filter(e => e.id !== id));
  };

  return { visibleAlerts, addError, addSuccess, dismissAlert };
}
