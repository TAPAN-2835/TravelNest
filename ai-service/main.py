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
    days: int
    budget: float
    interests: List[str]
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
    {prompt_prefix}
    Create a detailed {req.days}-day travel itinerary for {req.destination}.
    Budget: {req.budget}
    Interests: {', '.join(req.interests)}
    
    Return a JSON object with this exact structure:
    {{
      "days": [
        {{ "day": 1, "activities": ["activity 1", "activity 2"], "theme": "...", "morning": {{...}}, "afternoon": {{...}}, "evening": {{...}}, "accommodation": {{...}}, "dailyCost": 0, "tips": [] }}
      ],
      "totalEstimatedCost": 0,
      "currency": "INR",
      "travelTips": [],
      "packingList": [],
      "emergencyContacts": []
    }}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[{"role": "user", "content": prompt}],
            response_format={ "type": "json_object" }
        )
        raw = response.choices[0].message.content
        result = json.loads(raw) if isinstance(raw, str) else raw
        if "days" not in result or not isinstance(result["days"], list):
            raise HTTPException(
                status_code=500, 
                detail="AI returned invalid itinerary structure"
            )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

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
    uvicorn.run(app, host="0.0.0.0", port=8001)
