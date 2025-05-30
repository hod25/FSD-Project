import { Router } from 'express';
import { updateEventStatus } from '../controllers/eventController';

const router = Router();

router.post('/status', updateEventStatus);

export default router;