/**
 * lib/cloudinary.ts
 *
 * Cloudinary v2 SDK configuration for server-side operations.
 *
 * Security notes:
 *   - All credentials are read from env variables only; no fallback literals.
 *   - CLOUDINARY_API_SECRET is NEVER exposed to the browser.
 *     Only NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME and upload presets may be public.
 *   - The signed upload signature endpoint (/api/admin/upload-signature) uses
 *     cloudinary.utils.api_sign_request to generate short-lived signatures.
 *   - TODO(security): Set upload presets to "signed" mode in Cloudinary dashboard
 *     to prevent unsigned uploads from circumventing server-side validation.
 *   - TODO(security): Integrate Cloudinary's content moderation add-on to scan
 *     uploaded images for malware / inappropriate content before publishing.
 */

import { v2 as cloudinary } from 'cloudinary'

const CLOUD_NAME  = process.env.CLOUDINARY_CLOUD_NAME
const API_KEY     = process.env.CLOUDINARY_API_KEY
const API_SECRET  = process.env.CLOUDINARY_API_SECRET

if (!CLOUD_NAME || !API_KEY || !API_SECRET) {
  throw new Error(
    '[cloudinary] Missing one or more Cloudinary environment variables: ' +
    'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET'
  )
}

cloudinary.config({
  cloud_name: CLOUD_NAME,
  api_key:    API_KEY,
  api_secret: API_SECRET,
  secure:     true, // Always use HTTPS URLs
})

export default cloudinary

/**
 * Generate a signed upload signature for the browser.
 * Called by /api/admin/upload-signature route handler.
 *
 * @param folder  Cloudinary folder to upload into (e.g. 'products')
 * @returns       { signature, timestamp, apiKey, cloudName }
 */
export function generateUploadSignature(folder: string): {
  signature: string
  timestamp: number
  apiKey: string
  cloudName: string
} {
  const timestamp = Math.round(Date.now() / 1000)

  const signature = cloudinary.utils.api_sign_request(
    { timestamp, folder },
    API_SECRET as string
  )

  return {
    signature,
    timestamp,
    apiKey:    API_KEY as string,
    cloudName: CLOUD_NAME as string,
  }
}
