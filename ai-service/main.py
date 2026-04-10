import os
from typing import List, Optional
from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from dotenv import load_dotenv
from agent.orchestrator import TravelAgent

load_dotenv()

app = FastAPI(title="TravelNest AI Service")
agent = TravelAgent()

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
        "provider": os.getenv("LLM_PROVIDER", "groq")
    }

@app.post("/generate")
async def generate_itinerary(request: ItineraryRequest):
    """
    Main entry point for generating itineraries.
    Includes comprehensive error handling and safe fallbacks.
    """
    try:
        result = agent.plan_trip(
            destination=request.destination,
            days=request.days,
            budget=request.budget,
            interests=request.interests
        )
        return result  # Already follows {"success": True, "data": {...}}
        
    except Exception as e:
        print(f"CRITICAL ERROR: {e}")
        # Final safety net returns 500 with clear message
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
