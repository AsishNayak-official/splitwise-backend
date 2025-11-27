import { Request, Response } from 'express';
import { Group } from '../models/Group';
import { Expense } from '../models/Expense';
import { Activity } from '../models/Activity';
import { AuthRequest } from '../types/express';

interface CreateNewExpenseBody {
  groupName?: string;
  description: string;
  totalAmount: number;
  paidBy: string;
  participants: { userId: string; share: number }[];
}
interface CreateExpenseBodyExistingGroup {
  groupId?: string;
  description: string;
  totalAmount: number;
  paidBy: string;
  participants: { userId: string; share: number }[];
}

export const createExpenseWithNewGroup = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId!;
    const {
      groupName,
      description,
      totalAmount,
      paidBy,
      participants
    } = req.body as CreateNewExpenseBody;

    const sumShares = participants.reduce((acc, p) => acc + p.share, 0);
    if (sumShares !== totalAmount) {
      return res.status(400).json({ message: 'Shares must equal total amount' });
    }

     const memberIds = Array.from(
      new Set([ownerId, paidBy, ...participants.map(p => p.userId)])
    );

    const group = new Group({
      name: groupName,
      createdBy: ownerId,
      members: memberIds
    });
    await group.save();

    const expense = new Expense({
      group: group._id,
      description,
      totalAmount,
      paidBy,
      participants: participants.map((p) => ({ user: p.userId ,share: p.share })),
      date: new Date()
    });
    await expense.save();

    const activity = new Activity({
      type: 'expense',
      group: group._id,
      actor: req.userId!,
      amount: totalAmount,
      description,
      expense: expense._id
    });
    await activity.save();

    const expenses = await Expense.find({ group: group._id })
      .sort({ date: -1 })
      .lean();

    res.status(201).json({  group, expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create expense' });
  }
};


export const createExpenseInGroup = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId!;
    const {
      groupId,
      description,
      totalAmount,
      paidBy,
      participants
    } = req.body as CreateExpenseBodyExistingGroup;

    const sumShares = participants.reduce((acc, p) => acc + p.share, 0);
    if (sumShares !== totalAmount) {
      return res.status(400).json({ message: 'Shares must equal total amount' });
    }

    const expense = new Expense({
      group: groupId,
      description,
      totalAmount,
      paidBy,
      participants: participants.map(p => ({
        user: p.userId,
        share: p.share
      })),
      date: new Date()
    });
    await expense.save();

    const activity= new Activity({
      type: 'expense',
      group: groupId,
      actor: ownerId,
      amount: totalAmount,
      description,
      expense: expense._id
    });
    await activity.save();

    const expenses = await Expense.find({ group: groupId })
      .sort({ date: -1 })
      .lean();

    res.status(201).json({ expenses });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to create expense in group' });
  }
};