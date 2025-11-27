import { Router } from 'express';
// import { auth } from '../middleware/auth';
import { addFriend, listFriends } from '../services/friends.services';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',auth, listFriends);
router.post('/',auth, addFriend);

export default router;
