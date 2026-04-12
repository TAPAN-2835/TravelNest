import json
import re

class Validator:
    @staticmethod
    def validate_itinerary(itinerary_json: str, input_data: dict):
        """
        Validates the generated itinerary against the input constraints.
        """
        try:
            data = json.loads(itinerary_json)
        except Exception:
            return False, "Invalid JSON format"

        # 1. Required fields
        required_fields = ["destination", "days", "hotels", "total_estimated_cost"]
        for field in required_fields:
            if field not in data:
                return False, f"Missing required field: {field}"

        # 2. Destination consistency
        if input_data["destination"].lower() not in data["destination"].lower():
            return False, f"Destination mismatch. Expected {input_data['destination']}, got {data['destination']}"

        # 3. Budget compliance
        # Extract number from total_estimated_cost (e.g., "₹45,000" -> 45000)
        try:
            cost_str = data["total_estimated_cost"]
            cost_num = int(re.sub(r'[^\d]', '', cost_str))
            # Allow 20% margin for "realistic" estimates
            input_budget = int(float(input_data.get("budget", 50000)))
            if cost_num > input_budget * 1.2:
                return False, f"Exceeds budget significantly. Cost: {cost_num}, Budget: {input_budget}"
        except Exception as e:
            print(f"Validation error (budget): {e}")

        # 4. Content length
        if len(data["days"]) < int(input_data["days"]):
             return False, f"Incomplete itinerary. Expected {input_data['days']} days, got {len(data['days'])}"

        return True, data
