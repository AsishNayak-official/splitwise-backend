import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  upiId: string;
  passwordHash?: string;
  createdAt: Date;      
  updatedAt: Date;      
  lastActiveAt: Date;   
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    upiId: { type: String, required: true },
    passwordHash: { type: String },
    lastActiveAt: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

UserSchema.index({ email: 1, upiId: 1 }, { unique: true });

export const User = model<IUser>('User', UserSchema);
