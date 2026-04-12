/**
 * TravelNest - AWS Lambda Notification Handler
 *
 * Trigger:  SQS Queue (travelnest-notifications)
 * Runtime:  Node.js 20.x
 * Role:     Must have ses:SendEmail + sqs:DeleteMessage permissions
 *
 * To deploy:
 *   1. Zip this file + node_modules (@aws-sdk/client-ses)
 *   2. Upload to Lambda → set handler to: notificationHandler.handler
 *   3. Add SQS trigger from the travelnest-notifications queue (batch size: 1)
 *   4. Set env vars: SES_SENDER_EMAIL, AWS_REGION
 */

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const sesClient = new SESClient({
  region: process.env.AWS_REGION || "ap-south-1",
});

// ─────────────────────────────────────────────
// Email Templates
// ─────────────────────────────────────────────

const buildTripCreatedEmail = (tripDetails) => ({
  subject: `✈️ Your Trip to ${tripDetails.destination} is Confirmed!`,
  html: `
    <!DOCTYPE html>
    <html>
      <body style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; background: #f9fafb;">
        <div style="background: #1d4ed8; padding: 24px; border-radius: 12px 12px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">TravelNest ✈️</h1>
          <p style="color: #bfdbfe; margin: 8px 0 0;">Your journey awaits!</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 0 0 12px 12px; border: 1px solid #e5e7eb;">
          <h2 style="color: #111827;">Trip Confirmed: ${tripDetails.title}</h2>
          <p style="color: #6b7280;">Here's a summary of your upcoming trip:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 24px 0;">
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; font-weight: bold; color: #374151; border-radius: 8px;">📍 Destination</td>
              <td style="padding: 12px; color: #111827;">${tripDetails.destination}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #374151;">📅 Start Date</td>
              <td style="padding: 12px; color: #111827;">${tripDetails.startDate}</td>
            </tr>
            <tr style="background: #f3f4f6;">
              <td style="padding: 12px; font-weight: bold; color: #374151; border-radius: 8px;">🏁 End Date</td>
              <td style="padding: 12px; color: #111827;">${tripDetails.endDate}</td>
            </tr>
            <tr>
              <td style="padding: 12px; font-weight: bold; color: #374151;">💰 Total Budget</td>
              <td style="padding: 12px; color: #111827;">${tripDetails.currency} ${Number(tripDetails.totalBudget).toLocaleString("en-IN")}</td>
            </tr>
          </table>

          <div style="text-align: center; margin-top: 32px;">
            <a href="https://travelnest.app/dashboard" style="background: #1d4ed8; color: white; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: bold;">
              View Full Itinerary →
            </a>
          </div>
          <p style="color: #9ca3af; font-size: 12px; text-align: center; margin-top: 32px;">
            You're receiving this because you created a trip on TravelNest.
          </p>
        </div>
      </body>
    </html>
  `,
});

// ─────────────────────────────────────────────
// Send via SES
// ─────────────────────────────────────────────

const sendEmail = async (to, subject, html) => {
  const command = new SendEmailCommand({
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Charset: "UTF-8", Data: subject },
      Body: {
        Html: { Charset: "UTF-8", Data: html },
      },
    },
    Source: process.env.SES_SENDER_EMAIL || "noreply@travelnest.com",
  });

  await sesClient.send(command);
  console.log(`Email sent to ${to}: ${subject}`);
};

// ─────────────────────────────────────────────
// Lambda Handler
// ─────────────────────────────────────────────

exports.handler = async (event) => {
  console.log(`Processing ${event.Records.length} SQS message(s)...`);

  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      let payload;

      // 1. Parse the message body
      try {
        payload = JSON.parse(record.body);
        console.log(`Parsed message type: ${payload.type}`);
      } catch (err) {
        // Unrecoverable — bad JSON, skip and let SQS delete it
        console.error("Failed to parse SQS message body:", record.body, err);
        return;
      }

      const { type, userEmail, tripDetails } = payload;

      if (!userEmail) {
        console.error("Missing userEmail in payload – skipping.");
        return;
      }

      // 2. Route by event type
      try {
        if (type === "TRIP_CREATED") {
          const { subject, html } = buildTripCreatedEmail(tripDetails);
          await sendEmail(userEmail, subject, html);
        } else {
          console.warn(`Unknown message type: ${type}. Skipping.`);
        }
      } catch (err) {
        // Re-throw so Lambda marks this specific record as failed
        // SQS will retry it up to the configured maxReceiveCount before sending to DLQ
        console.error(`Failed to process message type="${type}" for ${userEmail}:`, err);
        throw err;
      }
    })
  );

  // Log any individual failures without crashing the whole batch
  results.forEach((result, i) => {
    if (result.status === "rejected") {
      console.error(`Record[${i}] failed:`, result.reason);
    }
  });

  return { statusCode: 200, body: "Processed" };
};
