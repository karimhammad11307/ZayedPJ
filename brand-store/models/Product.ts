/**
 * models/Product.ts
 *
 * Mongoose model for brand products.
 *
 * Security notes:
 *   - Mongoose schema enforces types and enum allow-lists server-side.
 *   - slug is validated against a safe character allow-list (alphanumeric + hyphens).
 *   - price is validated as a non-negative number.
 *   - images array contains Cloudinary URLs only (set by server-side upload flow).
 *   - stock is validated as a non-negative integer.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

export interface IVariant {
  size:           string
  color:          string
  stock:          number
  waistPerimeter?: number
}

export interface IProduct extends Document {
  name:        string
  slug:        string
  description: string
  price:       number
  category:    'tops' | 'bottoms' | 'dresses' | 'outerwear'
  images:      string[]
  variants:    IVariant[]
  isFeatured:  boolean
  isActive:    boolean
  createdAt:   Date
}

const VariantSchema = new Schema<IVariant>(
  {
    size:  {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL'],
    },
    color: {
      type: String,
      required: true,
      trim: true,
      maxlength: 64,
    },
    stock: {
      type:    Number,
      required: true,
      min:     0,
      validate: {
        validator: Number.isInteger,
        message:   'stock must be an integer',
      },
    },
    waistPerimeter: {
      type:     Number,
      required: false,
      min:      [0, 'Waist perimeter cannot be negative'],
    },
  },
  { _id: false }
)

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 200,
    },
    slug: {
      type:     String,
      required: true,
      unique:   true,
      trim:     true,
      lowercase: true,
      // Allow-list: only lowercase letters, digits, and hyphens
      match: [/^[a-z0-9-]+$/, 'Slug may only contain lowercase letters, digits, and hyphens'],
      maxlength: 200,
    },
    description: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 5000,
    },
    price: {
      type:     Number,
      required: true,
      min:      [0, 'Price cannot be negative'],
    },
    category: {
      type:     String,
      required: true,
      enum:     ['tops', 'bottoms', 'dresses', 'outerwear'],
    },
    images: {
      type:    [String],
      default: [],
      validate: {
        validator: (arr: string[]) => arr.length <= 10,
        message: 'Maximum 10 images per product',
      },
    },
    variants: {
      type:    [VariantSchema],
      default: [],
    },
    isFeatured: {
      type:    Boolean,
      default: false,
    },
    isActive: {
      type:    Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// Indexes for common queries (slug unique index is declared inline above)
ProductSchema.index({ category: 1, isActive: 1 })
ProductSchema.index({ isFeatured: 1, isActive: 1 })
ProductSchema.index({ createdAt: -1 })

const Product: Model<IProduct> =
  mongoose.models.Product ?? mongoose.model<IProduct>('Product', ProductSchema)

export default Product
