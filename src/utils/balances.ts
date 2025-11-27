import { Types } from 'mongoose';
import { Expense } from '../models/Expense';
import { Settlement } from '../models/Settlement';

export type NetBalances = Record<string, number>;

export async function computeNetBalancesForUser(
  userId: string | Types.ObjectId,
  groupId?: string | Types.ObjectId | null
): Promise<NetBalances> {
  const uid = userId.toString();
  const net: NetBalances = {};

  const expenseQuery: any = {};
  if (groupId) expenseQuery.group = groupId;

  const settlementQuery: any = {};
  if (groupId) settlementQuery.group = groupId;

  const [expenses, settlements] = await Promise.all([
    Expense.find(expenseQuery).lean(),
    Settlement.find(settlementQuery).lean()
  ]);

  // Expenses: participant owes payer "share"
  for (const exp of expenses) {
    const payer = exp.paidBy.toString();
    for (const part of exp.participants as any[]) {
      const participant = part.user.toString();
      const share = part.share as number;
      if (participant === payer) continue;

      const from = participant;
      const to = payer;
      if (uid === from) {
        // I am participant: I owe payer
        net[to] = (net[to] ?? 0) + share;
      } else if (uid === to) {
        // I am payer: participant owes me
        net[from] = (net[from] ?? 0) - share;
      }
    }
  }

  // Settlements: "from" pays "to", so from's debt to to decreases
  for (const s of settlements) {
    const from = s.from.toString();
    const to = s.to.toString();
    const amount = s.amount as number;

    if (uid === from) {
      // I paid them: I owe less / or they owe me more negative
      net[to] = (net[to] ?? 0) - amount;
    } else if (uid === to) {
      // they paid me
      net[from] = (net[from] ?? 0) + amount;
    }
  }

  return net;
}
