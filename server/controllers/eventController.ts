import { Request, Response, NextFunction } from 'express';
import EventModel from '../models/Event';

export const updateEventStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { eventId } = req.body;;
    console.log("req", req);
    console.log('Event ID:', eventId);

    const status = 'Handled'; 

    const updatedEvent = await EventModel.findByIdAndUpdate(
      eventId,
      { status },
      { new: true }
    );

    if (!updatedEvent) {
      res.status(404).json({ message: 'Event not found' });
      return;
    }

    res.json(updatedEvent);
  } catch (error) {
    next(error);
  }
};
export default {
updateEventStatus
};