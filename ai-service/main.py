import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()

from agent.orchestrator import TravelAgent

app = FastAPI(title="TravelNest AI Service", version="2.0.0")

# Single shared agent instance (stateless, safe to reuse)
_agent = TravelAgent()


class ItineraryRequest(BaseModel):
    destination: str
    days: Optional[int] = 3
    budget: Optional[float] = 50000.0
    interests: Optional[List[str]] = ["sightseeing"]
    countryPreference: Optional[str] = "india-first"


@app.get("/health")
async def health():
    return {
        "success": True,
        "service": "TravelNest AI",
        "provider": os.getenv("LLM_PROVIDER", "groq"),
        "model": os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile"),
    }


@app.post("/generate")
@app.post("/plan-trip")
async def handle_generate_itinerary(request: ItineraryRequest):
    """
    Main trip-planning endpoint.
    Delegates to TravelAgent (orchestrator) which:
      1. Parses and validates inputs
      2. Fetches live weather (OpenWeatherMap) + places (OpenTripMap) async
      3. Merges with curated static dataset
      4. Calls Groq LLM to generate a structured itinerary
      5. Falls back to FallbackEngine on any LLM error
    """
    if not request.destination or not request.destination.strip():
        raise HTTPException(status_code=400, detail="destination is required")

    if request.budget is not None and request.budget < 0:
        raise HTTPException(status_code=400, detail="budget cannot be negative")

    try:
        result = await _agent.plan_trip(
            destination=request.destination.strip(),
            days=request.days,
            budget=request.budget,
            interests=request.interests,
        )
        return result

    except Exception as e:
        print(f"CRITICAL ERROR in /plan-trip: {e}")
        raise HTTPException(
            status_code=500,
            detail={"success": False, "error": str(e)},
        )


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
