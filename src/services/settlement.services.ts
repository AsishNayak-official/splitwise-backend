import { Response } from 'express';
import { Activity } from '../models/Activity';
import { Settlement } from '../models/Settlement';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';

async function createSettlement(opts: {
  from: string;
  to: string;
  group?: string | null;
  amount: number;
  method: 'cash' | 'upi' | 'other';
  actor: string;
}) {
  const settlement = await Settlement.create({
    from: opts.from,
    to: opts.to,
    group: opts.group ?? null,
    amount: opts.amount,
    method: opts.method
  });

  await Activity.create({
    type: 'settlement',
    group: opts.group ?? undefined,
    actor: opts.actor,
    amount: opts.amount,
    description: 'Settlement between users',
    settlement: settlement._id
  });

  return settlement;
}

async function getNetBetween(
  userA: string,
  userB: string,
  groupId: string | null
): Promise<number> {
  const netMap = await computeNetBalancesForUser(userA, groupId);
  return netMap[userB] ?? 0;
}

export const payFriendAllGroups = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;

    const net = await getNetBetween(me, friendId, null); // >0 I owe friend
    if (net <= 0) {
      return res.status(400).json({ message: 'You do not owe this friend overall.' });
    }

    const settlement = await createSettlement({
      from: me,
      to: friendId,
      group: null,
      amount: net,
      method: 'upi',
      actor: me
    });

    res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};

export const receiveFromFriendAllGroups = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;

    const net = await getNetBetween(friendId, me, null); // friend owes me
    if (net <= 0) {
      return res.status(400).json({ message: 'Friend does not owe you overall.' });
    }

    const settlement = await createSettlement({
      from: friendId,
      to: me,
      group: null,
      amount: net,
      method: 'upi',
      actor: me
    });

    res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};

export const payFriendInGroup = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;
    const groupId = req.params.groupId;

    const net = await getNetBetween(me, friendId, groupId);
    if (net <= 0) {
      return res
        .status(400)
        .json({ message: 'You do not owe this friend in this group.' });
    }

    const settlement = await createSettlement({
      from: me,
      to: friendId,
      group: groupId,
      amount: net,
      method: 'upi',
      actor: me
    });

    res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};

export const receiveFriendInGroup = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;
    const groupId = req.params.groupId;

    const net = await getNetBetween(friendId, me, groupId); // friend owes me in group
    if (net <= 0) {
      return res
        .status(400)
        .json({ message: 'Friend does not owe you in this group.' });
    }

    const settlement = await createSettlement({
      from: friendId,
      to: me,
      group: groupId,
      amount: net,
      method: 'upi',
      actor: me
    });

    res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};
