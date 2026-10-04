import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role: 'participant' | 'organizer' | 'admin';
  status: 'active' | 'disabled';
  createdAt: Date;
  comparePassword: (candidatePassword: string) => Promise<boolean>;
}

const userSchema = new mongoose.Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['participant', 'organizer', 'admin'], 
    required: true,
    default: 'participant' 
  },
  status: { type: String, enum: ['active', 'disabled'], default: 'active' }
}, { timestamps: true });

// NOTE: `unique: true` on email already creates the unique index.
// Hash password before saving
userSchema.pre('save', async function(this: any) {
  if (!this.isModified('password')) return;
  if (this.password) {
    this.password = await bcrypt.hash(this.password, 10);
  }
});

userSchema.methods.comparePassword = async function(candidatePassword: string) {
  return bcrypt.compare(candidatePassword, this.password || '');
};

export const User = mongoose.model<IUser>('User', userSchema);
