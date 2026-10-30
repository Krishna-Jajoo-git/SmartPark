import { useState, useEffect } from 'react';

/**
 * Custom hook to calculate live ticking elapsed time and tariff tier
 * Updates every second for a real-time, responsive feel.
 */
export function useLiveTimer(entryTimeStr) {
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!entryTimeStr) {
    return {
      elapsedSeconds: 0,
      formattedTime: '00h 00m 00s',
      liveFare: 0,
      minutesInCurrentTier: 0,
      tierProgressPercent: 0,
    };
  }

  const entryMs = new Date(entryTimeStr).getTime();
  const elapsedSeconds = Math.max(0, Math.floor((now - entryMs) / 1000));

  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;

  const pad = (n) => String(n).padStart(2, '0');
  const formattedTime = `${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`;

  // Tariff: ceil(elapsedSeconds / 10800) * 50
  // 0 seconds = 0; any positive seconds = at least 50
  let liveFare = 0;
  if (elapsedSeconds > 0) {
    const tierBlocks = Math.ceil(elapsedSeconds / 10800);
    liveFare = tierBlocks * 50;
  }

  // Progress in current 3-hour block (10,800 seconds)
  const secondsInCurrentTier = elapsedSeconds % 10800;
  const tierProgressPercent = Math.min(100, Math.floor((secondsInCurrentTier / 10800) * 100));

  return {
    elapsedSeconds,
    formattedTime,
    liveFare,
    tierProgressPercent,
  };
}
