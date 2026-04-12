/**
 * TravelNest - Lambda Notification Handler
 * Trigger: SQS Queue (travelnest-notifications)
 * Runtime: Node.js 20.x
 * Handler: notificationHandler.handler
 */

const { SESClient, SendEmailCommand } = require("@aws-sdk/client-ses");

const ses = new SESClient({ region: process.env.AWS_REGION || "ap-south-1" });
const FROM = process.env.AWS_SES_FROM_EMAIL || "noreply@travelnest.com";

// ─── Send Email ─────────────────────────────────────────────────────────────

async function sendEmail(to, subject, message) {
  const command = new SendEmailCommand({
    Source: FROM,
    Destination: { ToAddresses: [to] },
    Message: {
      Subject: { Data: subject },
      Body: { Text: { Data: message } },
    },
  });

  const result = await ses.send(command);
  console.log(`[SES] Email sent to ${to} | MessageId: ${result.MessageId}`);
  return result;
}

// ─── Lambda Handler ──────────────────────────────────────────────────────────

exports.handler = async (event) => {
  console.log("[Lambda] Received SQS event:", JSON.stringify(event, null, 2));
  console.log(`[Lambda] Processing ${event.Records.length} record(s)`);

  // Process each SQS record independently so one failure doesn't block others
  const results = await Promise.allSettled(
    event.Records.map(async (record) => {
      // 1. Parse
      let body;
      try {
        body = JSON.parse(record.body);
      } catch (err) {
        console.error("[Lambda] Failed to parse message body:", record.body);
        return; // Skip malformed messages (don't retry)
      }

      const { type, to, subject, message } = body;

      console.log(`[Lambda] type=${type} | to=${to} | subject=${subject}`);

      // 2. Validate required fields
      if (!to || !subject || !message) {
        console.error("[Lambda] Missing required fields. Skipping.", body);
        return;
      }

      // 3. Route by type (extensible for future types)
      if (type === "EMAIL") {
        await sendEmail(to, subject, message);
      } else {
        console.warn(`[Lambda] Unknown type "${type}". Skipping.`);
      }
    })
  );

  // Report failures (SQS will retry records that throw)
  results.forEach((r, i) => {
    if (r.status === "rejected") {
      console.error(`[Lambda] Record[${i}] FAILED:`, r.reason);
      throw r.reason; // Re-throw to trigger SQS retry for this record
    }
  });

  return { statusCode: 200, body: "OK" };
};
