import asyncio
from typing import Dict, Any
from .api_services import WeatherService, PlacesService

class HybridDataManager:
    def __init__(self):
        self.weather_service = WeatherService()
        self.places_service = PlacesService()

    async def get_augmented_context(self, destination: str, interests: list) -> Dict[str, Any]:
        dest_clean = destination.split(',')[0].strip()
        
        # Parallel async data fetch (weather + real places + real hotels)
        weather_task = self.weather_service.get_current_weather(dest_clean)
        interest_query = interests[0] if interests else "attractions"
        places_task = self.places_service.get_nearby_places(interest_query, dest_clean)
        hotels_task = self.places_service.get_hotels(dest_clean)
        
        weather, live_places, real_hotels = await asyncio.gather(weather_task, places_task, hotels_task)
        
        unified_data = {
            "destination": dest_clean,
            "real_places": live_places,
            "real_hotels": real_hotels,
            "live_context": {
                "weather": weather
            },
            "transport": ["Local Cabs", "Public Transit", "Auto Rickshaw"]
        }
        return unified_data
