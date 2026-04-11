import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
load_dotenv()

from agent.crew_planner import generate_trip_plan

app = FastAPI(title="TravelNest AI Service")

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
        "provider": os.getenv("LLM_PROVIDER", "openai")
    }

@app.post("/generate")
@app.post("/plan-trip")
async def handle_generate_itinerary(request: ItineraryRequest):
    """
    Main entry point for generating itineraries.
    Includes comprehensive error handling and safe fallbacks.
    """
    try:
        result = await generate_trip_plan(
            destination=request.destination,
            budget=request.budget,
            days=request.days,
            preferences=request.interests
        )
        return result
        
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        raise HTTPException(
            status_code=500, 
            detail={
                "success": False,
                "error": "Internal Server Error in AI Logic",
                "message": str(e)
            }
        )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
