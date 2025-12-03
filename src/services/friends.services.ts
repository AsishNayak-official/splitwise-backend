import { Response } from 'express';
import { Activity } from '../models/Activity';
import { Friend } from '../models/Friend';
import { User } from '../models/User';
import { AuthRequest } from '../types/express';
import { computeNetBalancesForUser } from '../utils/balances';

export const addFriend = async (req: AuthRequest, res: Response) => {
  try {
    const owner = req.userId!;
    const { name, email, upiId } = req.body as {
      name: string;
      email: string;
      upiId: string;
    };

    let user = await User.findOne({ email, upiId }).exec();

    if (!user) {
      user = new User({
        name,
        email,
        upiId,
      } as any);
      await user.save();
    }

    const friend = await Friend.findOneAndUpdate(
      { owner, friendUser: user._id },
      {},
      { upsert: true, new: true, setDefaultsOnInsert: true },
    );

    res.status(201).json({
      id: user._id,
      name: user.name,
      email: user.email,
      upiId: user.upiId,
      youOwe: 0,
      owesYou: 0,
      lastActivityAt: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to add friend' });
  }
};

export const listFriends = async (req: AuthRequest, res: Response) => {
  try {
    const ownerId = req.userId!;
    const links = await Friend.find({ owner: ownerId })
      .populate('friendUser', 'name email upiId')
      .lean();

    const netMap = await computeNetBalancesForUser(ownerId, null); // all groups

    const result = await Promise.all(
      links.map(async (link) => {
        const friend = link.friendUser as any;
        const friendId = friend._id.toString();
        const net = netMap[friendId] ?? 0; // >0 you owe, <0 they owe

        const lastActivity = await Activity.findOne({
          $or: [{ actor: ownerId }, { actor: friendId }],
        })
          .sort({ createdAt: -1 })
          .lean();

        return {
          id: friendId,
          name: friend.name,
          email: friend.email,
          upiId: friend.upiId,
          youOwe: net > 0 ? net : 0,
          youAreOwed: net < 0 ? -net : 0,
          lastActivityAt: lastActivity?.createdAt ?? null,
        };
      }),
    );

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to list friends' });
  }
};
