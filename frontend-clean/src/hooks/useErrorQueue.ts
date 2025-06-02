import { useState, useRef, useEffect } from 'react';

type TimedError = {
  id: number;
  message: string;
};

export function useErrorQueue(duration = 3000) {
  const [visibleErrors, setVisibleErrors] = useState<TimedError[]>([]);
  const nextIdRef = useRef(0);

  const addError = (message: string) => {
    // const alreadyVisible = visibleErrors.some(e => e.message === message);
    // if (alreadyVisible) return;

    const id = ++nextIdRef.current;
    const newError = { id, message };

    setVisibleErrors(prev => [...prev, newError]);

    setTimeout(() => {
      setVisibleErrors(prev => prev.filter(e => e.id !== id));
    }, duration);
  };

  const dismissError = (id: number) => {
    setVisibleErrors(prev => prev.filter(e => e.id !== id));
  };

  return { visibleErrors, addError, dismissError };
}
