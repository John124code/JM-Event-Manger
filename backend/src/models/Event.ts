import mongoose, { Document, Schema } from 'mongoose';

export interface ITicketType {
  name: string;
  price: number;
  description?: string;
  available: number;
  sold: number;
}

export interface IPaymentMethod {
  type: 'bank_transfer' | 'cash_app' | 'paypal';
  details: {
    bankName?: string;
    accountNumber?: string;
    username?: string;
    email?: string;
  };
}

export interface IEventRating {
  userId: mongoose.Types.ObjectId;
  userName: string;
  rating: number;
  comment?: string;
  createdAt: Date;
}

export interface IEvent extends Document {
  title: string;
  description: string;
  creator: mongoose.Types.ObjectId;
  date: Date;
  time: string;
  location: string;
  capacity: number;
  booked: number;
  image?: string;
  category: string;
  status: 'active' | 'cancelled' | 'completed';
  views: number;
  ratings: IEventRating[];
  ticketTypes: ITicketType[];
  paymentMethods: IPaymentMethod[];
  media?: {
    type: 'image' | 'video';
    url: string;
    fileName: string;
    publicId?: string; // Cloudinary public ID
  };
  createdAt: Date;
  updatedAt: Date;
}

const ticketTypeSchema = new Schema<ITicketType>({
  name: {
    type: String,
    required: true,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  available: {
    type: Number,
    required: true,
    min: 0
  },
  sold: {
    type: Number,
    default: 0,
    min: 0
  }
});

const paymentMethodSchema = new Schema<IPaymentMethod>({
  type: {
    type: String,
    enum: ['bank_transfer', 'cash_app', 'paypal'],
    required: true
  },
  details: {
    bankName: String,
    accountNumber: String,
    username: String,
    email: String
  }
});

const eventRatingSchema = new Schema<IEventRating>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    maxlength: 500
  }
}, {
  timestamps: true
});

const eventSchema = new Schema<IEvent>({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(value: Date) {
        return value > new Date();
      },
      message: 'Event date must be in the future'
    }
  },
  time: {
    type: String,
    required: false,
    default: '00:00'
  },
  location: {
    type: String,
    required: [true, 'Event location is required'],
    trim: true,
    minlength: [3, 'Location must be at least 3 characters long']
  },
  capacity: {
    type: Number,
    required: [true, 'Event capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [10000, 'Capacity cannot exceed 10,000']
  },
  booked: {
    type: Number,
    default: 0,
    min: 0
  },
  image: {
    type: String,
    default: null
  },
  category: {
    type: String,
    required: [true, 'Event category is required'],
    enum: ['Technology', 'Business', 'Workshop', 'Music', 'Food & Drink', 'Sports', 'Art & Culture', 'Education', 'Entertainment', 'Community', 'Health & Wellness', 'Other']
  },
  status: {
    type: String,
    enum: ['active', 'cancelled', 'completed'],
    default: 'active'
  },
  views: {
    type: Number,
    default: 0,
    min: 0
  },
  ratings: [eventRatingSchema],
  ticketTypes: {
    type: [ticketTypeSchema],
    validate: {
      validator: function(array: ITicketType[]) {
        return array.length > 0;
      },
      message: 'At least one ticket type is required'
    }
  },
  paymentMethods: {
    type: [paymentMethodSchema],
    validate: {
      validator: function(array: IPaymentMethod[]) {
        return array.length > 0;
      },
      message: 'At least one payment method is required'
    }
  },
  media: {
    type: {
      type: String,
      enum: ['image', 'video']
    },
    url: String,
    fileName: String,
    publicId: String // For Cloudinary
  }
}, {
  timestamps: true
});

// Index for better query performance
eventSchema.index({ creator: 1, createdAt: -1 });
eventSchema.index({ category: 1, date: 1 });
eventSchema.index({ title: 'text', description: 'text' });
eventSchema.index({ date: 1, status: 1 });

// Virtual for average rating
eventSchema.virtual('averageRating').get(function() {
  if (this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((acc, rating) => acc + rating.rating, 0);
  return Number((sum / this.ratings.length).toFixed(1));
});

// Ensure virtual fields are serialized
eventSchema.set('toJSON', { virtuals: true });

export default mongoose.model<IEvent>('Event', eventSchema);
