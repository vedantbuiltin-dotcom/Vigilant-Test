import { useEffect, useRef, useState } from 'react';

/**
 * Light-weight countdown that ticks every `intervalMs` until it hits 0.
 * Returns the seconds left and a `reset` function.
 */
export const useCountdown = (initialSeconds, { intervalMs = 1000, onTick, onEnd } = {}) => {
  const [secondsLeft, setSecondsLeft] = useState(Math.max(0, Math.floor(initialSeconds || 0)));
  const onTickRef = useRef(onTick);
  const onEndRef = useRef(onEnd);

  onTickRef.current = onTick;
  onEndRef.current = onEnd;

  useEffect(() => {
    setSecondsLeft(Math.max(0, Math.floor(initialSeconds || 0)));
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onEndRef.current?.();
      return undefined;
    }
    const id = setInterval(() => {
      setSecondsLeft((prev) => {
        const next = Math.max(0, prev - 1);
        onTickRef.current?.(next);
        if (next === 0) onEndRef.current?.();
        return next;
      });
    }, intervalMs);
    return () => clearInterval(id);
  }, [secondsLeft > 0, intervalMs]); // eslint-disable-line react-hooks/exhaustive-deps

  return [secondsLeft, setSecondsLeft];
};
