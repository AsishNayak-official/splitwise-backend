import { Router } from 'express';
// import { auth } from '../middleware/auth';
import { auth } from '../middleware/auth.middleware';
import {
  multipleMarkAsReceived,
  multiplePayment,
  singleMarkAsReceived,
  singlePayment
} from '../services/settlement.services';

const router = Router();

router.post('/friend/:friendId/pay-all',auth, multiplePayment);
router.post('/friend/:friendId/receive-all',auth, multipleMarkAsReceived);

router.post('/group/:groupId/friend/:friendId/pay',auth, singlePayment);
router.post('/group/:groupId/friend/:friendId/receive',auth, singleMarkAsReceived);

export default router;
