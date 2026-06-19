/**
 * app/api/admin/settings/route.ts
 *
 * GET   /api/admin/settings  — Public:  return all settings as a key/value object
 * PATCH /api/admin/settings  — Admin:   upsert a single setting
 *
 * Security notes:
 *   - GET is intentionally public because the hero image setting must be
 *     readable by the homepage without requiring authentication.
 *   - PATCH verifies admin JWT (defense-in-depth on top of edge middleware).
 *   - Only keys defined in the SettingKey type (schema enum allow-list) are
 *     accepted — prevents arbitrary key injection.
 *   - value has maxlength 2000 enforced at the schema level.
 *   - Stack traces are never exposed in error responses.
 */

import { NextRequest, NextResponse } from 'next/server'

import connectDB from '@/lib/mongodb'
import { verifyToken, AUTH_COOKIE_NAME } from '@/lib/auth'
import Settings from '@/models/Settings'
import type { SettingKey } from '@/models/Settings'

/* Allow-list of valid setting keys — mirrors the Mongoose enum */
const ALLOWED_KEYS: SettingKey[] = ['hero_image', 'announcement_text']

/* ── GET /api/admin/settings ──────────────────────────────────── */
export async function GET(_request: NextRequest): Promise<NextResponse> {
  try {
    await connectDB()

    const rows = await Settings.find({}).lean()

    // Transform array of { key, value } docs into a flat key/value object
    const settings: Record<string, string> = {}
    for (const row of rows) {
      settings[row.key] = row.value
    }

    return NextResponse.json({ settings }, { status: 200 })
  } catch (err) {
    console.error('[GET /api/admin/settings]', (err as Error).message)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

/* ── PATCH /api/admin/settings ────────────────────────────────── */
export async function PATCH(request: NextRequest): Promise<NextResponse> {
  try {
    // ── Auth ────────────────────────────────────────────────────
    const token = request.cookies.get(AUTH_COOKIE_NAME)?.value
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyToken(token)
    if (!payload || payload.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    const body = await request.json()
    const { key, value } = body

    // ── Validate key ────────────────────────────────────────────
    if (!key) {
      return NextResponse.json({ error: 'key is required' }, { status: 400 })
    }

    if (!ALLOWED_KEYS.includes(key as SettingKey)) {
      return NextResponse.json(
        { error: `Invalid key. Must be one of: ${ALLOWED_KEYS.join(', ')}` },
        { status: 400 }
      )
    }

    // ── Validate value ──────────────────────────────────────────
    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'value is required' }, { status: 400 })
    }

    if (typeof value !== 'string') {
      return NextResponse.json({ error: 'value must be a string' }, { status: 400 })
    }

    // ── Upsert setting ──────────────────────────────────────────
    const setting = await Settings.findOneAndUpdate(
      { key },
      { key, value },
      { upsert: true, returnDocument: 'after', runValidators: true }
    )

    return NextResponse.json({ setting }, { status: 200 })
  } catch (err) {
    const error = err as Error
    console.error('[PATCH /api/admin/settings]', error.message)

    if (error.name === 'ValidationError') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
