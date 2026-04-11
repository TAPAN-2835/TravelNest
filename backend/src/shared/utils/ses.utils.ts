import { SendEmailCommand } from '@aws-sdk/client-ses';
import { sesClient } from '../../config/aws';
import logger from './logger';

export const sendEmail = async (to: string, subject: string, body: string, isHtml: boolean = true) => {
  const params = {
    Destination: {
      ToAddresses: [to],
    },
    Message: {
      Body: {
        [isHtml ? 'Html' : 'Text']: {
          Charset: 'UTF-8',
          Data: body,
        },
      },
      Subject: {
        Charset: 'UTF-8',
        Data: subject,
      },
    },
    Source: process.env.SES_SENDER_EMAIL || 'noreply@travelnest.com',
  };

  try {
    const command = new SendEmailCommand(params);
    await sesClient.send(command);
    logger.info(`SES Email sent to ${to} with subject: ${subject}`);
  } catch (error) {
    logger.error(`Error sending SES email to ${to}:`, error);
    // Don't throw for emails in dev, but maybe in prod
    if (process.env.NODE_ENV === 'production') throw error;
  }
};

export const sendTripConfirmation = async (userEmail: string, userName: string, tripDetails: any) => {
  const subject = `Trip Confirmation: ${tripDetails.title}`;
  const body = `
    <h1>Hello ${userName}!</h1>
    <p>Your trip to <strong>${tripDetails.destination}</strong> has been successfully planned.</p>
    <p><strong>Dates:</strong> ${tripDetails.startDate} to ${tripDetails.endDate}</p>
    <p><strong>Budget:</strong> ${tripDetails.totalBudget} ${tripDetails.currency}</p>
    <br/>
    <p>View your full itinerary on TravelNest!</p>
  `;
  await sendEmail(userEmail, subject, body);
};

export const sendAlertNotification = async (userEmail: string, alert: any) => {
  const subject = `[${alert.severity}] TravelNest Alert: ${alert.title}`;
  const body = `
    <h3>Travel Alert</h3>
    <p>${alert.message}</p>
    <p>Stay safe and check the TravelNest dashboard for more details.</p>
  `;
  await sendEmail(userEmail, subject, body);
};
