import os
import json
import httpx
import asyncio
from typing import List, Dict

# Curated dataset of Indian destinations (Pre-seeded Ground Truth)
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
        ]
    },
    "Goa": {
        "attractions": [
            {"name": "Calangute Beach", "area": "North Goa", "description": "The 'Queen of Beaches'."},
            {"name": "Basilica of Bom Jesus", "area": "Old Goa", "description": "UNESCO World Heritage Site."}
        ],
        "hotels": [
            {"name": "Taj Exotica", "area": "Benaulim", "price_range": "₹15000-₹25000"},
            {"name": "OYO Rooms Calangute", "area": "Calangute", "price_range": "₹1200-₹2500"}
        ]
    }
}

class WeatherService:
    @staticmethod
    async def get_current_weather(city: str) -> Dict:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            return {"condition": "Sunny", "temp": "28°C", "note": "Real-time weather data unavailable (No API Key)."}
        
        try:
            async with httpx.AsyncClient() as client:
                url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "condition": data['weather'][0]['description'].capitalize(),
                        "temp": f"{data['main']['temp']}°C",
                        "humidity": f"{data['main']['humidity']}%"
                    }
        except Exception as e:
            print(f"Weather API Error: {e}")
        
        return {"condition": "Partly Cloudy", "temp": "25°C", "note": "Fallback weather used."}

class PlacesService:
    @staticmethod
    async def get_nearby_places(query: str, dest_name: str = "") -> List[Dict]:
        api_key = os.getenv("OPENTRIPMAP_API_KEY")
        if not api_key:
            return []
            
        try:
            async with httpx.AsyncClient() as client:
                # 1. Get Coordinates
                target_city = dest_name if dest_name else query.split()[-1]
                geo_url = f"http://api.opentripmap.com/0.1/en/places/geoname?name={target_city}&apikey={api_key}"
                geo_res = await client.get(geo_url, timeout=5.0)
                if geo_res.status_code == 200 and 'lat' in geo_res.json():
                    geo_data = geo_res.json()
                    lat, lon = geo_data['lat'], geo_data['lon']
                    
                    # 2. Get Places within radius
                    places_url = f"http://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon={lon}&lat={lat}&kinds=interesting_places&rate=2&format=json&apikey={api_key}"
                    places_res = await client.get(places_url, timeout=5.0)
                    
                    if places_res.status_code == 200:
                        places_data = places_res.json()
                        results = []
                        # Take up to 5 valid places
                        for p in places_data:
                            if 'name' in p and p['name'].strip():
                                results.append({
                                    "name": p["name"],
                                    "area": target_city,
                                    "category": "Attraction"
                                })
                            if len(results) >= 5:
                                break
                        if results:
                            return results
        except Exception as e:
            print(f"Places API Error: {e}")
            
        # Fallback simulation
        return [
            {"name": f"Top Rated {query} Spot (OpenTripMap)", "area": dest_name or "Central", "rating": 4.5}
        ]

class HybridDataManager:
    def __init__(self):
        self.weather_service = WeatherService()
        self.places_service = PlacesService()

    async def get_augmented_context(self, destination: str, interests: list = None):
        """
        Merge Static Ground Truth + Real-time APIs
        """
        dest_clean = destination.split(',')[0].strip()
        
        # 1. Fetch Static Data
        static_data = self.get_static_ground_truth(dest_clean)
        
        # 2. Fetch Real-time Context (Parallel)
        weather_task = self.weather_service.get_current_weather(dest_clean)
        places_task = self.places_service.get_nearby_places(f"best {interests[0] if interests else 'sightseeing'} in {dest_clean}")
        
        weather, live_places = await asyncio.gather(weather_task, places_task)
        
        # 3. Merge Strategy
        unified_data = {
            "destination": destination,
            "static_attractions": static_data["attractions"],
            "static_hotels": static_data["hotels"],
            "live_context": {
                "weather": weather,
                "trending_places": live_places
            },
            "transport": static_data["transport"]
        }
        
        return unified_data

    def get_static_ground_truth(self, destination: str):
        dest_key = next((k for k in INDIAN_DESTINATIONS.keys() if k.lower() in destination.lower()), None)
        
        if not dest_key:
            return {
                "attractions": [{"name": f"Historical Center of {destination}", "area": "Old Town"}],
                "hotels": [{"name": f"Grand {destination} Hotel", "area": "City Center"}],
                "transport": ["Tuk-tuk", "Local Cabs"]
            }
            
        data = INDIAN_DESTINATIONS[dest_key]
        return {
            "attractions": data["attractions"],
            "hotels": data["hotels"],
            "transport": ["Auto Rickshaw", "Uber/Ola", "Private Cab", "Local Bus"]
        }
