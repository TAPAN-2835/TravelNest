import { Router } from 'express';
import { planTrip } from './ai.controller';

const router = Router();

// Assuming user must be logged in to plan a trip, but can make optional if needed.
// router.use(requireAuth); 

router.post('/plan-trip', planTrip);

export default router;
