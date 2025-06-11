import EventModel, { IEvent } from '../models/Event';
import { sendEmail } from './sendEmail';
import User from '../models/User';
import LocationModel from '../models/Location';

export function startEventWatcher() {
  const changeStream = EventModel.watch();

  changeStream.on('change', async (change) => {
      const newEvent = change.fullDocument as IEvent;
        const location = await LocationModel.findOne({ _id: newEvent.site_location });

        if (!location) {
          console.warn(`No location found for site_location: ${newEvent.site_location}`);
          return;
        }

        const user = await User.findOne({ site_location: location._id });
        if (!user) {
          console.warn(`No user found for location ${newEvent.site_location}`);
          return;
        }
      const message = `
      🚨 New Event Detected:
      - Site: ${newEvent.site_location}
      - Area: ${newEvent.area_location}
      - Status: ${newEvent.status}
      - Owner Site: ${user.email}
      - Details: ${newEvent.details}
      - Time: ${new Date(newEvent.time_).toLocaleString()}
      ${newEvent.no_hardhat_count !== undefined ? `- No Hard Hat Count: ${newEvent.no_hardhat_count}` : ''}`;

      try {
        await sendEmail(user.email, message);
        console.log(`Alert email sent to ${user.email}`);
      } catch (err) {
        console.error('Failed to send email:', err);
      }
    
  });

  console.log('Watching Events collection for new events creartion...');
}