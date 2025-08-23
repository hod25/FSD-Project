import EventModel, { IEvent } from '../models/Event';
import { sendEmail } from './sendEmail';
import User from '../models/User';
import LocationModel from '../models/Location';

let changeStream: any = null;

const sendEmailWithRetry = async (to: string, message: string, retries = 3) => {
  for (let i = 0; i < retries; i++) {
    try {
      await sendEmail(to, message);
      return;
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
};

export function startEventWatcher() {
  // Close existing change stream if any
  if (changeStream) {
    changeStream.close();
  }
  console.log("event watcher started")
  changeStream = EventModel.watch();
  changeStream.on('change', async (change: any) => {
    
    const newEvent = change.fullDocument as IEvent;
        if (newEvent.status === 'Handled') return;

    const location = await LocationModel.findOne({ _id: newEvent.site_location });

    if (!location) {
      console.warn(`No location found for site_location: ${newEvent.site_location}`);
      return;
    }
    console.log("biiiiiiiiiiii")

    const users = await User.find({ 
      site_location: location._id,
      notification: true,
      access_level: { $in: ['admin', 'supervisor'] }
    });
    console.log("ciiiiiiiiiiii")
    if (users.length === 0) {
      console.warn(`No users found for location ${newEvent.site_location} with notifications enabled`);
      return;
    }

    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #d32f2f; color: white; padding: 20px; text-align: center;">
          <h2 style="margin: 0;">🚨 New Event Detected</h2>
        </div>
        <div style="background: #f5f5f5; padding: 20px; border-radius: 0 0 8px 8px;">
          <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px;">
            <h3 style="color: #333; margin-top: 0;">Event Details</h3>
            <p><strong>Site:</strong> ${location.name || newEvent.site_location}</p>
            <p><strong>Area:</strong> ${newEvent.area_location}</p>
            <p><strong>Time:</strong> ${new Date(newEvent.time_).toLocaleString()}</p>
            <p><strong>Status:</strong> ${newEvent.status}</p>
            <p><strong>Details:</strong> ${newEvent.details}</p>
            ${newEvent.no_hardhat_count ? `<p><strong>People without hardhats:</strong> ${newEvent.no_hardhat_count}</p>` : ''}
          </div>
          <div style="background: #e3f2fd; padding: 15px; border-radius: 8px; border-left: 4px solid #2196f3;">
            <p style="margin: 0; color: #1976d2;">
              <strong>Action Required:</strong> Please review this safety event and take appropriate action.
            </p>
          </div>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #666; font-size: 12px;">
          <p>This is an automated alert from ProSafe Safety Management System</p>
        </div>
      </div>
    `;

    for (const user of users) {
      try {
        console.log("diiiiiiiiiiii")
        await sendEmailWithRetry(user.email, htmlMessage);
        console.log(`Alert email sent to ${user.email}`);
      } catch (err) {
        console.error(`Failed to send email to ${user.email}:`, err);
      }
    }
  });

  changeStream.on('error', (error: any) => {
    console.error('Change stream error:', error);
    setTimeout(() => {
      console.log('Attempting to restart event watcher...');
      startEventWatcher();
    }, 5000);
  });

  console.log('Watching Events collection for new events creartion...');
}

export function stopEventWatcher() {
  if (changeStream) {
    changeStream.close();
    changeStream = null;
  }
}