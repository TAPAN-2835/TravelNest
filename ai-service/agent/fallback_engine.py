class FallbackEngine:
    @staticmethod
    def generate(destination: str, days: int, budget: int, augmented_data: dict) -> dict:
        """
        Deterministic fallback — used when the LLM fails.
        Uses static attractions from augmented_data so content is still destination-specific.
        Returns the same shape as the LLM path so the frontend renders identically.
        """
        raw_hotels     = augmented_data.get("static_hotels", [])[:2]
        attractions    = augmented_data.get("static_attractions", [])
        weather        = augmented_data.get("live_context", {}).get("weather", {})
        per_day_budget = budget / max(days, 1)

        # Build day plans cycling through available attractions
        days_plan = []
        for i in range(1, days + 1):
            morning_attr   = attractions[(i - 1) % max(len(attractions), 1)] if attractions else {"name": f"Local Tour {i}", "area": "City"}
            afternoon_attr = attractions[i % max(len(attractions), 1)]       if attractions else {"name": "City Centre", "area": "Central"}

            days_plan.append({
                "day":   i,
                "theme": f"Day {i}: Exploring {destination}",
                "morning": {
                    "activity": f"Visit {morning_attr['name']}",
                    "place":    morning_attr.get("area", "Central"),
                    "duration": "3h",
                    "cost":     int(per_day_budget * 0.25),
                },
                "afternoon": {
                    "activity": f"Explore {afternoon_attr['name']}",
                    "place":    afternoon_attr.get("area", "City Hub"),
                    "duration": "3h",
                    "cost":     int(per_day_budget * 0.35),
                },
                "evening": {
                    "activity": "Dinner & Evening Stroll",
                    "place":    f"{destination} City Centre",
                    "duration": "2h",
                    "cost":     int(per_day_budget * 0.20),
                },
            })

        # Normalise hotels to the flat shape the frontend expects
        normalised_hotels = []
        for h in raw_hotels:
            price_range = h.get("price_range", "")
            try:
                price_num = price_range.replace("₹", "").replace(",", "").split("-")[0].strip()
            except Exception:
                price_num = "3000"
            normalised_hotels.append({
                "name":        h.get("name", "Hotel"),
                "price":       price_num,
                "rating":      h.get("rating", 4.0),
                "location":    h.get("area", "City Centre"),
                "link":        "#",
                "area":        h.get("area", ""),
                "price_range": price_range,
            })

        if not normalised_hotels:
            normalised_hotels = [{
                "name":     f"Hotel {destination}",
                "price":    str(int(per_day_budget * 0.4)),
                "rating":   4.0,
                "location": "City Centre",
                "link":     "#",
            }]

        total_cost = sum(
            d["morning"]["cost"] + d["afternoon"]["cost"] + d["evening"]["cost"]
            for d in days_plan
        )

        return {
            "success": True,
            "data": {
                "destination":        destination,
                "days":               days_plan,
                "hotels":             normalised_hotels,
                "flights":            [],          # orchestrator patches this after
                "budget_summary":     f"Estimated ₹{total_cost:,} of ₹{budget:,}",
                "totalEstimatedCost": total_cost,
                "notes":              (
                    f"Generated via offline fallback for {destination}. "
                    f"Weather: {weather.get('condition', 'N/A')} {weather.get('temp', '')}."
                ),
            },
        }
