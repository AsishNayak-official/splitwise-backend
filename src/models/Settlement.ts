// src/models/Settlement.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface ISettlement extends Document {
  from: Types.ObjectId;
  to: Types.ObjectId;
  group?: Types.ObjectId | null;
  amount: number;
  method: 'cash' | 'upi' | 'other';
  note?: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettlementSchema = new Schema<ISettlement>(
  {
    from: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    to: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    group: { type: Schema.Types.ObjectId, ref: 'Group', default: null },
    amount: { type: Number, required: true },
    method: { type: String, enum: ['cash', 'upi', 'other'], default: 'upi' },
    note: { type: String }
  },
  { timestamps: true }
);

export const Settlement = model<ISettlement>('Settlement', SettlementSchema);
