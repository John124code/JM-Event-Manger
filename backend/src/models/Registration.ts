import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  userPhone?: string;
  ticketType: string;
  ticketPrice: number;
  paymentMethod: 'bank_transfer' | 'cash_app' | 'paypal';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  paymentDetails?: {
    transactionId?: string;
    paymentReference?: string;
    paidAt?: Date;
    accountHolderName?: string;
    cashAppUsername?: string;
  };
  registrationDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>({
  eventId: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true,
    trim: true
  },
  userEmail: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  userPhone: {
    type: String,
    trim: true
  },
  ticketType: {
    type: String,
    required: true,
    trim: true
  },
  ticketPrice: {
    type: Number,
    required: true,
    min: 0
  },
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'cash_app', 'paypal'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded'],
    default: 'pending'
  },
  paymentDetails: {
    transactionId: String,
    paymentReference: String,
    paidAt: Date,
    accountHolderName: String,
    cashAppUsername: String
  },
  registrationDate: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index to prevent duplicate registrations
registrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });

// Index for queries
registrationSchema.index({ eventId: 1, createdAt: -1 });
registrationSchema.index({ userId: 1, createdAt: -1 });
registrationSchema.index({ paymentStatus: 1 });

export default mongoose.model<IRegistration>('Registration', registrationSchema);
