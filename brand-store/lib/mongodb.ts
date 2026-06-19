/**
 * lib/mongodb.ts
 *
 * Mongoose connection with module-level caching.
 * Prevents creating multiple connections in Next.js
 * serverless / hot-reload environments on Vercel.
 *
 * Security notes:
 *   - MONGODB_URI is read from env only; no fallback literal.
 *   - Errors during connection bubble up so requests fail-closed.
 *   - TODO(security): Enforce mTLS for MongoDB Atlas connections
 *     by adding tlsCertificateKeyFile + tlsCAFile to connect options
 *     once Atlas Private Link / dedicated cluster certificates are provisioned.
 */

import mongoose, { Mongoose } from 'mongoose'

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error(
    '[mongodb] MONGODB_URI environment variable is not set. ' +
    'Add it to .env.local or your Vercel project settings.'
  )
}

/* ── Global cache to survive hot reloads in dev ── */
declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: {
    conn: Mongoose | null
    promise: Promise<Mongoose> | null
  } | undefined
}

const cached = global._mongooseCache ?? { conn: null, promise: null }
global._mongooseCache = cached

async function connectDB(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn
  }

  if (!cached.promise) {
    const opts: mongoose.ConnectOptions = {
      bufferCommands: false,
      // Principle of least privilege: use a dedicated DB user in Atlas
      // with readWrite on the single application database only.
    }

    cached.promise = mongoose.connect(MONGODB_URI as string, opts)
  }

  try {
    cached.conn = await cached.promise
  } catch (err) {
    // Reset promise so the next call retries
    cached.promise = null
    throw err
  }

  return cached.conn
}

export default connectDB
