from typing import Tuple, List, Optional
import math

class InputParser:
    @staticmethod
    def parse(destination: str, days: any, budget: any, interests: Optional[List[str]] = None) -> Tuple[str, int, int, List[str]]:
        try:
            clean_dest = str(destination).strip() if destination else "Unknown"
            
            # Safe float to int conversion handling None and strings
            try:
                clean_days = int(math.floor(float(days))) if days else 3
            except (ValueError, TypeError):
                clean_days = 3
                
            try:
                clean_budget = int(math.floor(float(budget))) if budget else 50000
            except (ValueError, TypeError):
                clean_budget = 50000
                
            clean_interests = interests if interests and isinstance(interests, list) else ["General Sightseeing"]
            
            return clean_dest, clean_days, clean_budget, clean_interests
            
        except Exception as e:
            print(f"Input Parsing Error: {e}")
            return "Goa", 3, 50000, ["General Sightseeing"]
