import { Router } from 'express';
import { planTrip } from './ai.controller';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/plan-trip', planTrip);

export default router;
