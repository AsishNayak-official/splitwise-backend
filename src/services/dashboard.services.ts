import { Request, Response } from 'express';
import { Activity } from '../models/Activity';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';

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

      const dto = {
        friendId,
        friendName: friend.name,
        netAmount: Math.abs(net)
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
