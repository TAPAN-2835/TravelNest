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
                # Try fetching coordinates first
                geo_url = f"http://api.opentripmap.com/0.1/en/places/geoname?name={target_city}&apikey={api_key}"
                geo_res = await client.get(geo_url, timeout=5.0)
                if geo_res.status_code == 200 and 'lat' in geo_res.json():
                    geo_data = geo_res.json()
                    lat, lon = geo_data['lat'], geo_data['lon']
                    
                    places_url = f"http://api.opentripmap.com/0.1/en/places/radius?radius=15000&lon={lon}&lat={lat}&kinds=interesting_places&rate=2&format=json&apikey={api_key}"
                    places_res = await client.get(places_url, timeout=8.0)
                    
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
                            if len(results) >= 15:
                                break
                        if results:
                            return results
        except Exception as e:
            print(f"Places API Error (Attractions): {e}")
            
        return []

    @staticmethod
    async def get_hotels(dest_name: str) -> List[Dict]:
        try:
            async with httpx.AsyncClient() as client:
                headers = {'User-Agent': 'TravelNestApp/1.0'}
                url = f"https://nominatim.openstreetmap.org/search?q=hotels+in+{dest_name}&format=json&limit=10"
                res = await client.get(url, headers=headers, timeout=8.0)
                
                if res.status_code == 200:
                    data = res.json()
                    results = []
                    for idx, p in enumerate(data):
                        if 'name' in p and p['name'].strip():
                            # Assign an approximate price level to mock for fallback since OSM lacks pricing inherently
                            base_prices = [3500, 5000, 8000, 12000, 2500]
                            assumed_price = base_prices[idx % len(base_prices)]
                            
                            results.append({
                                "name": p["name"],
                                "location": p.get("display_name", dest_name),
                                "rating": 4.5,  # Mocked rating since openstreetmap only searches known locations
                                "price": str(assumed_price),
                                "link": "#"
                            })
                    return results
        except Exception as e:
            print(f"Places API Error (Hotels): {e}")
            
        return []
