// src/models/Expense.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IParticipant {
  user: Types.ObjectId;
  share: number;
}

export interface IExpense extends Document {
  group: Types.ObjectId;
  description: string;
  totalAmount: number;
  paidBy: Types.ObjectId;
  participants: IParticipant[];
  date: Date;
  createdAt: Date;
  updatedAt: Date;
}

const ParticipantSchema = new Schema<IParticipant>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    share: { type: Number, required: true }
  },
  { _id: false }
);

const ExpenseSchema = new Schema<IExpense>(
  {
    group: { type: Schema.Types.ObjectId, ref: 'Group', required: true },
    description: { type: String, required: true },
    totalAmount: { type: Number, required: true },
    paidBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    participants: { type: [ParticipantSchema], required: true },
    date: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

export const Expense = model<IExpense>('Expense', ExpenseSchema);
