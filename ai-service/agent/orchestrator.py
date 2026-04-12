import json
import asyncio
from .input_parser import InputParser
from .data_layer import HybridDataManager
from .ai_engine import AIEngine
from .fallback_engine import FallbackEngine
from .validator import Validator

USER_PROMPT_TEMPLATE = """
Destination: {destination}
Duration: {days} days
Total Budget Cap: ₹{budget}
Interests: {interests}

REAL-TIME CONTEXT:
- Weather: {weather}
- REAL Places & Attractions to use: {real_places}
- REAL Hotels to use: {real_hotels}

TASK: Create a highly detailed, day-by-day itinerary using ONLY the real places and hotels listed above.

OUTPUT EXACTLY THIS JSON FORMAT (no markdown, no extra keys):
{{
  "destination": "{destination}",
  "days": [
    {{
      "day": 1,
      "theme": "Arrival and City Introduction",
      "morning":   {{ "activity": "Describe exactly what to do, what to see, and HOW to get there (e.g. take a metro/cab). Be highly descriptive!...", "place": "...", "duration": "2h", "cost": 500 }},
      "afternoon": {{ "activity": "...", "place": "...", "duration": "3h", "cost": 1200 }},
      "evening":   {{ "activity": "...", "place": "...", "duration": "2h", "cost": 1500 }}
    }}
  ],
  "hotels": [
    {{ "name": "...", "location": "...", "price": "3500", "rating": 4.2 }}
  ],
  "flights": [
    {{
      "airline": "IndiGo",
      "price": "7500",
      "duration": "1h 45m",
      "stops": "Nonstop",
      "departure": "06:30 AM",
      "arrival": "08:15 AM",
      "travel_class": "Economy"
    }}
  ],
  "totalEstimatedCost": 0
}}

RULES:
- Generate exactly {days} day objects.
- You MUST use only provided real places and hotels.
- If data is not available, state "Not available".
- DO NOT invent locations or use generic hallucinated placeholder names.
- Ensure no repeated places across days. Each day must be unique.
- Set totalEstimatedCost strictly to the sum of all activities + hotels + flights, bounded reasonably by the Budget.
- All costs MUST be literal numbers without currency symbols (e.g. 500, not "₹500").
- For EVERY "activity", YOU MUST literally explain HOW to travel there (e.g. "Take a local train/cab to the destination") and what exactly to do there. Do NOT just say "Visit place". Give a 3-4 sentence detailed guide!
"""


class TravelAgent:
    def __init__(self):
        self.data_manager = HybridDataManager()
        self.ai_engine = AIEngine()

    async def plan_trip(self, destination: str, days: any, budget: any, interests: list = None):
        # 1. Input Parsing & Validation
        dest, days_count, budget_val, clean_interests = InputParser.parse(
            destination, days, budget, interests
        )

        # 2. Parallel async data fetch (weather + live places + real hotels)
        augmented_data = await self.data_manager.get_augmented_context(dest, clean_interests)

        # 3. Build prompt
        prompt = USER_PROMPT_TEMPLATE.format(
            destination=dest,
            days=days_count,
            budget=budget_val,
            interests=", ".join(clean_interests),
            weather=json.dumps(augmented_data["live_context"]["weather"]),
            real_places=json.dumps(augmented_data["real_places"]),
            real_hotels=json.dumps(augmented_data["real_hotels"]),
        )

        # 4. LLM generation with Validation Retries
        try:
            itinerary_data = None
            max_retries = 3
            last_error = ""

            for attempt in range(max_retries):
                # Dynamically append feedback if retrying
                current_prompt = prompt if attempt == 0 else f"{prompt}\n\nERROR IN PREVIOUS ATTEMPT. FIX THIS: {last_error}"
                itinerary_data = await asyncio.to_thread(self.ai_engine.generate_trip, current_prompt)

                # ── Normalise response shape so frontend always gets the same keys ──
                if "days" not in itinerary_data and "itinerary" in itinerary_data:
                    itinerary_data["days"] = itinerary_data.pop("itinerary")

                if "flights" not in itinerary_data or not itinerary_data["flights"]:
                    itinerary_data["flights"] = _default_flights(dest)

                # Validate
                is_valid, validation_msg = Validator.validate_itinerary(
                    itinerary_data, 
                    augmented_data["real_places"], 
                    augmented_data["real_hotels"]
                )

                if is_valid:
                    break
                else:
                    print(f"Validation failed (Attempt {attempt+1}): {validation_msg}")
                    last_error = validation_msg
                    itinerary_data = None

            if not itinerary_data:
                raise Exception(f"Failed to generate valid itinerary after {max_retries} attempts.")

            # Ensure totalEstimatedCost is always a realistic number
            if not itinerary_data.get("totalEstimatedCost"):
                itinerary_data["totalEstimatedCost"] = _calc_cost(
                    itinerary_data.get("days", []), budget_val
                )
            
            # Inject raw data into response struct for Frontend rendering arrays
            itinerary_data["real_hotels"] = augmented_data["real_hotels"]
            itinerary_data["real_places"] = augmented_data["real_places"]

            return {
                "success": True,
                "data": itinerary_data,
            }

        except Exception as e:
            print(f"Orchestrator: LLM failed ({e}), using FallbackEngine")
            fallback = FallbackEngine.generate(dest, days_count, budget_val, augmented_data)
            fallback["data"]["flights"] = _default_flights(dest)
            fallback["data"]["totalEstimatedCost"] = budget_val * 0.75
            return fallback

# ── Helpers ───────────────────────────────────────────────────────────────────

def _default_flights(destination: str) -> list:
    """Return a sensible default flight pair when LLM doesn't generate one."""
    return [
        {
            "airline": "IndiGo",
            "price": "6500",
            "duration": "2h 00m",
            "stops": "Nonstop",
            "departure": "06:15 AM",
            "arrival": "08:15 AM",
            "travel_class": "Economy",
        }
    ]

def _calc_cost(days: list, budget: float) -> float:
    """Sum all slot costs across all days."""
    total = 0.0
    for day in days:
        for slot in ("morning", "afternoon", "evening"):
            try:
                total += float(day.get(slot, {}).get("cost", 0) or 0)
            except (TypeError, ValueError):
                pass
    return total if total > 0 else budget * 0.75
