import { useState, useEffect, useCallback } from 'react';
import { WebContainer } from '@webcontainer/api';

let webContainerInstance: WebContainer | null = null;
let bootPromise: Promise<WebContainer> | null = null;

export function useWebContainer() {
  const [webContainer, setWebContainer] = useState<WebContainer | null>(webContainerInstance);
  const [isLoading, setIsLoading] = useState(!webContainerInstance);
  const [error, setError] = useState<string | null>(null);

  const initialize = useCallback(async () => {
    if (webContainerInstance) {
      setWebContainer(webContainerInstance);
      setIsLoading(false);
      return;
    }

    if (bootPromise) {
      // Wait for another call to finish booting
      const instance = await bootPromise;
      setWebContainer(instance);
      setIsLoading(false);
      return;
    }

    // Start a new boot and lock it
    setIsLoading(true);
    setError(null);
    bootPromise = WebContainer.boot();

    try {
      const instance = await bootPromise;
      webContainerInstance = instance;
      setWebContainer(instance);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown WebContainer error';
      console.error('WebContainer boot error:', err);
      setError(msg);
    } finally {
      bootPromise = null; // clear the lock after boot attempt
      setIsLoading(false);
    }
  }, []);

  const restart = useCallback(async () => {
    if (webContainerInstance) {
      webContainerInstance.teardown();
      webContainerInstance = null;
      setWebContainer(null);
    }

    await initialize();
  }, [initialize]);

  const teardown = useCallback(() => {
    if (webContainerInstance) {
      webContainerInstance.teardown();
      webContainerInstance = null;
    }
    setWebContainer(null);
    setIsLoading(false);
    setError(null);
  }, []);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return {
    webContainer,
    isLoading,
    error,
    restart,
    teardown
  };
}
