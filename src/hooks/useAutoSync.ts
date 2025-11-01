import { useState, useEffect, useRef } from 'react';
import { syncService } from '../services/syncService';

export function useAutoSync() {
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const callbackRef = useRef<((data: any) => void) | null>(null);

  const start = (token: string, callback: (data: any) => void, intervalMinutes = 2) => {
    if (isRunning) stop();
    
    callbackRef.current = callback;
    setIsRunning(true);

    const performSync = async () => {
      if (!isRunning) return;
      
      try {
        const lastSync = localStorage.getItem('lastSyncTimestamp');
        const result = await syncService.syncData(token, lastSync || undefined);
        
        if (result.success && result.data && callbackRef.current) {
          const hasNewData = Object.values(result.stats).some(count => count > 0);
          if (hasNewData) {
            callbackRef.current(result.data);
            localStorage.setItem('lastSyncTimestamp', result.lastModified || new Date().toISOString());
          }
        }
      } catch (error) {
        console.warn('Auto sync error:', error);
      }
    };

    performSync();
    intervalRef.current = window.setInterval(performSync, intervalMinutes * 60 * 1000);
  };

  const stop = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsRunning(false);
    callbackRef.current = null;
  };

  const performOnce = async (token?: string) => {
    const syncToken = token || localStorage.getItem('syncToken');
    if (!syncToken) return;
    
    try {
      const result = await syncService.syncData(syncToken);
      if (result.success && callbackRef.current) {
        callbackRef.current(result.data);
      }
    } catch (error) {
      console.warn('Manual sync error:', error);
    }
  };

  useEffect(() => {
    return () => stop();
  }, []);

  return { isRunning, start, stop, performOnce };
}