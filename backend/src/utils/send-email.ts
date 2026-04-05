import { Resend } from 'resend';
import { env } from '@config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<void> {
  if (env.NODE_ENV === 'test') return;

  const { error } = await resend.emails.send({
    from: 'noreply@school-admin.com',
    to,
    subject,
    html,
  });

  if (error) {
    console.error('Email send error:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
}
