import axios from 'axios';
import logger from './logger';

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

/**
 * Fetches a representative image URL for a given place name using Google Places API.
 * Follows the redirect to store the permanent CDN URL instead of the expiring redirect.
 */
export async function getPlaceImage(placeName: string): Promise<string | null> {
  if (!GOOGLE_PLACES_API_KEY || !placeName) return null;

  try {
    // Step 1: Find place and get photo reference
    const searchRes = await axios.get(
      `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`,
      {
        params: {
          input: placeName,
          inputtype: 'textquery',
          fields: 'photos,place_id',
          key: GOOGLE_PLACES_API_KEY,
        },
        timeout: 8000,
      }
    );

    const candidates = searchRes.data.candidates;
    if (!candidates || candidates.length === 0 || !candidates[0].photos) {
      return null;
    }

    const photoReference = candidates[0].photos[0].photo_reference;
    const photoApiUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${encodeURIComponent(photoReference)}&key=${GOOGLE_PLACES_API_KEY}`;

    // Step 2: Follow the redirect to capture the actual permanent CDN URL
    // Google returns 302 → actual image URL. We intercept the Location header.
    try {
      const photoRes = await axios.get(photoApiUrl, {
        maxRedirects: 0,
        validateStatus: (status) => status >= 200 && status < 400,
        timeout: 6000,
      });

      const finalUrl = (photoRes.request as any)?.res?.responseUrl || photoRes.headers?.location;
      if (finalUrl && finalUrl.startsWith('http')) {
        return finalUrl;
      }
    } catch (redirectErr: any) {
      // axios throws on redirect when maxRedirects:0; capture the Location header
      const location = redirectErr?.response?.headers?.location;
      if (location && location.startsWith('http')) {
        return location;
      }
    }

    // Fallback: return the photo API URL (at least it will work until reference expires)
    return photoApiUrl;
  } catch (error: any) {
    logger.error(`Error fetching place image for ${placeName}:`, error.message);
    return null;
  }
}

/**
 * Generates a reliable Unsplash search URL for a place name as fallback.
 */
function unsplashFallback(name: string): string {
  const query = encodeURIComponent(name.split(',')[0].trim());
  return `https://source.unsplash.com/800x600/?${query},travel,landmark`;
}

/**
 * Fetches a gallery of images for a destination and its landmarks.
 * Returns an array of { name: string, url: string }
 */
export async function getItineraryGallery(destination: string, itineraryData: any): Promise<Array<{name: string, url: string}>> {
  const gallery: Array<{name: string, url: string}> = [];
  const placesToFetch = new Set<string>();

  // Use the destination as the first image
  placesToFetch.add(destination);

  // Pick unique places from the itinerary (up to 5 more)
  if (itineraryData?.days) {
    itineraryData.days.forEach((day: any) => {
      ['morning', 'afternoon', 'evening'].forEach(slot => {
        if (day[slot]?.place && placesToFetch.size < 6) {
          placesToFetch.add(day[slot].place);
        }
      });
    });
  }

  // Fetch in parallel with fallback
  const fetchPromises = Array.from(placesToFetch).map(async (name) => {
    const url = await getPlaceImage(name);
    // Use Unsplash as fallback if Google fails — much better than static map image
    return { name, url: url || unsplashFallback(name) };
  });

  const results = await Promise.all(fetchPromises);
  results.forEach(res => gallery.push(res));

  // Return at most 4 high-quality results
  return gallery.slice(0, 4);
}

/**
 * Legacy support / Combined helper
 */
export async function enrichItineraryData(itineraryData: any): Promise<Record<string, string>> {
  const gallery = await getItineraryGallery(itineraryData.destination || "", itineraryData);
  const mapping: Record<string, string> = {};
  gallery.forEach(item => {
    mapping[item.name] = item.url;
  });
  return mapping;
}
