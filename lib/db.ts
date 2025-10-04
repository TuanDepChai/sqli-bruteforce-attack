// MongoDB Database Connection
// This file is now replaced by lib/mongodb.ts
// All database operations should use MongoDB models from lib/models/

export { default as dbConnect } from './mongodb'
export { default as User } from './models/User'
export { default as SecurityEvent } from './models/SecurityEvent'
export { default as Session } from './models/Session'

// Legacy compatibility - redirect to MongoDB
export function getDatabase() {
  console.warn('⚠️  getDatabase() is deprecated. Use MongoDB models instead.')
  return null
}

export function closeDatabase() {
  console.warn('⚠️  closeDatabase() is deprecated. MongoDB handles connections automatically.')
}
