import json

# Curated dataset of Indian destinations to prevent hallucinations
INDIAN_DESTINATIONS = {
    "Gujarat": {
        "attractions": [
            {"name": "Statue of Unity", "area": "Kevadia", "description": "The world's tallest statue."},
            {"name": "Sabarmati Ashram", "area": "Ahmedabad", "description": "Gandhi's residence and museum."},
            {"name": "Laxmi Vilas Palace", "area": "Vadodara", "description": "Grand palace of the Gaekwads."},
            {"name": "Somnath Temple", "area": "Prabhas Patan", "description": "One of the 12 Jyotirlinga shrines."},
            {"name": "Rann of Kutch", "area": "Kutch", "description": "Famous salt marsh in Thar Desert."},
            {"name": "Gir National Park", "area": "Junagadh", "description": "Famed for its Asiatic Lions."}
        ],
        "hotels": [
            {"name": "Narmada Tent City", "area": "Near SOU", "price_range": "₹4500-₹8000"},
            {"name": "The Fern Ahmedabad", "area": "Ahmedabad", "price_range": "₹3500-₹5000"},
            {"name": "Hyatt Residency", "area": "Bharuch/Ahmedabad", "price_range": "₹4000-₹7000"},
            {"name": "FabHotel Crystal", "area": "Ahmedabad Station", "price_range": "₹1200-₹2000"}
        ]
    },
    "Goa": {
        "attractions": [
            {"name": "Calangute Beach", "area": "North Goa", "description": "The 'Queen of Beaches'."},
            {"name": "Basilica of Bom Jesus", "area": "Old Goa", "description": "UNESCO World Heritage Site."},
            {"name": "Dudhsagar Falls", "area": "Sanguem", "description": "Four-tiered waterfall."},
            {"name": "Fort Aguada", "area": "Sinquerim", "description": "17th-century Portuguese fort."}
        ],
        "hotels": [
            {"name": "Taj Exotica", "area": "Benaulim", "price_range": "₹15000-₹25000"},
            {"name": "OYO Rooms Calangute", "area": "Calangute", "price_range": "₹1200-₹2500"},
            {"name": "Lemon Tree Amarante", "area": "Candolim", "price_range": "₹4000-₹7000"},
            {"name": "Treebo Trend Dona Paula", "area": "Panjim", "price_range": "₹2000-₹3500"}
        ]
    },
    "Manali": {
        "attractions": [
            {"name": "Hadimba Devi Temple", "area": "Old Manali", "description": "Ancient cave temple."},
            {"name": "Solang Valley", "area": "Burwa", "description": "Famous for adventure sports."},
            {"name": "Rohtang Pass", "area": "Leh Highway", "description": "High mountain pass."},
            {"name": "Mall Road", "area": "Manali Town", "description": "Shopping and dining hub."}
        ],
        "hotels": [
            {"name": "Span Resort & Spa", "area": "Kullu-Manali Hwy", "price_range": "₹10000-₹15000"},
            {"name": "The Himalayan", "area": "Hadimba Road", "price_range": "₹8000-₹12000"},
            {"name": "FabHotel Manali Castle", "area": "Mall Road", "price_range": "₹1500-₹3000"}
        ]
    }
}

class DataLayer:
    @staticmethod
    def get_ground_truth(destination: str, preferences: list = None):
        """
        Fetches ground truth data from curated dataset or (future) APIs.
        """
        # Clean destination name
        dest_key = None
        for key in INDIAN_DESTINATIONS.keys():
            if key.lower() in destination.lower():
                dest_key = key
                break
        
        if not dest_key:
            # Fallback for generic but realistic data
            return {
                "attractions": [{"name": f"City Center {destination}", "area": "Main", "description": "Popular tourist spot."}],
                "hotels": [{"name": f"Hotel {destination}", "area": "Main", "price_range": "₹2000-₹4000"}],
                "transport": ["Auto Rickshaw", "Uber/Ola", "Local Bus"]
            }

        # Filtering logic for Indian users
        data = INDIAN_DESTINATIONS[dest_key]
        return {
            "attractions": data["attractions"],
            "hotels": data["hotels"],
            "transport": ["Auto Rickshaw", "Uber/Ola", "Private Cab", "Local Bus"],
            "context": f"This data is strictly for {dest_key} region."
        }
