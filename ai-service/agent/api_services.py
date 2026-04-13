import os
import httpx
from typing import List, Dict

# Curated fallback data per destination so validator always has valid names
STATIC_DESTINATIONS = {
    "goa": {
        "places": [
            {"name": "Calangute Beach", "area": "North Goa", "category": "Beach"},
            {"name": "Basilica of Bom Jesus", "area": "Old Goa", "category": "Heritage"},
            {"name": "Fort Aguada", "area": "Sinquerim", "category": "Fort"},
            {"name": "Dudhsagar Falls", "area": "Sanguem", "category": "Nature"},
            {"name": "Anjuna Beach", "area": "Anjuna", "category": "Beach"},
            {"name": "Chapora Fort", "area": "Vagator", "category": "Fort"},
        ],
        "hotels": [
            {"name": "Taj Exotica Resort", "location": "Benaulim, South Goa", "rating": 4.8, "price": "15000"},
            {"name": "Lemon Tree Amarante Beach Resort", "location": "Candolim, North Goa", "rating": 4.4, "price": "6500"},
            {"name": "OYO Rooms Calangute", "location": "Calangute, North Goa", "rating": 4.0, "price": "1800"},
            {"name": "Treebo Trend Dona Paula Inn", "location": "Panjim", "rating": 4.1, "price": "2500"},
        ],
    },
    "gujarat": {
        "places": [
            {"name": "Statue of Unity", "area": "Kevadia", "category": "Monument"},
            {"name": "Sabarmati Ashram", "area": "Ahmedabad", "category": "Heritage"},
            {"name": "Laxmi Vilas Palace", "area": "Vadodara", "category": "Palace"},
            {"name": "Rann of Kutch", "area": "Kutch", "category": "Nature"},
            {"name": "Gir National Park", "area": "Junagadh", "category": "Wildlife"},
            {"name": "Somnath Temple", "area": "Prabhas Patan", "category": "Temple"},
        ],
        "hotels": [
            {"name": "Narmada Tent City", "location": "Near Statue of Unity, Kevadia", "rating": 4.5, "price": "6000"},
            {"name": "The Fern Hotel Ahmedabad", "location": "Ahmedabad", "rating": 4.3, "price": "4500"},
            {"name": "FabHotel Crystal Ahmedabad", "location": "Ahmedabad Station Area", "rating": 4.0, "price": "1500"},
            {"name": "Hyatt Regency Ahmedabad", "location": "Vastrapur, Ahmedabad", "rating": 4.6, "price": "8000"},
        ],
    },
    "manali": {
        "places": [
            {"name": "Hadimba Devi Temple", "area": "Old Manali", "category": "Temple"},
            {"name": "Solang Valley", "area": "Burwa", "category": "Adventure"},
            {"name": "Rohtang Pass", "area": "Leh Highway", "category": "Mountain"},
            {"name": "Mall Road Manali", "area": "Manali Town", "category": "Shopping"},
            {"name": "Beas River", "area": "Riverside", "category": "Nature"},
            {"name": "Jagatsukh Village", "area": "Kullu Valley", "category": "Culture"},
        ],
        "hotels": [
            {"name": "Span Resort & Spa", "location": "Kullu Manali Highway", "rating": 4.7, "price": "12000"},
            {"name": "The Himalayan Hotel Manali", "location": "Hadimba Road", "rating": 4.4, "price": "9000"},
            {"name": "FabHotel Manali Castle", "location": "Mall Road", "rating": 4.0, "price": "2500"},
        ],
    },
    "jaipur": {
        "places": [
            {"name": "Amber Fort", "area": "Amber, Jaipur", "category": "Fort"},
            {"name": "City Palace Jaipur", "area": "Old City", "category": "Palace"},
            {"name": "Hawa Mahal", "area": "Badi Chaupar", "category": "Monument"},
            {"name": "Jantar Mantar", "area": "Gangori Bazaar", "category": "Heritage"},
            {"name": "Nahargarh Fort", "area": "Aravalli Hills", "category": "Fort"},
            {"name": "Johari Bazaar", "area": "Old Jaipur", "category": "Shopping"},
        ],
        "hotels": [
            {"name": "Rambagh Palace", "location": "Bhawani Singh Road", "rating": 4.9, "price": "35000"},
            {"name": "Trident Jaipur", "location": "Amer Road", "rating": 4.6, "price": "8000"},
            {"name": "Hotel Pearl Palace", "location": "Hathroi Fort, Ajmer Road", "rating": 4.3, "price": "2000"},
        ],
    },
    "kerala": {
        "places": [
            {"name": "Alleppey Backwaters", "area": "Alappuzha", "category": "Nature"},
            {"name": "Munnar Tea Gardens", "area": "Munnar", "category": "Nature"},
            {"name": "Periyar National Park", "area": "Thekkady", "category": "Wildlife"},
            {"name": "Fort Kochi", "area": "Kochi", "category": "Heritage"},
            {"name": "Athirapally Falls", "area": "Thrissur", "category": "Nature"},
            {"name": "Kovalam Beach", "area": "Thiruvananthapuram", "category": "Beach"},
        ],
        "hotels": [
            {"name": "Taj Malabar Resort", "location": "Willingdon Island, Kochi", "rating": 4.8, "price": "14000"},
            {"name": "The Zuri Kumarakom", "location": "Kumarakom, Kottayam", "rating": 4.7, "price": "12000"},
            {"name": "OYO Premium Munnar", "location": "Munnar Town", "rating": 4.0, "price": "2200"},
        ],
    },
    "mumbai": {
        "places": [
            {"name": "Gateway of India", "area": "Apollo Bunder", "category": "Monument"},
            {"name": "Marine Drive", "area": "Nariman Point", "category": "Promenade"},
            {"name": "Elephanta Caves", "area": "Gharapuri Island", "category": "Heritage"},
            {"name": "Chhatrapati Shivaji Terminus", "area": "Fort Area", "category": "Heritage"},
            {"name": "Juhu Beach", "area": "Vile Parle West", "category": "Beach"},
            {"name": "Dharavi", "area": "Sion", "category": "Culture"},
        ],
        "hotels": [
            {"name": "Taj Mahal Palace Hotel", "location": "Apollo Bunder, Colaba", "rating": 4.9, "price": "25000"},
            {"name": "The Oberoi Mumbai", "location": "Nariman Point", "rating": 4.8, "price": "20000"},
            {"name": "Residency Hotel Fort", "location": "Fort, Mumbai", "rating": 4.2, "price": "3500"},
        ],
    },
    "delhi": {
        "places": [
            {"name": "Red Fort", "area": "Old Delhi", "category": "Fort"},
            {"name": "Qutub Minar", "area": "Mehrauli", "category": "Monument"},
            {"name": "India Gate", "area": "Rajpath", "category": "Monument"},
            {"name": "Humayun's Tomb", "area": "Nizamuddin East", "category": "Heritage"},
            {"name": "Chandni Chowk", "area": "Old Delhi", "category": "Market"},
            {"name": "Lotus Temple", "area": "Bahapur", "category": "Temple"},
        ],
        "hotels": [
            {"name": "The Imperial New Delhi", "location": "Janpath, Connaught Place", "rating": 4.8, "price": "18000"},
            {"name": "Taj Hotel New Delhi", "location": "Sardar Patel Marg", "rating": 4.7, "price": "15000"},
            {"name": "Hotel Broadway Delhi", "location": "Asaf Ali Road, Old Delhi", "rating": 4.1, "price": "2800"},
        ],
    },
}

# Default fallback for unknown destinations
DEFAULT_FALLBACK = {
    "places": [
        {"name": "City Heritage Walk", "area": "Old Town", "category": "Heritage"},
        {"name": "Local Market Tour", "area": "Main Bazaar", "category": "Shopping"},
        {"name": "Museum of History", "area": "City Center", "category": "Museum"},
        {"name": "Scenic Park", "area": "Green Zone", "category": "Nature"},
    ],
    "hotels": [
        {"name": "Grand Central Hotel", "location": "City Center", "rating": 4.2, "price": "4000"},
        {"name": "Budget Inn Express", "location": "Near Railway Station", "rating": 3.9, "price": "1500"},
    ],
}


class WeatherService:
    @staticmethod
    async def get_current_weather(city: str) -> Dict:
        api_key = os.getenv("OPENWEATHER_API_KEY")
        if not api_key:
            return {"condition": "Sunny", "temp": "28°C", "humidity": "60%", "note": "Cached fallback."}

        try:
            async with httpx.AsyncClient() as client:
                url = f"http://api.openweathermap.org/data/2.5/weather?q={city}&appid={api_key}&units=metric"
                response = await client.get(url, timeout=5.0)
                if response.status_code == 200:
                    data = response.json()
                    return {
                        "condition": data["weather"][0]["description"].capitalize(),
                        "temp": f"{data['main']['temp']}°C",
                        "humidity": f"{data['main']['humidity']}%",
                    }
        except Exception as e:
            print(f"Weather API Error: {e}")

        return {"condition": "Partly Cloudy", "temp": "25°C", "humidity": "55%", "note": "Fallback weather used."}


class PlacesService:
    @staticmethod
    async def get_nearby_places(query: str, dest_name: str = "") -> List[Dict]:
        """Fetch attractions via OpenTripMap. Falls back to curated static list."""
        api_key = os.getenv("OPENTRIPMAP_API_KEY")
        dest_clean = dest_name.strip().lower()

        if api_key:
            try:
                async with httpx.AsyncClient() as client:
                    # Step 1: Geocode
                    geo_url = f"http://api.opentripmap.com/0.1/en/places/geoname?name={dest_name}&apikey={api_key}"
                    geo_res = await client.get(geo_url, timeout=6.0)
                    if geo_res.status_code == 200 and "lat" in geo_res.json():
                        geo = geo_res.json()
                        lat, lon = geo["lat"], geo["lon"]

                        # Step 2: Nearby attractions
                        places_url = (
                            f"http://api.opentripmap.com/0.1/en/places/radius"
                            f"?radius=20000&lon={lon}&lat={lat}"
                            f"&kinds=interesting_places,cultural,natural,historic"
                            f"&rate=2&format=json&apikey={api_key}"
                        )
                        places_res = await client.get(places_url, timeout=8.0)
                        if places_res.status_code == 200:
                            results = []
                            for p in places_res.json():
                                name = p.get("name", "").strip()
                                if name:
                                    results.append({
                                        "name": name,
                                        "area": dest_name,
                                        "category": p.get("kinds", "Attraction").split(",")[0].replace("_", " ").title(),
                                    })
                                if len(results) >= 10:
                                    break
                            if results:
                                print(f"[PlacesService] {len(results)} live places from OpenTripMap for {dest_name}")
                                return results
            except Exception as e:
                print(f"OpenTripMap Error: {e}")

        # Static curated fallback
        key = next((k for k in STATIC_DESTINATIONS if k in dest_clean), None)
        if key:
            print(f"[PlacesService] Using curated static data for: {key}")
            return STATIC_DESTINATIONS[key]["places"]

        print(f"[PlacesService] Using default fallback for: {dest_name}")
        return [{"name": f"{dest_name} City Center", "area": dest_name, "category": "Landmark"}] + DEFAULT_FALLBACK["places"]

    @staticmethod
    async def get_hotels(dest_name: str) -> List[Dict]:
        """Hotels use curated data — free APIs don't reliably cover hotels with prices."""
        dest_clean = dest_name.strip().lower()
        key = next((k for k in STATIC_DESTINATIONS if k in dest_clean), None)
        if key:
            return STATIC_DESTINATIONS[key]["hotels"]
        return DEFAULT_FALLBACK["hotels"]
