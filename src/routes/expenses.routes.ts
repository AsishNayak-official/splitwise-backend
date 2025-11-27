import { Router } from 'express';
// import { auth } from '../middleware/auth';
import { auth } from '../middleware/auth.middleware';
import { createExpenseInGroup, createExpenseWithNewGroup } from '../services/expenses.services';

const router = Router();

router.post('/new-group', auth, createExpenseWithNewGroup);
router.post('/group', auth, createExpenseInGroup);

export default router;
