import os
import json
try:
    from groq import Groq
except ImportError:
    Groq = None

# We can implement multi-provider fallbacks here easily.
class AIEngine:
    def __init__(self):
        self.provider = "groq"
        self.api_key = os.getenv("GROQ_API_KEY")
        if not Groq:
            raise ImportError("Groq library not installed.")
        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")
        
        self.system_prompt = """
        You are a senior professional Hybrid Travel Agent for TravelNest.
        Your goal is to create a realistic itinerary grounded strictly in the provided static data and real-time context.
        STRICT RULES:
        1. Destination MUST match the input exactly.
        2. Use REAL-TIME WEATHER to suggest appropriate timing.
        3. Do NOT hallucinate hotels or attractions. Use ONLY the ones provided.
        4. Currency MUST be INR (₹).
        5. Provide output strictly matching the requested JSON format.
        """

    def generate_trip(self, prompt: str) -> dict:
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": self.system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            raw = response.choices[0].message.content
            return json.loads(raw)
        except Exception as e:
            print(f"AIEngine Error ({self.provider}): {e}")
            raise RuntimeError(f"LLM Generation failed: {e}")
