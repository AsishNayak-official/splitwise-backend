// src/models/Activity.ts
import { Schema, model, Document, Types } from 'mongoose';

export type ActivityType = 'expense' | 'settlement';

export interface IActivity extends Document {
  type: ActivityType;
  group?: Types.ObjectId;
  actor: Types.ObjectId;
  description: string;
  amount?: number;
  expense?: Types.ObjectId;
  settlement?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: { type: String, enum: ['expense', 'settlement'], required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group' },
    actor: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    description: { type: String, required: true },
    amount: { type: Number },
    expense: { type: Schema.Types.ObjectId, ref: 'Expense' },
    settlement: { type: Schema.Types.ObjectId, ref: 'Settlement' }
  },
  { timestamps: true }
);

export const Activity = model<IActivity>('Activity', ActivitySchema);
