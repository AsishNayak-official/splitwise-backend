import { Router } from 'express';
// import { auth } from '../middleware/auth';
import {
  payFriendAllGroups,
  receiveFromFriendAllGroups,
  payFriendInGroup,
  receiveFriendInGroup
} from '../services/settlement.services';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/friend/:friendId/pay-all',auth, payFriendAllGroups);
router.post('/friend/:friendId/receive-all',auth, receiveFromFriendAllGroups);

router.post('/group/:groupId/friend/:friendId/pay',auth, payFriendInGroup);
router.post('/group/:groupId/friend/:friendId/receive',auth, receiveFriendInGroup);

export default router;
