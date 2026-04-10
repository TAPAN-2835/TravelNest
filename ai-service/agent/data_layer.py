import asyncio
from typing import Dict, Any
from .api_services import WeatherService, PlacesService

# Curated dataset of Indian destinations
INDIAN_DESTINATIONS = {
    "Gujarat": {
        "attractions": [
            {"name": "Statue of Unity", "area": "Kevadia", "description": "The world's tallest statue."},
            {"name": "Sabarmati Ashram", "area": "Ahmedabad", "description": "Gandhi's residence and museum."},
            {"name": "Laxmi Vilas Palace", "area": "Vadodara", "description": "Grand palace of the Gaekwads."}
        ],
        "hotels": [
            {"name": "Narmada Tent City", "area": "Near SOU", "price_range": "₹4500-₹8000"},
            {"name": "The Fern Ahmedabad", "area": "Ahmedabad", "price_range": "₹3500-₹5000"}
        ],
        "transport": ["Auto Rickshaw", "Uber/Ola", "Local Cabs"]
    },
    "Goa": {
        "attractions": [
            {"name": "Calangute Beach", "area": "North Goa", "description": "The 'Queen of Beaches'."},
            {"name": "Basilica of Bom Jesus", "area": "Old Goa", "description": "UNESCO World Heritage Site."}
        ],
        "hotels": [
            {"name": "Taj Exotica", "area": "Benaulim", "price_range": "₹15000-₹25000"},
            {"name": "OYO Rooms Calangute", "area": "Calangute", "price_range": "₹1200-₹2500"}
        ],
        "transport": ["Scooter Rental", "Private Cab", "Local Bus"]
    }
}

class HybridDataManager:
    def __init__(self):
        self.weather_service = WeatherService()
        self.places_service = PlacesService()

    async def get_augmented_context(self, destination: str, interests: list) -> Dict[str, Any]:
        dest_clean = destination.split(',')[0].strip()
        static_data = self.get_static_ground_truth(dest_clean)
        
        weather_task = self.weather_service.get_current_weather(dest_clean)
        places_task = self.places_service.get_nearby_places(f"best {interests[0]}", dest_clean)
        
        weather, live_places = await asyncio.gather(weather_task, places_task)
        
        unified_data = {
            "destination": dest_clean,
            "static_attractions": static_data["attractions"],
            "static_hotels": static_data["hotels"],
            "live_context": {
                "weather": weather,
                "trending_places": live_places
            },
            "transport": static_data.get("transport", ["Tuk-tuk", "Local Cabs"])
        }
        return unified_data

    def get_static_ground_truth(self, destination: str) -> Dict[str, Any]:
        dest_key = next((k for k in INDIAN_DESTINATIONS.keys() if k.lower() in destination.lower()), None)
        if not dest_key:
            return {
                "attractions": [{"name": f"Historical Center of {destination}", "area": "Old Town"}],
                "hotels": [{"name": f"Grand {destination} Hotel", "area": "City Center"}],
                "transport": ["Tuk-tuk", "Local Cabs"]
            }
        return INDIAN_DESTINATIONS[dest_key]
