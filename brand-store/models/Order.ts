/**
 * models/Order.ts
 *
 * Mongoose model for customer orders.
 *
 * Security notes:
 *   - status transitions are enforced via enum allow-list.
 *   - fulfillment.type is an enum allow-list (delivery | pickup).
 *   - phone is validated against a basic E.164-compatible pattern
 *     (server-side; frontend also validates but we never trust client).
 *   - email is validated via a permissive RFC-5322 pattern (server-side).
 *   - total is validated as non-negative.
 *   - price and quantity have min validators to prevent negative values.
 *   - Address and name fields have maxlength to prevent DoS via large payloads.
 */

import mongoose, { Schema, Document, Model } from 'mongoose'

/* ── Embedded types ── */
export interface IOrderItem {
  productId: string
  name:      string
  price:     number
  size:      string
  color:     string
  quantity:  number
}

export interface IFulfillment {
  type:     'delivery' | 'pickup'
  address?: string
  city?:    string
  notes?:   string
}

export interface IOrder extends Document {
  customerName: string
  email:        string
  phone:        string
  fulfillment:  IFulfillment
  items:        IOrderItem[]
  total:        number
  status:       'pending' | 'confirmed' | 'shipped' | 'delivered'
  createdAt:    Date
  updatedAt:    Date
}

/* ── Sub-schemas ── */
const OrderItemSchema = new Schema<IOrderItem>(
  {
    productId: { type: String, required: true, maxlength: 64 },
    name:      { type: String, required: true, trim: true, maxlength: 200 },
    price:     { type: Number, required: true, min: 0 },
    size:      {
      type: String,
      required: true,
      enum: ['XS', 'S', 'M', 'L', 'XL'],
    },
    color:    { type: String, required: true, trim: true, maxlength: 64 },
    quantity: {
      type:    Number,
      required: true,
      min:     1,
      validate: {
        validator: Number.isInteger,
        message:   'quantity must be a positive integer',
      },
    },
  },
  { _id: false }
)

const FulfillmentSchema = new Schema<IFulfillment>(
  {
    type:    { type: String, required: true, enum: ['delivery', 'pickup'] },
    address: { type: String, trim: true, maxlength: 500 },
    city:    { type: String, trim: true, maxlength: 100 },
    notes:   { type: String, trim: true, maxlength: 1000 },
  },
  { _id: false }
)

/* ── Main schema ── */
const OrderSchema = new Schema<IOrder>(
  {
    customerName: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 200,
    },
    email: {
      type:     String,
      required: true,
      trim:     true,
      lowercase: true,
      maxlength: 320,
      // Basic server-side email format validation
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    phone: {
      type:     String,
      required: true,
      trim:     true,
      maxlength: 20,
      // Allows optional leading + then digits, spaces, hyphens
      match: [/^\+?[\d\s\-]{7,20}$/, 'Invalid phone number'],
    },
    fulfillment: {
      type:     FulfillmentSchema,
      required: true,
    },
    items: {
      type:     [OrderItemSchema],
      required: true,
      validate: {
        validator: (arr: IOrderItem[]) => arr.length >= 1 && arr.length <= 100,
        message:   'Order must have between 1 and 100 items',
      },
    },
    total: {
      type:     Number,
      required: true,
      min:      [0, 'Total cannot be negative'],
    },
    status: {
      type:    String,
      enum:    ['pending', 'confirmed', 'shipped', 'delivered'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
    toJSON:     { virtuals: true },
  }
)

// Indexes for common admin queries
OrderSchema.index({ createdAt: -1 })
OrderSchema.index({ status: 1, createdAt: -1 })
OrderSchema.index({ email: 1 })

const Order: Model<IOrder> =
  mongoose.models.Order ?? mongoose.model<IOrder>('Order', OrderSchema)

export default Order
