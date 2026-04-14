const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

async function testPlaceImage(placeName) {
  console.log(`\n--- Testing image for: ${placeName} ---`);
  if (!GOOGLE_PLACES_API_KEY) {
    console.error("ERROR: GOOGLE_PLACES_API_KEY is not set in .env");
    return;
  }

  try {
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
    const searchRes = await axios.get(searchUrl, {
      params: {
        input: placeName,
        inputtype: 'textquery',
        fields: 'photos,place_id',
        key: GOOGLE_PLACES_API_KEY,
      },
    });

    console.log("Search Response Status:", searchRes.status);
    console.log("Response Data:", JSON.stringify(searchRes.data, null, 2));
    
    const candidates = searchRes.data.candidates;
    if (!candidates || candidates.length === 0) {
      console.log("No candidates found for:", placeName);
      return;
    }

    if (!candidates[0].photos) {
      console.log("Candidate found but HAS NO PHOTOS:", candidates[0].place_id);
      return;
    }

    const photoReference = candidates[0].photos[0].photo_reference;
    const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
    
    console.log("SUCCESS! Photo URL snippet:", photoUrl.substring(0, 50) + "...");
  } catch (error) {
    console.error("AXIOS ERROR:", error.message);
    if (error.response) {
        console.error("Details:", error.response.data);
    }
  }
}

async function run() {
    await testPlaceImage("Hawa Mahal, Jaipur");
    await testPlaceImage("Jaipur, India");
}

run();
