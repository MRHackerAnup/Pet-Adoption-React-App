import mongoose from 'mongoose';

// Payment schema
const paymentSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: false, // Can be null for guest payments
  },
  petId: {
    type: Number,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: false, // Will be filled after payment completion
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  status: {
    type: String,
    required: true,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  method: {
    type: String,
    required: false,
  },
  receipt: {
    type: String,
    required: true,
  },
  notes: {
    type: Object,
    required: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Donation schema
const donationSchema = new mongoose.Schema({
  userId: {
    type: Number,
    required: false, // Can be null for guest donations
  },
  shelterId: {
    type: Number,
    required: true,
  },
  orderId: {
    type: String,
    required: true,
  },
  paymentId: {
    type: String,
    required: false, // Will be filled after payment completion
  },
  amount: {
    type: Number,
    required: true,
  },
  currency: {
    type: String,
    required: true,
    default: 'INR'
  },
  status: {
    type: String,
    required: true,
    enum: ['created', 'authorized', 'captured', 'refunded', 'failed'],
    default: 'created'
  },
  method: {
    type: String,
    required: false,
  },
  receipt: {
    type: String, 
    required: true,
  },
  notes: {
    type: Object,
    required: false,
  },
  message: {
    type: String,
    required: false,
  },
  anonymous: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Pre-save hook to update timestamps
paymentSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

donationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Create models if they don't exist or use existing ones
export const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
export const Donation = mongoose.models.Donation || mongoose.model('Donation', donationSchema);