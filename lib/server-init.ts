import { realTimeLogger } from './real-time-logger'

// Initialize real-time logger on server startup
export function initializeRealTimeLogger() {
  try {
    realTimeLogger.startWatching()
    console.log('🚀 Real-time logger initialized successfully')
    
    // Set up graceful shutdown
    process.on('SIGINT', () => {
      console.log('🛑 Shutting down real-time logger...')
      realTimeLogger.stopWatching()
      process.exit(0)
    })

    process.on('SIGTERM', () => {
      console.log('🛑 Shutting down real-time logger...')
      realTimeLogger.stopWatching()
      process.exit(0)
    })

  } catch (error) {
    console.error('❌ Failed to initialize real-time logger:', error)
  }
}

// Auto-initialize if running in server environment
if (typeof window === 'undefined') {
  initializeRealTimeLogger()
}
