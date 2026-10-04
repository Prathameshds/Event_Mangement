import mongoose from 'mongoose';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
  organizerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: {
    venue: { type: String, required: true },
    city: { type: String, required: true }
  },
  capacity: { type: Number, required: true, min: 1 },
  registrationFee: { type: Number, default: 0, min: 0 },
  status: { 
    type: String, 
    enum: ['upcoming', 'ongoing', 'completed', 'cancelled'], 
    default: 'upcoming' 
  },
  image: { type: String },
  contactInfo: { type: String }
}, { timestamps: true });

// Indexing for performance
eventSchema.index({ date: 1 });
eventSchema.index({ categoryId: 1 });
eventSchema.index({ organizerId: 1 });
eventSchema.index({ status: 1 });

export const Event = mongoose.model('Event', eventSchema);
