// activity.routes.ts
import { Router } from 'express';
import { auth } from '../middleware/auth.middleware';
import { getRecentActivity } from '../services/activity.services';

const router = Router();

router.get('/', auth, getRecentActivity); // optional groupId as query ?groupId=...
router.get('/:groupId', auth, getRecentActivity); // optional groupId as query ?groupId=...

export default router;
