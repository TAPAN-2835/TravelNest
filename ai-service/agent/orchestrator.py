import json
import asyncio
from .data_layer import HybridDataManager
from .llm_layer import LLMLayer

SYSTEM_PROMPT = """
You are a senior professional Hybrid Travel Agent for TravelNest.
Your goal is to create a realistic itinerary grounded in both static data and real-time context.

STRICT GROUNDING RULES:
1. Destination MUST be exactly {destination}.
2. Use the provided REAL-TIME WEATHER to suggest appropriate timing (e.g., if raining, suggest indoor activities).
3. Use ONLY real hotel names and realistic INR budget ranges.
4. Currency MUST be in INR (₹).
5. Do NOT hallucinate. Use the provided static attractions and live trending spots.
"""

USER_PROMPT_TEMPLATE = """
Destination: {destination}
Duration: {days} days
Total Budget Cap: ₹{budget}
Interests: {interests}

REAL-TIME CONTEXT:
- Weather: {weather}
- Live Trending Spots: {live_places}

STATIC GROUND TRUTH:
- Pre-curated Attractions: {attractions}
- Pre-curated Hotels: {hotels}
- Transport: {transport}

TASK:
Generate a detailed day-wise itinerary in JSON format.
Ensure the 'notes' section mentions how the weather influenced the plan.

FORMAT:
{{
  "destination": "{destination}",
  "itinerary": [
    {{
      "day": 1,
      "theme": "...",
      "morning": {{ "activity": "...", "place": "...", "duration": "...", "cost": 0 }},
      "afternoon": {{ "activity": "...", "place": "...", "duration": "...", "cost": 0 }},
      "evening": {{ "activity": "...", "place": "...", "duration": "...", "cost": 0 }}
    }}
  ],
  "hotels": [{{ "name": "...", "area": "...", "price_range": "..." }}],
  "total_estimated_cost": 0,
  "notes": "..."
}}
"""

class TravelAgent:
    def __init__(self):
        self.data_manager = HybridDataManager()
        self.llm_layer = LLMLayer()

    def parse_inputs(self, destination: str, days: any, budget: any):
        try:
            clean_dest = str(destination).strip()
            clean_days = int(float(days or 3))
            clean_budget = int(float(budget or 50000))
            return clean_dest, clean_days, clean_budget
        except Exception as e:
            print(f"Input Parsing Error: {e}")
            return destination, 3, 50000

    async def plan_trip(self, destination: str, days: any, budget: any, interests: list = None):
        # 1. Safe Parse
        dest, days_count, budget_val = self.parse_inputs(destination, days, budget)
        interests = interests or ["General Sightseeing"]
        
        # 2. Fetch Hybrid Augmented Context
        augmented_data = await self.data_manager.get_augmented_context(dest, interests)
        
        # 3. Build Prompt
        prompt = USER_PROMPT_TEMPLATE.format(
            destination=dest,
            days=days_count,
            budget=budget_val,
            interests=", ".join(interests),
            weather=json.dumps(augmented_data["live_context"]["weather"]),
            live_places=json.dumps(augmented_data["live_context"]["trending_places"]),
            attractions=json.dumps(augmented_data["static_attractions"]),
            hotels=json.dumps(augmented_data["static_hotels"]),
            transport=", ".join(augmented_data["transport"])
        )
        
        # 4. Generate with Fault-Tolerance
        try:
            system_p = SYSTEM_PROMPT.format(destination=dest)
            itinerary_raw = self.llm_layer.generate_json(prompt, system_p)
            
            if not itinerary_raw:
                return self.generate_hard_fallback(dest, days_count, budget_val, augmented_data)
            
            itinerary_data = json.loads(itinerary_raw)
            return {
                "success": True,
                "data": itinerary_data
            }
        except Exception as e:
            print(f"Hybrid AI Error: {e}")
            data = self.generate_hard_fallback(dest, days_count, budget_val, augmented_data)
            return {
                "success": True,
                "data": data
            }

    def generate_hard_fallback(self, destination: str, days: int, budget: int, augmented_data: dict):
        hotels = augmented_data["static_hotels"][:2]
        attractions = augmented_data["static_attractions"]
        weather_note = augmented_data["live_context"]["weather"].get("note", "Weather-aware plan.")
        
        itinerary = []
        for i in range(1, days + 1):
            day_plan = {
                "day": i,
                "theme": f"Exploring {destination}",
                "morning": {
                    "activity": f"Visit {attractions[i % len(attractions)]['name']}",
                    "place": attractions[i % len(attractions)]["area"],
                    "duration": "3h",
                    "cost": 500
                },
                "afternoon": {
                    "activity": "Lunch and Local Discovery",
                    "place": "City Hub",
                    "duration": "2h",
                    "cost": 800
                },
                "evening": {
                    "activity": "Scenic Viewpoint",
                    "place": "Observation Point",
                    "duration": "2h",
                    "cost": 300
                }
            }
            itinerary.append(day_plan)

        return {
            "destination": destination,
            "itinerary": itinerary,
            "hotels": hotels,
            "total_estimated_cost": budget // 2,
            "notes": f"Fallback mode active. {weather_note}"
        }
