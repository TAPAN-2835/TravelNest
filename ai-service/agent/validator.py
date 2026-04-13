class Validator:
    @staticmethod
    def validate_itinerary(data: dict, real_places: list, real_hotels: list) -> tuple:
        """
        Validates the generated itinerary. Uses lenient partial matching so small 
        LLM phrasing variations don't cause unnecessary retries.
        """
        # 1. Required fields
        for field in ["destination", "days", "hotels"]:
            if field not in data:
                return False, f"Missing required field: '{field}'"

        if not isinstance(data["days"], list) or len(data["days"]) == 0:
            return False, "days[] is empty — LLM did not generate any day plans."

        # 2. Build lowercase name sets for fuzzy matching
        valid_hotel_names = [h.get("name", "").lower().strip() for h in real_hotels]
        valid_place_names = [p.get("name", "").lower().strip() for p in real_places]

        def _fuzzy_match(name: str, valid_set: list) -> bool:
            """Returns True if name partially matches any entry in the set."""
            name_l = name.lower().strip()
            # Skip validation for generic/fallback values
            if not name_l or "not available" in name_l or len(name_l) < 4:
                return True
            # Direct or partial containment
            for valid in valid_set:
                if not valid:
                    continue
                if valid in name_l or name_l in valid:
                    return True
                # Word-level overlap (at least 2 words match)
                n_words = set(name_l.split())
                v_words = set(valid.split())
                if len(n_words & v_words) >= 2:
                    return True
            return False

        # 3. Hotel validation (lenient — only block clearly hallucinated hotels)
        for h in data.get("hotels", []):
            h_name = h.get("name", "")
            if valid_hotel_names and not _fuzzy_match(h_name, valid_hotel_names):
                return False, f"Unrecognized hotel: '{h_name}'. Use ONLY hotels from the provided list."

        # 4. Place + repetition validation
        used_places = set()
        for day in data.get("days", []):
            for slot in ["morning", "afternoon", "evening"]:
                slot_data = day.get(slot, {})
                if not slot_data:
                    continue
                place_name = slot_data.get("place", "").strip()
                place_l = place_name.lower()

                if not place_name or "not available" in place_l:
                    continue

                # Only enforce place matching if we have a non-empty valid list
                if valid_place_names and not _fuzzy_match(place_name, valid_place_names):
                    return False, f"Unrecognized place in {slot}: '{place_name}'. Use ONLY provided real places."

                if place_l in used_places:
                    return False, f"Repeated place across days: '{place_name}'. Each slot must be unique."
                used_places.add(place_l)

        return True, data
