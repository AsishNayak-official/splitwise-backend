// src/models/Group.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IGroup extends Document {
  name: string;
  createdBy: Types.ObjectId;
  members: Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const GroupSchema = new Schema<IGroup>(
  {
    name: { type: String, required: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    members: [{ type: Schema.Types.ObjectId, ref: 'User', required: true }]
  },
  { timestamps: true }
);

GroupSchema.index({ name: 1 }, { unique: true });

export const Group = model<IGroup>('Group', GroupSchema);
