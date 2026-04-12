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
        api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        if not api_key:
            return []
            
        try:
            async with httpx.AsyncClient() as client:
                import urllib.parse
                target = f"{query} near {dest_name}" if dest_name else query
                safe_target = urllib.parse.quote(target)
                url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query=top+tourist+attractions+{safe_target}&key={api_key}"
                res = await client.get(url, timeout=8.0)
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for p in data.get("results", []):
                        if 'name' in p:
                            results.append({
                                "name": p["name"],
                                "area": p.get("formatted_address", dest_name),
                                "rating": p.get("rating", 4.0),
                                "category": "Attraction"
                            })
                        if len(results) >= 15:
                            break
                    return results
        except Exception as e:
            print(f"Places API Error (Attractions): {e}")
            
        return []

    @staticmethod
    async def get_hotels(dest_name: str) -> List[Dict]:
        api_key = os.getenv("GOOGLE_PLACES_API_KEY")
        if not api_key:
            return []
            
        try:
            async with httpx.AsyncClient() as client:
                import urllib.parse
                safe_target = urllib.parse.quote(f"best hotels in {dest_name}")
                url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={safe_target}&key={api_key}"
                res = await client.get(url, timeout=8.0)
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for p in data.get("results", []):
                        if 'name' in p and p.get("rating", 0) >= 4.0:
                            price_level = p.get("price_level")
                            base_price = 3000
                            if price_level == 1: base_price = 1500
                            elif price_level == 2: base_price = 3500
                            elif price_level == 3: base_price = 8000
                            elif price_level == 4: base_price = 15000
                            
                            results.append({
                                "name": p["name"],
                                "location": p.get("formatted_address", dest_name),
                                "rating": p.get("rating", 4.0),
                                "price": str(base_price),
                                "link": "#"
                            })
                        if len(results) >= 10:
                            break
                    return results
        except Exception as e:
            print(f"Places API Error (Hotels): {e}")
            
        return []
