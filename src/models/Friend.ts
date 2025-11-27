    // src/models/Friend.ts
import { Schema, model, Document, Types } from 'mongoose';

export interface IFriend extends Document {
  owner: Types.ObjectId;
  friendUser: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FriendSchema = new Schema<IFriend>(
  {
    owner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    friendUser: { type: Schema.Types.ObjectId, ref: 'User', required: true }
  },
  { timestamps: true }
);

FriendSchema.index({ owner: 1, friendUser: 1 }, { unique: true });

export const Friend = model<IFriend>('Friend', FriendSchema);
