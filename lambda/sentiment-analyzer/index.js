const { OpenAI } = require('openai');
const { Client } = require('pg');

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const dbConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
};

exports.handler = async (event) => {
  const client = new Client(dbConfig);
  await client.connect();

  for (const record of event.Records) {
    const { reviewId, text } = JSON.parse(record.body);
    console.log(`Processing review: ${reviewId}`);

    try {
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "user", content: `Analyze the sentiment of this travel review: "${text}". Return JSON: {"sentiment": "POSITIVE|NEUTRAL|NEGATIVE", "score": 0.0-1.0}` }],
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(response.choices[0].message.content);
      
      await client.query(
        'UPDATE "Review" SET sentiment = $1, "sentimentScore" = $2, status = $3 WHERE id = $4',
        [result.sentiment, result.score, 'COMPLETED', reviewId]
      );
      
      console.log(`Successfully processed review: ${reviewId}`);
    } catch (error) {
      console.error(`Error processing review ${reviewId}:`, error);
      await client.query('UPDATE "Review" SET status = $1 WHERE id = $2', ['FAILED', reviewId]);
    }
  }

  await client.end();
  return { statusCode: 200 };
};
