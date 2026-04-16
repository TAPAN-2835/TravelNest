"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.bookingCancellationEmail = exports.passwordResetEmail = exports.tripReminderEmail = exports.bookingConfirmationEmail = exports.welcomeEmail = exports.sendEmail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const sesClient = new client_ses_1.SESClient({ region: process.env.AWS_REGION });
const sendEmail = async (to, subject, html) => {
    const command = new client_ses_1.SendEmailCommand({
        Destination: { ToAddresses: [to] },
        Message: {
            Body: { Html: { Data: html } },
            Subject: { Data: subject },
        },
        Source: process.env.AWS_SES_FROM_EMAIL,
    });
    try {
        await sesClient.send(command);
    }
    catch (error) {
        console.error('SES Email Error:', error);
    }
};
exports.sendEmail = sendEmail;
const welcomeEmail = (name, email) => ({
    subject: 'Welcome to TravelNest ✈️',
    html: `<h1>Welcome, ${name}!</h1><p>Start planning your dream trip today.</p><button>Start Planning</button>`,
});
exports.welcomeEmail = welcomeEmail;
const bookingConfirmationEmail = (booking, user) => ({
    subject: `Booking Confirmed — ${booking.destination.name}`,
    html: `<h1>Booking Confirmed</h1><p>Hi ${user.name}, your booking for ${booking.destination.name} is confirmed.</p>`,
});
exports.bookingConfirmationEmail = bookingConfirmationEmail;
const tripReminderEmail = (trip, user) => ({
    subject: `Your trip to ${trip.destination.name} is tomorrow! 🌍`,
    html: `<h1>Trip Reminder</h1><p>Hi ${user.name}, your trip starts tomorrow!</p>`,
});
exports.tripReminderEmail = tripReminderEmail;
const passwordResetEmail = (resetUrl, user) => ({
    subject: 'Reset your TravelNest password',
    html: `<h1>Reset Password</h1><p>Hi ${user.name}, click <a href="${resetUrl}">here</a> to reset your password.</p>`,
});
exports.passwordResetEmail = passwordResetEmail;
const bookingCancellationEmail = (booking, user) => ({
    subject: 'Booking Cancellation Confirmed',
    html: `<h1>Cancellation Confirmed</h1><p>Hi ${user.name}, your booking has been cancelled.</p>`,
});
exports.bookingCancellationEmail = bookingCancellationEmail;
//# sourceMappingURL=email.utils.js.map