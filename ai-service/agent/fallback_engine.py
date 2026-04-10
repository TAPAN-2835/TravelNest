class FallbackEngine:
    @staticmethod
    def generate(destination: str, days: int, budget: int, augmented_data: dict) -> dict:
        hotels = augmented_data["static_hotels"][:2]
        attractions = augmented_data["static_attractions"]
        weather = augmented_data.get("live_context", {}).get("weather", {})
        
        days_plan = []
        for i in range(1, days + 1):
            attr = attractions[i % len(attractions)] if attractions else {"name": "Local Tour", "area": "City"}
            day_plan = {
                "day": i,
                "theme": f"Exploring {destination} - Day {i}",
                "morning": {
                    "activity": f"Visit {attr['name']}",
                    "place": attr.get("area", "Central"),
                    "duration": "3h",
                    "cost": 500
                },
                "afternoon": {
                    "activity": "Lunch and Relax",
                    "place": "City Hub",
                    "duration": "2h",
                    "cost": 800
                },
                "evening": {
                    "activity": "Scenic Walk",
                    "place": "Observation Point",
                    "duration": "2h",
                    "cost": 300
                }
            }
            days_plan.append(day_plan)

        return {
            "success": True,
            "data": {
                "destination": destination,
                "days": days_plan,
                "hotels": hotels,
                "weather": weather,
                "budget_summary": f"Estimated: INR {budget // 2}",
                "notes": f"Generated via secure fallback offline mode. Weather context: {weather.get('condition')}."
            }
        }
