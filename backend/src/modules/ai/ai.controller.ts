import { Request, Response, NextFunction } from 'express';
import axios from 'axios';
import { enrichItineraryData, getItineraryGallery } from '../../shared/utils/google-places.utils';



const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const planTrip = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { destination, budget, days, interests, preferences, countryPreference } = req.body;

        if (!destination || String(destination).trim() === '') {
            return res.status(400).json({ success: false, message: 'Destination is required' });
        }

        if (budget !== undefined && Number(budget) < 0) {
            return res.status(400).json({ success: false, message: 'Budget cannot be negative' });
        }

        // Call Python FastAPI service with a generous timeout for AI processing
        const response = await axios.post(
            `${AI_SERVICE_URL}/plan-trip`,
            {
                destination: String(destination).trim(),
                budget: Number(budget) || 50000,
                days: Number(days) || 3,
                interests: Array.isArray(interests) ? interests : (Array.isArray(preferences) ? preferences : ["sightseeing"]),
                countryPreference: countryPreference || "india-first"
            },
            { timeout: 120000 } // 2 minutes — AI generation takes time
        );

        // FastAPI returns { success: true, data: { ... } }
        // Axios wraps in response.data, so the payload is response.data.data
        const payload = response.data;
        const aiData = payload.data ?? payload; // handle both wrapped and unwrapped

        // Enrichment: Fetch images for the generated itinerary
        const placeImages = await enrichItineraryData(aiData);
        const gallery = await getItineraryGallery(String(destination), aiData);
        aiData.placeImages = placeImages;
        aiData.gallery = gallery;


        return res.status(200).json({
            success: true,
            data: aiData
        });
    } catch (error: any) {
        const detail = error.response?.data?.detail || error.response?.data || error.message;
        console.error('Error planning trip via proxy:', detail);
        return res.status(error.response?.status || 500).json({
            success: false,
            message: 'Failed to generate itinerary with AI',
            error: typeof detail === 'string' ? detail : JSON.stringify(detail)
        });
    }
};
