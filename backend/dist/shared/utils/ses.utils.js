"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAlertNotification = exports.sendTripConfirmation = exports.sendEmail = void 0;
const client_ses_1 = require("@aws-sdk/client-ses");
const aws_1 = require("../../config/aws");
const logger_1 = __importDefault(require("./logger"));
const sendEmail = async (to, subject, body, isHtml = true) => {
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
        const command = new client_ses_1.SendEmailCommand(params);
        await aws_1.sesClient.send(command);
        logger_1.default.info(`SES Email sent to ${to} with subject: ${subject}`);
    }
    catch (error) {
        logger_1.default.error(`Error sending SES email to ${to}:`, error);
        // Don't throw for emails in dev, but maybe in prod
        if (process.env.NODE_ENV === 'production')
            throw error;
    }
};
exports.sendEmail = sendEmail;
const sendTripConfirmation = async (userEmail, userName, tripDetails) => {
    const subject = `Trip Confirmation: ${tripDetails.title}`;
    const body = `
    <h1>Hello ${userName}!</h1>
    <p>Your trip to <strong>${tripDetails.destination}</strong> has been successfully planned.</p>
    <p><strong>Dates:</strong> ${tripDetails.startDate} to ${tripDetails.endDate}</p>
    <p><strong>Budget:</strong> ${tripDetails.totalBudget} ${tripDetails.currency}</p>
    <br/>
    <p>View your full itinerary on TravelNest!</p>
  `;
    await (0, exports.sendEmail)(userEmail, subject, body);
};
exports.sendTripConfirmation = sendTripConfirmation;
const sendAlertNotification = async (userEmail, alert) => {
    const subject = `[${alert.severity}] TravelNest Alert: ${alert.title}`;
    const body = `
    <h3>Travel Alert</h3>
    <p>${alert.message}</p>
    <p>Stay safe and check the TravelNest dashboard for more details.</p>
  `;
    await (0, exports.sendEmail)(userEmail, subject, body);
};
exports.sendAlertNotification = sendAlertNotification;
//# sourceMappingURL=ses.utils.js.map