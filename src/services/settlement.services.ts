import { Response } from 'express';
import { Activity } from '../models/Activity';
import { Settlement } from '../models/Settlement';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';
import { Group } from '../models/Group';

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
    method: opts.method,
  });

  await Activity.create({
    type: 'settlement',
    group: opts.group ?? undefined,
    actor: opts.actor,
    amount: opts.amount,
    description: 'Settlement between users',
    settlement: settlement._id,
  });

  return settlement;
}

async function getNetBetween(
  userA: string,
  userB: string,
  groupId: string | null,
): Promise<number> {
  const netMap = await computeNetBalancesForUser(userA, groupId);
  return netMap[userB] ?? 0;
}

export const multiplePayment = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;

    const net = await getNetBetween(me, friendId, null); // >0 I owe friend
    if (net <= 0) {
      return res
        .status(400)
        .json({ message: 'You do not owe this friend overall.' });
    }

    const groups = await Group.find({
      members: { $all: [me, friendId] },
    })
      .select('_id name')
      .lean();

    console.log({ groups });

    if (!groups.length) {
      return res.json({
        message:
          'You have no shared groups with this friend. Nothing to settle.',
      });
    }

    let settlements: any[] = [];

    for (const g of groups) {
      const settlement = await singlePaymentHandler(
        me,
        friendId,
        g._id.toString(),
      );
      if (settlement) settlements.push(settlement);
    }
    const finalNet = await getNetBetween(me, friendId, null);
    let overallSettlement = null;
    if (finalNet > 0) {
      overallSettlement = await createSettlement({
        from: me,
        to: friendId,
        group: null, // Global settlement
        amount: finalNet, // Amount is the REMAINING balance
        method: 'upi',
        actor: me,
      });
      settlements.push(overallSettlement);
    }

    res.status(201).json({
      message: overallSettlement
        ? 'Overall and group debts settled.'
        : 'Group debts settled, no remaining overall debt.',
      settlements,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};

export const multipleMarkAsReceived = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;

    const net = await getNetBetween(friendId, me, null); // friend owes me
    if (net <= 0) {
      return res
        .status(400)
        .json({ message: 'Friend does not owe you overall.' });
    }

    const groups = await Group.find({
      members: { $all: [me, friendId] },
    })
      .select('_id name')
      .lean();

    console.log({ groups });

    if (!groups.length) {
      return res.json({
        message:
          'You have no shared groups with this friend. Nothing to settle.',
      });
    }

    let settlements: any[] = [];

    for (const g of groups) {
      const settlement = await markAsReceivedHandler(
        me,
        friendId,
        g._id.toString(),
      );
      if (settlement) settlements.push(settlement);
    }
    const finalNet = await getNetBetween(friendId, me, null);
    let overallSettlement = null;

    if (finalNet > 0) {
      overallSettlement = await createSettlement({
        from: friendId, // Friend pays
        to: me, // I receive
        group: null,
        amount: finalNet,
        method: 'upi',
        actor: me,
      });
      settlements.push(overallSettlement);
    }

    res.status(201).json({
      message: overallSettlement
        ? 'Overall and group debts marked as received.'
        : 'Group debts marked as received, no remaining overall debt.',
      settlements,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};

export const singlePayment = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;
    const groupId = req.params.groupId;

    const settlement = await singlePaymentHandler(me, friendId, groupId);

    if (!settlement) {
      return res
        .status(400)
        .json({ message: 'You do not owe this friend in this group.' });
    }

    res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};

export const singlePaymentHandler = async (
  userId: string,
  friendId: string,
  groupId: string,
  method: string = 'upi',
) => {
  const net = await getNetBetween(userId, friendId, groupId);
  if (net <= 0) {
    return null;
  }

  const settlement = await createSettlement({
    from: userId,
    to: friendId,
    group: groupId,
    amount: net,
    method: 'upi',
    actor: userId,
  });

  return settlement;
};
export const markAsReceivedHandler = async (
  userId: string,
  friendId: string,
  groupId: string,
  method: string = 'upi',
) => {
  const net = await getNetBetween(friendId, userId, groupId);
  if (net <= 0) {
    return null;
  }

  const settlement = await createSettlement({
    from: friendId,
    to: userId,
    group: groupId,
    amount: net,
    method: 'upi',
    actor: userId,
  });

  return settlement;
};

export const singleMarkAsReceived = async (req: AuthRequest, res: Response) => {
  try {
    const me = req.userId!;
    const friendId = req.params.friendId;
    const groupId = req.params.groupId;

    const settlement = await markAsReceivedHandler(me,friendId, groupId);

    if (!settlement) {
      return res
        .status(400)
        .json({ message: 'You do not owe this friend in this group.' });
    }

    res.status(201).json(settlement);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create settlement' });
  }
};
