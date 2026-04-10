import os
import httpx
from typing import List, Dict

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
                target_city = dest_name if dest_name else query.split()[-1]
                geo_url = f"http://api.opentripmap.com/0.1/en/places/geoname?name={target_city}&apikey={api_key}"
                geo_res = await client.get(geo_url, timeout=5.0)
                if geo_res.status_code == 200 and 'lat' in geo_res.json():
                    geo_data = geo_res.json()
                    lat, lon = geo_data['lat'], geo_data['lon']
                    
                    places_url = f"http://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon={lon}&lat={lat}&kinds=interesting_places&rate=2&format=json&apikey={api_key}"
                    places_res = await client.get(places_url, timeout=5.0)
                    
                    if places_res.status_code == 200:
                        places_data = places_res.json()
                        results = []
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
            
        return [
            {"name": f"Top Rated {query} Spot (OpenTripMap)", "area": dest_name or "Central", "rating": 4.5}
        ]
