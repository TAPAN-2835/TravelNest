class FallbackEngine:
    @staticmethod
    def generate(destination: str, days: int, budget: int, augmented_data: dict) -> dict:
        """
        Deterministic fallback — used when the LLM fails completely.
        Returns the REAL data fetched, but leaving the itinerary daily breakdown empty,
        ensuring NO fake data is generated.
        """
        real_hotels = augmented_data.get("real_hotels", [])
        real_places = augmented_data.get("real_places", [])
        weather = augmented_data.get("live_context", {}).get("weather", {})

        return {
            "success": False,
            "data": {
                "destination": destination,
                "days": [],
                "hotels": real_hotels,
                "real_places": real_places,
                "real_hotels": real_hotels,
                "flights": [],
                "totalEstimatedCost": 0,
                "budget_summary": f"Could not generate itinerary. Provided real recommendations for {destination}.",
                "notes": f"Generated via offline fallback for {destination}. AI Generation failed after retries. Weather: {weather.get('condition', 'N/A')} {weather.get('temp', '')}."
            },
        }
