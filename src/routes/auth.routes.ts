import { Router } from 'express';
import { signup, login, me } from '../services/auth.services';
import { auth } from '../middleware/auth.middleware';

const router = Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/me', auth, me);

export default router;
