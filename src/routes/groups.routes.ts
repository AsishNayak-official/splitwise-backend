import { Router } from 'express';
// import { auth } from '../middleware/auth';
import {
  listGroupsForUser,
  createGroup,
  getGroupDetail
} from '../services/groups.services';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',auth, listGroupsForUser);
router.post('/',auth, createGroup);
router.get('/:groupId',auth, getGroupDetail);

export default router;
