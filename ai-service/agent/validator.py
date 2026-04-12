import json
import re

class Validator:
    @staticmethod
    def validate_itinerary(data: dict, real_places: list, real_hotels: list):
        """
        Strictly validates the generated itinerary against the real datasets provided.
        """
        # 1. Required fields
        required_fields = ["destination", "days", "hotels"]
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"

        # 2. Extract valid arrays
        valid_hotel_names = [h.get("name", "").lower() for h in real_hotels]
        valid_place_names = [p.get("name", "").lower() for p in real_places]

        # 3. Check Hotels
        for h in data.get("hotels", []):
            h_name = h.get("name", "Unknown Hotel").lower()
            if "not available" in h_name:
                continue
            if h_name not in valid_hotel_names:
                return False, f"Hallucinated Hotel Detected: {h.get('name')}. You MUST use provided real hotels."

        # 4. Check Places and Repetition
        used_places = set()
        for day in data.get("days", []):
            for slot in ["morning", "afternoon", "evening"]:
                if slot in day:
                    place_name = day[slot].get("place", "").lower()
                    if "not available" in place_name.lower():
                        continue
                    
                    # Validate Real Place
                    matched = False
                    for valid in valid_place_names:
                        if valid in place_name or place_name in valid:
                            matched = True
                            break
                            
                    if not matched:
                        # Allow slight variations but enforce strict matching
                        return False, f"Hallucinated Place Detected: {day[slot].get('place')}. You MUST use provided real places only."
                    
                    if place_name in used_places:
                        return False, f"Repetitive Place Detected: {day[slot].get('place')} used multiple times. Each day must be unique."
                    used_places.add(place_name)

        return True, data
