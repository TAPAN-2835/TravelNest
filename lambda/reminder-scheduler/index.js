const { SESClient, SendEmailCommand } = require('@aws-sdk/client-ses');
const { Client } = require('pg');

const ses = new SESClient({ region: process.env.AWS_REGION || 'us-east-1' });
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

exports.handler = async (event) => {
  const client = new Client(dbConfig);
  await client.connect();

  console.log('Fetching upcoming trips for reminders...');

  try {
    // Current time + 24 hours
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);

    const query = `
      SELECT t.id, t.title, u.email, u.name, d.name as destination
      FROM "Trip" t
      JOIN "User" u ON t."userId" = u.id
      JOIN "Destination" d ON t."destinationId" = d.id
      WHERE t."startDate" >= $1 AND t."startDate" < $2
      AND t.status != 'CANCELLED'
    `;

    const { rows: trips } = await client.query(query, [new Date(), tomorrow]);

    for (const trip of trips) {
      console.log(`Sending reminder to ${trip.email} for trip ${trip.id}`);
      
      const emailParams = {
        Source: process.env.SES_SENDER_EMAIL,
        Destination: { ToAddresses: [trip.email] },
        Message: {
          Subject: { Data: `Pack your bags! Your trip to ${trip.destination} is coming up!` },
          Body: {
            Html: { Data: `<h1>Hi ${trip.name},</h1><p>Your trip <b>${trip.title}</b> starts tomorrow!</p><p>Check your itinerary at TravelNest. Safe travels!</p>` }
          }
        }
      };

      await ses.send(new SendEmailCommand(emailParams));
    }

    console.log(`Successfully sent ${trips.length} reminders.`);
  } catch (error) {
    console.error('Error sending trip reminders:', error);
    throw error;
  } finally {
    await client.end();
  }

  return { statusCode: 200 };
};
