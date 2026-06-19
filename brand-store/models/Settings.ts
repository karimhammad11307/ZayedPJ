/**
 * models/Settings.ts
 *
 * Mongoose model for key-value site settings.
 * Intended for admin-controlled settings only (e.g. hero_image, announcement_text).
 *
 * Security notes:
 *   - key is validated against a strict enum allow-list.
 *     Only pre-defined setting keys are accepted, preventing arbitrary key injection.
 *   - value has maxlength to prevent DoS via large payloads.
 *   - Only authenticated admin routes can write to this collection.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

/* Extend this enum as new settings are needed */
export type SettingKey = 'hero_image' | 'announcement_text'

export interface ISetting extends Document {
  key:   SettingKey
  value: string
}

const SettingsSchema = new Schema<ISetting>(
  {
    key: {
      type:     String,
      required: true,
      unique:   true,
      enum: {
        values: ['hero_image', 'announcement_text'] as SettingKey[],
        message: '"{VALUE}" is not a recognised setting key',
      },
    },
    value: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 2000,
    },
  },
  {
    timestamps: true,
  }
)

// key unique index is declared inline via unique: true above

const Settings: Model<ISetting> =
  mongoose.models.Settings ?? mongoose.model<ISetting>('Settings', SettingsSchema)

export default Settings
