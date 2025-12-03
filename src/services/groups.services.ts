import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';
import { Settlement } from '../models/Settlement';

export const listGroupsForUser = async (req: AuthRequest, res: Response) => {
  try {
    const groups = await Group.find({ members: req.userId }).lean();
    res.json(groups);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list groups' });
  }
};

export const createGroup = async (req: AuthRequest, res: Response) => {
  try {
    const { name, memberIds } = req.body as { name: string; memberIds?: string[] };

    const members = Array.from(new Set([req.userId!, ...(memberIds || [])]));
    const group = new Group({ name, members, createdBy: req.userId });
    await group.save();
    res.status(201).json(group);
  } catch (err:any) {
     if (err.code === 11000) {
      return res.status(400).json({ message: 'Group name already exists' });
    }
    console.error(err);
    res.status(500).json({ message: 'Failed to create group' });
  }
};

export const getGroupDetail = async (req: AuthRequest, res: Response) => {
  try {
    const groupId = req.params.groupId;
        const me = req.userId!;

    const group = await Group.findById(groupId).populate('members', 'name').lean();

    if (!group) return res.status(404).json({ message: 'Group not found' });

    const balancesMap = await computeNetBalancesForUser(me, groupId);

    const youOwe: any[] = [];
    const youAreOwed: any[] = [];

     for (const [friendId, net] of Object.entries(balancesMap)) {
      if (net === 0) continue;

      const friend = await User.findById(friendId);
      if (!friend) continue;

      const dto = {
        friendId,
        friendName: friend.name,
        netAmount: Math.abs(net),
      };

      if (net > 0) youOwe.push(dto);
      else youAreOwed.push(dto);
    }

    const expenses = await Expense.find({ group: groupId })
      .sort({ date: -1 })
      .populate('paidBy', 'name')
      .lean();

      const settlements = await Settlement.find({ group: groupId })
      .sort({ createdAt: -1 })
      .populate("from", "name")
      .populate("to", "name")
      .lean();

    const settlementAsExpenses = settlements.map((s: any) => ({
      _id: s._id,
      group: s.group,
      description: `Settlement with ${s.to?.name ?? ""}`,
      totalAmount: s.amount,
      paidBy: {
        _id: s.from?._id ?? s.from,
        name: s.from?.name ?? "You",
      },
      participants: [
        {
          user: s.to?._id ?? s.to,
          share: s.amount,
        },
      ],
      date: s.createdAt,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
      __v: s.__v,
      // optional type flag if frontend needs to differentiate:
      type: "settlement" as const,
    }));

    // 3) merge & sort by date desc, but keep key name `expenses`
    const history = [...expenses, ...settlementAsExpenses].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );

    res.json({ group, youOwe, youAreOwed, history });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load group' });
  }
};
