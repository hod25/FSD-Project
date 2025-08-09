import nodemailer from 'nodemailer';

export async function sendEmail(to: string, message: string): Promise<void> {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject: '🚨 New Safety Event Alert - ProSafe',
    html: message,
    text: message.replace(/<[^>]*>/g, ''), // Strip HTML for text fallback
  });
}