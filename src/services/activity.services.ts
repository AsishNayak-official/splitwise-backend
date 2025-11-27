// activity.controller.ts
import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../types/express';
import { Types } from 'mongoose';

export const getRecentActivity = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId;

    const query: any = {};
    if (groupId && Types.ObjectId.isValid(groupId)) {
      query.group = new Types.ObjectId(groupId);
    }
    const items = await Activity.find(query)
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('group', 'name')
      .populate('actor', 'name')
      .lean();

    res.json(items);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load activity' });
  }
};
