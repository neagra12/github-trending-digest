// Simple logger with timestamps and levels
export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] ℹ️  INFO: ${message}`, ...args);
  },
  
  success: (message: string, ...args: any[]) => {
    console.log(`[${new Date().toISOString()}] ✅ SUCCESS: ${message}`, ...args);
  },
  
  warning: (message: string, ...args: any[]) => {
    console.warn(`[${new Date().toISOString()}] ⚠️  WARNING: ${message}`, ...args);
  },
  
  error: (message: string, error?: any, ...args: any[]) => {
    console.error(`[${new Date().toISOString()}] ❌ ERROR: ${message}`, error, ...args);
    
    // In production, you could send to Sentry, Datadog, etc.
    if (process.env.NODE_ENV === 'production') {
      // TODO: Send to error tracking service
    }
  },
  
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log(`[${new Date().toISOString()}] 🐛 DEBUG: ${message}`, ...args);
    }
  }
};