"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlaceImage = getPlaceImage;
exports.getItineraryGallery = getItineraryGallery;
exports.enrichItineraryData = enrichItineraryData;
const axios_1 = __importDefault(require("axios"));
const logger_1 = __importDefault(require("./logger"));
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;
/**
 * Fetches a representative image URL for a given place name using Google Places API.
 */
async function getPlaceImage(placeName) {
    if (!GOOGLE_PLACES_API_KEY || !placeName)
        return null;
    try {
        const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json`;
        const searchRes = await axios_1.default.get(searchUrl, {
            params: {
                input: placeName,
                inputtype: 'textquery',
                fields: 'photos,place_id',
                key: GOOGLE_PLACES_API_KEY,
            },
        });
        const candidates = searchRes.data.candidates;
        if (!candidates || candidates.length === 0 || !candidates[0].photos) {
            return null;
        }
        const photoReference = encodeURIComponent(candidates[0].photos[0].photo_reference);
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photoreference=${photoReference}&key=${GOOGLE_PLACES_API_KEY}`;
        return photoUrl;
    }
    catch (error) {
        logger_1.default.error(`Error fetching place image for ${placeName}:`, error.message);
        return null;
    }
}
/**
 * Fetches a gallery of images for a destination and its landmarks.
 * Returns an array of { name: string, url: string }
 */
async function getItineraryGallery(destination, itineraryData) {
    const gallery = [];
    const placesToFetch = new Set();
    // Use the destination as the first image
    placesToFetch.add(destination);
    // Pick 3-4 unique places from the itinerary
    if (itineraryData?.days) {
        itineraryData.days.forEach((day) => {
            ['morning', 'afternoon', 'evening'].forEach(slot => {
                if (day[slot]?.place && placesToFetch.size < 6) {
                    placesToFetch.add(day[slot].place);
                }
            });
        });
    }
    // Fetch in parallel
    const fetchPromises = Array.from(placesToFetch).map(async (name) => {
        const url = await getPlaceImage(name);
        return url ? { name, url } : null;
    });
    const results = await Promise.all(fetchPromises);
    results.forEach(res => {
        if (res)
            gallery.push(res);
    });
    // Return at most 4 high-quality results
    return gallery.slice(0, 4);
}
/**
 * Legacy support / Combined helper
 */
async function enrichItineraryData(itineraryData) {
    const gallery = await getItineraryGallery(itineraryData.destination || "", itineraryData);
    const mapping = {};
    gallery.forEach(item => {
        mapping[item.name] = item.url;
    });
    return mapping;
}
//# sourceMappingURL=google-places.utils.js.map