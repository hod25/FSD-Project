import express from 'express';
import { updateEventStatus } from '../controllers/eventController';

const router = express.Router();

router.post('/status/:eventId', updateEventStatus);

export default router;