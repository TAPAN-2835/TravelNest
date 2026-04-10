import os
import json
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()

app = FastAPI(title="TravelNest AI Service")
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

class ItineraryRequest(BaseModel):
    destination: str
    days: Optional[int] = 3
    budget: Optional[float] = 50000.0
    interests: Optional[List[str]] = ["sightseeing"]
    countryPreference: Optional[str] = "international"

class SentimentRequest(BaseModel):
    text: str

@app.get("/health")
async def health():
    return {"status": "ok", "service": "TravelNest AI"}

@app.post("/generate")
async def generate_itinerary(req: ItineraryRequest):
    # INDIA-FIRST LOGIC
    prompt_prefix = ""
    if req.countryPreference == "india-first":
        prompt_prefix = "CRITICAL: Prioritize Indian destinations (Goa, Manali, Jaipur, Udaipur, Kerala, Rishikesh) unless the user explicitly requested a foreign location."

    prompt = f"""
    You are a professional Indian travel consultant. Create a luxury, realistic {req.days}-day travel itinerary for {req.destination}.
    
    CRITICAL INSTRUCTIONS:
    1. PRIORITIZE Indian market context. If the destination is in India, use real, high-rated Indian hotels (e.g., Taj, Oberoi, ITC, or Hyatt).
    2. CURRENCY: All costs MUST be in INR (₹).
    3. REALISM: Use real landmarks and popular tourist activities. Avoid generic placeholders.
    4. FORMAT: Return a valid JSON object.
    
    Requested Budget: ₹{req.budget} (INR)
    Interests: {', '.join(req.interests)}
    
    The JSON structure must be:
    {{
      "days": [
        {{ 
          "day": 1, 
          "theme": "Arrival & Heritage", 
          "morning": {{ "activity": "Visit Landmark", "place": "Actual Landmark Name", "duration": "3h", "cost": 500, "description": "Short description", "mapLink": "" }},
          "afternoon": {{ "activity": "Lunch at Iconic Spot", "place": "Famous Restaurant Name", "duration": "1.5h", "cost": 1200, "description": "Short description", "mapLink": "" }},
          "evening": {{ "activity": "Sunset Walk", "place": "Specific Area", "duration": "2h", "cost": 0, "description": "Short description", "mapLink": "" }},
          "accommodation": {{ "name": "Real Hotel Name", "type": "Luxury/Boutique", "cost": 8000, "location": "Specific Area" }},
          "dailyCost": 9700,
          "tips": ["Tip 1", "Tip 2"]
        }}
      ],
      "totalEstimatedCost": 25000,
      "currency": "INR",
      "travelTips": ["Tip A", "Tip B"],
      "packingList": ["Item 1", "Item 2"],
      "emergencyContacts": ["Police: 100", "Ambulance: 102"]
    }}
    """

    mock_fallback = {
        "days": [
            {
                "day": 1,
                "theme": "Arrival & City Highlights",
                "morning": {"activity": "Hotel Check-in & Rest", "place": req.destination, "duration": "2h", "cost": 0, "description": "Relax after your journey.", "mapLink": ""},
                "afternoon": {"activity": "Main Square Exploration", "place": f"{req.destination} Center", "duration": "3h", "cost": 500, "description": "Walking tour of the historic district.", "mapLink": ""},
                "evening": {"activity": "Welcome Dinner", "place": "Local Traditional Restaurant", "duration": "2h", "cost": 1500, "description": "Enjoy local specialties.", "mapLink": ""},
                "accommodation": {"name": "TravelNest Recommended Stay", "type": "Hotel", "cost": 4500, "location": req.destination},
                "dailyCost": 6500,
                "tips": ["Carry local currency", "Comfortable walking shoes"]
            },
            {
                "day": 2,
                "theme": "Culture & Landmarks",
                "morning": {"activity": "Museum/Palace Visit", "place": "National Museum", "duration": "3h", "cost": 1000, "description": "Dive into the local history.", "mapLink": ""},
                "afternoon": {"activity": "Local Market Experience", "place": "Central Market", "duration": "2h", "cost": 300, "description": "Souvenir shopping and street food.", "mapLink": ""},
                "evening": {"activity": "Sunset View & Drinks", "place": "Rooftop Garden", "duration": "2h", "cost": 1200, "description": "Beautiful views of the skyline.", "mapLink": ""},
                "accommodation": {"name": "TravelNest Recommended Stay", "type": "Hotel", "cost": 4500, "location": req.destination},
                "dailyCost": 7500,
                "tips": ["Book tickets in advance", "Use public transport"]
            }
        ],
        "totalEstimatedCost": 14000,
        "currency": "INR",
        "travelTips": ["Always stay hydrated", "Respect local customs"],
        "packingList": ["Sunscreen", "Power bank", "Universal adapter"],
        "emergencyContacts": ["Local Police: 100", "Ambulance: 102"]
    }

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        raw = response.choices[0].message.content
        result = json.loads(raw) if isinstance(raw, str) else raw
        if "days" not in result or not isinstance(result["days"], list):
            return mock_fallback
        return result
    except Exception as e:
        print(f"AI Error (Quota likely exceeded): {str(e)}")
        return mock_fallback

@app.post("/analyze-sentiment")
async def analyze_sentiment(req: SentimentRequest):
    prompt = f"Analyze the sentiment of this travel review: \"{req.text}\". Return JSON: {{\"sentiment\": \"POSITIVE|NEUTRAL|NEGATIVE\", \"score\": 0.0-1.0}}"
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        import json
        raw = response.choices[0].message.content
        result = json.loads(raw) if isinstance(raw, str) else raw
        if "sentiment" not in result:
            result = {"sentiment": "NEUTRAL", "score": 0.5, "keywords": []}
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
