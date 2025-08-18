// lib/sendEmail.ts
import { google } from 'googleapis';

const oAuth2 = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID!,
  process.env.GMAIL_CLIENT_SECRET!,
  // Redirect isn’t used at runtime; token was already obtained
  'urn:ietf:wg:oauth:2.0:oob'
);
oAuth2.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN! });

function buildRaw(from: string, to: string, subject: string, html: string) {
  const msg = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=UTF-8',
    '',
    html,
  ].join('\r\n');

  // Base64URL encoding
  return Buffer.from(msg)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

export async function sendEmail(to: string, message: string): Promise<void> {
  if (!process.env.GMAIL_SENDER) {
    throw new Error('GMAIL_SENDER not set');
  }

  const gmail = google.gmail({ version: 'v1', auth: oAuth2 });
  const raw = buildRaw(
    process.env.GMAIL_SENDER,
    to,
    'New Safety Event Alert -',
    message
  );

  try {
    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw },
    });
  } catch (err: any) {
    // Surface useful context
    const code = err?.code || err?.response?.status;
    const data = err?.response?.data;
    console.error('Gmail API send failed:', code, data || err?.message || err);
    throw err;
  }
}