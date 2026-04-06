import { SESClient, SendEmailCommand } from '@aws-sdk/client-ses';

const sesClient = new SESClient({ region: process.env.AWS_REGION });

export const sendEmail = async (to: string, subject: string, html: string) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Body: { Html: { Data: html } },
      Subject: { Data: subject },
    },
    Source: process.env.AWS_SES_FROM_EMAIL,
  });

  try {
    await sesClient.send(command);
  } catch (error) {
    console.error('SES Email Error:', error);
  }
};

export const welcomeEmail = (name: string, email: string) => ({
  subject: 'Welcome to TravelNest ✈️',
  html: `<h1>Welcome, ${name}!</h1><p>Start planning your dream trip today.</p><button>Start Planning</button>`,
});

export const bookingConfirmationEmail = (booking: any, user: any) => ({
  subject: `Booking Confirmed — ${booking.destination.name}`,
  html: `<h1>Booking Confirmed</h1><p>Hi ${user.name}, your booking for ${booking.destination.name} is confirmed.</p>`,
});

export const tripReminderEmail = (trip: any, user: any) => ({
  subject: `Your trip to ${trip.destination.name} is tomorrow! 🌍`,
  html: `<h1>Trip Reminder</h1><p>Hi ${user.name}, your trip starts tomorrow!</p>`,
});

export const passwordResetEmail = (resetUrl: string, user: any) => ({
  subject: 'Reset your TravelNest password',
  html: `<h1>Reset Password</h1><p>Hi ${user.name}, click <a href="${resetUrl}">here</a> to reset your password.</p>`,
});

export const bookingCancellationEmail = (booking: any, user: any) => ({
  subject: 'Booking Cancellation Confirmed',
  html: `<h1>Cancellation Confirmed</h1><p>Hi ${user.name}, your booking has been cancelled.</p>`,
});
