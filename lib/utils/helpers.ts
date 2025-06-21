// Generate a unique ID
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

// Format date to human-readable format
export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Format file size
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file extension
export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

// Intercept console methods for the preview
export const createConsoleInterceptor = (
  onLog: (type: 'log' | 'error' | 'warn' | 'info', args: any[]) => void
): () => void => {
  const originalConsole = {
    log: console.log,
    error: console.error,
    warn: console.warn,
    info: console.info
  };

  console.log = (...args) => {
    originalConsole.log(...args);
    onLog('log', args);
  };

  console.error = (...args) => {
    originalConsole.error(...args);
    onLog('error', args);
  };

  console.warn = (...args) => {
    originalConsole.warn(...args);
    onLog('warn', args);
  };

  console.info = (...args) => {
    originalConsole.info(...args);
    onLog('info', args);
  };

  // Return a cleanup function
  return () => {
    console.log = originalConsole.log;
    console.error = originalConsole.error;
    console.warn = originalConsole.warn;
    console.info = originalConsole.info;
  };
};