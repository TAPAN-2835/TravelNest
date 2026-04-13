"""
Quick sanity check — run from ai-service folder:
  .\venv\Scripts\python.exe test_sanity.py
"""
import sys, asyncio
sys.path.insert(0, '.')

from agent.input_parser import InputParser
from agent.validator import Validator
from agent.fallback_engine import FallbackEngine

# 1. Input parser
dest, days, budget, interests = InputParser.parse('Goa', '3', '50000.0', ['Beach'])
assert dest == 'Goa' and days == 3 and budget == 50000, "Parser failed"
print(f"[PASS] InputParser: {dest}, {days}d, ₹{budget}")

# 2. Validator – valid case
places = [{'name': 'Calangute Beach'}, {'name': 'Fort Aguada'}, {'name': 'Anjuna Beach'}]
hotels = [{'name': 'Taj Exotica Resort'}, {'name': 'OYO Rooms Calangute'}]
data = {
    'destination': 'Goa', 'hotels': [{'name': 'Taj Exotica Resort'}],
    'days': [
        {'day': 1,
         'morning':   {'activity': 'Visit beach', 'place': 'Calangute Beach', 'duration': '2h', 'cost': 500},
         'afternoon': {'activity': 'Visit fort',  'place': 'Fort Aguada',     'duration': '3h', 'cost': 300},
         'evening':   {'activity': 'Night market','place': 'Anjuna Beach',    'duration': '2h', 'cost': 400}}
    ]
}
ok, msg = Validator.validate_itinerary(data, places, hotels)
assert ok, f"Validator rejected valid data: {msg}"
print(f"[PASS] Validator: valid itinerary accepted")

# 3. Validator – blocks hallucinated place
bad_data = {**data, 'days': [{'day': 1,
    'morning':   {'activity': 'x', 'place': 'Fake Made-Up Resort Somewhere', 'duration': '2h', 'cost': 500},
    'afternoon': {'activity': 'y', 'place': 'Invented Palace Gardens Hotel', 'duration': '3h', 'cost': 300},
    'evening':   {'activity': 'z', 'place': 'Non-Existent Wonder Park',      'duration': '2h', 'cost': 400},
}]}
ok2, msg2 = Validator.validate_itinerary(bad_data, places, hotels)
assert not ok2, "Validator should have rejected hallucinated places"
print(f"[PASS] Validator: hallucination blocked → '{msg2}'")

# 4. FallbackEngine
augmented = {
    'real_places': places,
    'real_hotels': hotels,
    'live_context': {'weather': {'condition': 'Sunny', 'temp': '32°C'}}
}
fb = FallbackEngine.generate('Goa', 3, 25000, augmented)
assert fb['success'] is True, "Fallback should return success=True"
assert len(fb['data']['days']) == 3, "Fallback should return 3 day plans"
assert fb['data']['totalEstimatedCost'] > 0, "Fallback must compute cost"
print(f"[PASS] FallbackEngine: {len(fb['data']['days'])} days, ₹{fb['data']['totalEstimatedCost']:,}")

print("\n✅ ALL SANITY CHECKS PASSED")
