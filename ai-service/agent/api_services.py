import os
import httpx
import json
from typing import List, Dict, Optional
from groq import Groq

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

class SerperService:
    @staticmethod
    async def get_local_news(city: str) -> List[Dict]:
        """Fetch travel-relevant local news and events via Serper News API."""
        api_key = os.getenv("SERPER_API_KEY")
        if not api_key:
            print("[SerperService] SERPER_API_KEY not set")
            return []

        # Broad query to maximize news results, then AI filters the junk
        query = f"{city} travel tourism events festivals news"
        
        try:
            async with httpx.AsyncClient() as client:
                url = "https://google.serper.dev/news"
                headers = {"X-API-KEY": api_key, "Content-Type": "application/json"}
                payload = {
                    "q": query, 
                    "num": 20,  # Fetch more to have better filtering pool
                    "tbs": "qdr:m"  # Last month for better coverage
                }
                response = await client.post(url, headers=headers, json=payload, timeout=8.0)
                print(f"[SerperService] Status: {response.status_code} for query: {query}")
                if response.status_code == 200:
                    data = response.json()
                    news_results = data.get("news", [])
                    print(f"[SerperService] Raw results: {len(news_results)} articles")
                    
                    if not news_results:
                        return []

                    # AI Filtering for travel relevance
                    filter_service = NewsFilterService()
                    filtered_news = await filter_service.filter_relevant_news(city, news_results)
                    print(f"[SerperService] After AI filter: {len(filtered_news)} articles")
                    return filtered_news[:5]  # Return top 5 most relevant
                else:
                    print(f"[SerperService] Error body: {response.text[:200]}")
        except Exception as e:
            print(f"[SerperService] Error: {e}")
        return []


class NewsFilterService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    async def filter_relevant_news(self, city: str, news: List[Dict]) -> List[Dict]:
        """Use LLM to filter news items for travel relevance."""
        if not self.client or not news:
            print(f"[NewsFilter] Skipping filter — client={bool(self.client)}, news_count={len(news)}")
            return news

        # Prepare a list of headlines for the LLM to review
        headlines = "\n".join([f"{i}: {n.get('title', 'No title')}" for i, n in enumerate(news)])
        
        prompt = f"""
        City: {city}
        News Headlines:
        {headlines}
        
        TASK: Evaluate which headlines are useful for a TOURIST visiting {city}.
        KEEP (include index) if the news is about:
        - Festivals, events, concerts, food fairs, cultural celebrations.
        - Transport strikes, road closures, airport news affecting tourists.
        - Weather emergencies, natural disasters, safety alerts.
        - Popular tourist attractions opening/closing.
        - Major sports events happening in the city.
        
        DISCARD (exclude index) only if:
        - Pure financial data (gold rates, share prices).
        - Routine local politics with no tourist impact.
        - Purely local sports results with no event happening.
        
        When in doubt, KEEP the article. Return a JSON object with key "indices" containing
        an array of the article indices to keep.
        Example: {{"indices": [0, 2, 5]}}
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a travel intelligence filter. Always return valid JSON with an 'indices' key containing an array of numbers."},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"},
                max_tokens=200
            )
            raw = response.choices[0].message.content
            print(f"[NewsFilter] LLM response: {raw}")
            parsed = json.loads(raw)
            
            # Robustly extract indices from any key the LLM might use
            indices = None
            if isinstance(parsed, list):
                indices = parsed
            elif isinstance(parsed, dict):
                # Try common key names
                for key in ("indices", "relevant", "result", "keep", "selected"):
                    if key in parsed and isinstance(parsed[key], list):
                        indices = parsed[key]
                        break
                if indices is None:
                    # Take the first list value found
                    for v in parsed.values():
                        if isinstance(v, list):
                            indices = v
                            break

            if not isinstance(indices, list):
                print("[NewsFilter] Could not parse indices, returning all news")
                return news

            result = [news[i] for i in indices if isinstance(i, int) and i < len(news)]
            # Safety: if filter removes everything, return all news 
            return result if result else news
        except Exception as e:
            print(f"[NewsFilter] Error: {e} — returning all news as fallback")
            return news


class FamilyInsightsService:
    def __init__(self):
        self.api_key = os.getenv("GROQ_API_KEY")
        self.client = Groq(api_key=self.api_key) if self.api_key else None
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    async def generate_family_tip(self, city: str, weather_data: Dict) -> str:
        """Generate a child-friendly travel tip based on weather."""
        if not self.client:
            return "Plan your day based on the local weather forecast."

        prompt = f"""
        Destination: {city}
        Current Weather: {weather_data.get('condition', 'Unknown')}, {weather_data.get('temp', 'N/A')}
        Additional Info: Humidity {weather_data.get('humidity', 'N/A')}, Wind {weather_data.get('wind', 'N/A')}
        
        TASK: Provide a one-sentence, highly practical travel tip specifically for a family traveling with children. 
        Focus on safety, comfort (sun/rain protection), or age-appropriate activity suggestions.
        Keep it under 20 words.
        """
        
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": "You are a helpful travel assistant for families."},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=50
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"FamilyInsights Error: {e}")
            return "Great day to explore with the family!"
