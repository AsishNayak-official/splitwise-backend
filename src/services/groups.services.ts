import { Response } from 'express';
import { Expense } from '../models/Expense';
import { Group } from '../models/Group';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';

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

    res.json({ group, youOwe, youAreOwed, expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to load group' });
  }
};
