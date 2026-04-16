"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.planTrip = void 0;
const axios_1 = __importDefault(require("axios"));
const google_places_utils_1 = require("../../shared/utils/google-places.utils");
const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';
const planTrip = async (req, res, next) => {
    try {
        const { destination, budget, days, interests, preferences, countryPreference } = req.body;
        if (!destination || String(destination).trim() === '') {
            return res.status(400).json({ success: false, message: 'Destination is required' });
        }
        if (budget !== undefined && Number(budget) < 0) {
            return res.status(400).json({ success: false, message: 'Budget cannot be negative' });
        }
        // Call Python FastAPI service with a generous timeout for AI processing
        const response = await axios_1.default.post(`${AI_SERVICE_URL}/plan-trip`, {
            destination: String(destination).trim(),
            budget: Number(budget) || 50000,
            days: Number(days) || 3,
            interests: Array.isArray(interests) ? interests : (Array.isArray(preferences) ? preferences : ["sightseeing"]),
            countryPreference: countryPreference || "india-first"
        }, { timeout: 120000 } // 2 minutes — AI generation takes time
        );
        // FastAPI returns { success: true, data: { ... } }
        // Axios wraps in response.data, so the payload is response.data.data
        const payload = response.data;
        const aiData = payload.data ?? payload; // handle both wrapped and unwrapped
        // Enrichment: Fetch images for the generated itinerary
        const placeImages = await (0, google_places_utils_1.enrichItineraryData)(aiData);
        const gallery = await (0, google_places_utils_1.getItineraryGallery)(String(destination), aiData);
        aiData.placeImages = placeImages;
        aiData.gallery = gallery;
        return res.status(200).json({
            success: true,
            data: aiData
        });
    }
    catch (error) {
        const detail = error.response?.data?.detail || error.response?.data || error.message;
        console.error('Error planning trip via proxy:', detail);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Failed to generate itinerary with AI',
            error: typeof detail === 'string' ? detail : JSON.stringify(detail)
        });
    }
};
exports.planTrip = planTrip;
//# sourceMappingURL=ai.controller.js.map