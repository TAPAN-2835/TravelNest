import { Request, Response, NextFunction } from 'express';
import axios from 'axios';

const AI_SERVICE_URL = process.env.AI_SERVICE_URL || 'http://localhost:8000';

export const planTrip = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { destination, budget, days, preferences, countryPreference } = req.body;

        if (!destination) {
            return res.status(400).json({ success: false, message: 'Destination is required' });
        }

        // Call Python FastAPI service (Agentic Trip integration)
        const response = await axios.post(`${AI_SERVICE_URL}/plan-trip`, {
            destination,
            budget: budget || 50000,
            days: days || 3,
            interests: preferences || ["sightseeing"],
            countryPreference: countryPreference || "india-first"
        });

        const aiData = response.data.data;

        return res.status(200).json({
            success: true,
            data: aiData
        });
    } catch (error: any) {
        console.error('Error planning trip via proxy:', error.message);
        return res.status(500).json({
            success: false,
            message: 'Failed to generate itinerary with AI',
            error: error.message
        });
    }
};
