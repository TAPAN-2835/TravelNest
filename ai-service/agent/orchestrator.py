import json
from .input_parser import InputParser
from .data_layer import HybridDataManager
from .ai_engine import AIEngine
from .fallback_engine import FallbackEngine

USER_PROMPT_TEMPLATE = """
Destination: {destination}
Duration: {days} days
Total Budget Cap: ₹{budget}
Interests: {interests}

REAL-TIME CONTEXT:
- Weather: {weather}
- Live Trending Spots: {live_places}
- Static Attractions: {attractions}
- Static Hotels: {hotels}

TASK: Combine these into a logical daily itinerary. 

OUTPUT EXACTLY THIS JSON FORMAT:
{{
  "destination": "{destination}",
  "days": [
    {{
      "day": 1,
      "theme": "...",
      "morning": {{ "activity": "...", "place": "...", "duration": "...", "cost": 0 }},
      "afternoon": {{ "activity": "...", "place": "...", "duration": "...", "cost": 0 }},
      "evening": {{ "activity": "...", "place": "...", "duration": "...", "cost": 0 }}
    }}
  ],
  "hotels": [{{ "name": "...", "area": "...", "price_range": "..." }}],
  "weather": {weather},
  "budget_summary": "Estimated cost within ₹{budget}",
  "notes": "..."
}}
"""

class TravelAgent:
    def __init__(self):
        self.data_manager = HybridDataManager()
        self.ai_engine = AIEngine()

    async def plan_trip(self, destination: str, days: any, budget: any, interests: list = None):
        # 1. Modular Input Parsing
        dest, days_count, budget_val, clean_interests = InputParser.parse(destination, days, budget, interests)
        
        # 2. Async Data Fetching
        augmented_data = await self.data_manager.get_augmented_context(dest, clean_interests)
        
        # 3. Prompt Injection
        prompt = USER_PROMPT_TEMPLATE.format(
            destination=dest,
            days=days_count,
            budget=budget_val,
            interests=", ".join(clean_interests),
            weather=json.dumps(augmented_data["live_context"]["weather"]),
            live_places=json.dumps(augmented_data["live_context"]["trending_places"]),
            attractions=json.dumps(augmented_data["static_attractions"]),
            hotels=json.dumps(augmented_data["static_hotels"])
        )
        
        # 4. LLM Generation + Safety Fallback
        try:
            itinerary_data = self.ai_engine.generate_trip(prompt)
            
            # Map legacy backend structures just in case
            if "days" not in itinerary_data and "itinerary" in itinerary_data:
                itinerary_data["days"] = itinerary_data.pop("itinerary")
            if "totalEstimatedCost" not in itinerary_data and "budget_summary" in itinerary_data:
                 itinerary_data["totalEstimatedCost"] = budget_val  # Pass hard number for UI formatCurrency

            return {
                "success": True,
                "data": itinerary_data
            }
        except Exception as e:
            print(f"Orchestrator fallback triggered: {e}")
            return FallbackEngine.generate(dest, days_count, budget_val, augmented_data)
