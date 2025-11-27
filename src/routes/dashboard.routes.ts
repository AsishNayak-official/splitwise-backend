import { Router } from 'express';
// import { auth } from '../middleware/auth';
import { getDashboard } from '../services/dashboard.services';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.get('/',auth, getDashboard);

export default router;
