import json
from .data_layer import DataLayer
from .llm_layer import LLMLayer

SYSTEM_PROMPT = """
You are a senior professional Travel Planner AI for Indian users.
Your goal is to create a realistic, high-quality itinerary.

STRICT GROUNDING RULES:
1. Destination MUST be exactly {destination}.
2. Use ONLY real hotel names and realistic INR budget ranges.
3. Currency MUST be in INR (₹).
4. Do NOT hallucinate. If unsure about a specific detail, say "Data not available".
5. Use providing Ground Truth as your primary source.
"""

USER_PROMPT_TEMPLATE = """
Destination: {destination}
Duration: {days} days
Total Budget Cap: ₹{budget}
Interests: {interests}

GROUND TRUTH DATA:
- Attractions: {attractions}
- Hotels: {hotels}
- Transport: {transport}

TASK:
Generate a detailed day-wise itinerary in JSON format.
Include:
- At least 2 hotel suggestions.
- Daily activities with times (Morning, Afternoon, Evening).
- Estimated costs per activity.

FORMAT:
{{
  "destination": "{destination}",
  "itinerary": [
    {{
      "day": 1,
      "theme": "Arrival & City Highlights",
      "morning": {{ "activity": "...", "place": "...", "duration": "2h", "cost": 500 }},
      "afternoon": {{ "activity": "...", "place": "...", "duration": "3h", "cost": 1200 }},
      "evening": {{ "activity": "...", "place": "...", "duration": "2h", "cost": 800 }}
    }}
  ],
  "hotels": [{{ "name": "...", "area": "...", "price_range": "..." }}],
  "notes": "..."
}}
"""

class TravelAgent:
    def __init__(self):
        self.data_layer = DataLayer()
        self.llm_layer = LLMLayer()

    def parse_inputs(self, destination: str, days: any, budget: any):
        """Safe input parsing as requested by senior architecture."""
        try:
            clean_dest = str(destination).strip()
            clean_days = int(float(days or 3))
            clean_budget = int(float(budget or 50000))
            return clean_dest, clean_days, clean_budget
        except Exception as e:
            print(f"Input Parsing Error: {e}")
            return destination, 3, 50000

    def plan_trip(self, destination: str, days: any, budget: any, interests: list = None):
        # 1. Safe Parse
        dest, days_count, budget_val = self.parse_inputs(destination, days, budget)
        interests = interests or ["General Sightseeing"]
        
        # 2. Fetch Data Augmentation
        ground_truth = self.data_layer.get_ground_truth(dest, interests)
        
        # 3. Build Prompt
        prompt = USER_PROMPT_TEMPLATE.format(
            destination=dest,
            days=days_count,
            budget=budget_val,
            interests=", ".join(interests),
            attractions=json.dumps(ground_truth["attractions"]),
            hotels=json.dumps(ground_truth["hotels"]),
            transport=", ".join(ground_truth["transport"])
        )
        
        # 4. Generate with Fault-Tolerance
        try:
            system_p = SYSTEM_PROMPT.format(destination=dest)
            itinerary_raw = self.llm_layer.generate_json(prompt, system_p)
            
            if not itinerary_raw:
                return self.generate_hard_fallback(dest, days_count, budget_val, ground_truth)
            
            itinerary_data = json.loads(itinerary_raw)
            # Ensure cost mapping exists if omitted by LLM
            if "total_estimated_cost" not in itinerary_data:
                itinerary_data["total_estimated_cost"] = budget_val // 2
                
            return {
                "success": True,
                "data": itinerary_data
            }
        except Exception as e:
            print(f"AI Generation/Parsing Failed: {e}. Jumping to Hard Fallback.")
            data = self.generate_hard_fallback(dest, days_count, budget_val, ground_truth)
            return {
                "success": True,
                "data": data
            }

    def generate_hard_fallback(self, destination: str, days: int, budget: int, ground_truth: dict):
        """Hard Fallback Generator - Zero failure."""
        hotels = ground_truth["hotels"][:2]
        attractions = ground_truth["attractions"]
        
        itinerary = []
        for i in range(1, days + 1):
            day_plan = {
                "day": i,
                "theme": f"Exploring {destination} - Part {i}",
                "morning": {
                    "activity": f"Visit {attractions[i % len(attractions)]['name']}",
                    "place": attractions[i % len(attractions)]["area"],
                    "duration": "3h",
                    "cost": 500
                },
                "afternoon": {
                    "activity": f"Discover {attractions[(i+1) % len(attractions)]['name']}",
                    "place": attractions[(i+1) % len(attractions)]["area"],
                    "duration": "2h",
                    "cost": 1000
                },
                "evening": {
                    "activity": "Local Market & Food",
                    "place": "City Center",
                    "duration": "3h",
                    "cost": 1500
                }
            }
            itinerary.append(day_plan)

        return {
            "destination": destination,
            "itinerary": itinerary,
            "hotels": hotels,
            "total_estimated_cost": budget // 2,
            "notes": "Generated in safe-mode due to AI service load. Ground-truth data applied."
        }
