import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';
import { Group } from '../models/Group';

export const getDashboard = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const balancesMap = await computeNetBalancesForUser(me, null);

    const youOwe: any[] = [];
    const youAreOwed: any[] = [];

    for (const [friendId, net] of Object.entries(balancesMap    )) {
      if (net === 0) continue;
      const friend = await User.findById(friendId).lean();
      if (!friend) continue;

      // 1) Find all groups where BOTH you and this friend are members
      const groups = await Group.find({
        members: { $all: [me, friend._id] },
      })
        .select("name")
        .lean();

      const groupNames = groups.map((g) => g.name as string);

       // 2) Latest activity date across those groups
      let latestDate: Date | null = null;
      if (groups.length > 0) {
        const groupIds = groups.map((g) => g._id);
        const latestActivity = await Activity.findOne({
          group: { $in: groupIds },
        })
          .sort({ createdAt: -1 })
          .lean();

        latestDate = latestActivity ? (latestActivity.createdAt as Date) : null;
      }

      const dto = {
        friendId,
        friendName: friend.name,
        netAmount: Math.abs(net),
        groups: groupNames,      // 🔹 array of group names
        date: latestDate,
      };

      if (net > 0) youOwe.push(dto);
      else youAreOwed.push(dto);
    }

    res.json({ youOwe, youAreOwed });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load dashboard' });
  }
};
