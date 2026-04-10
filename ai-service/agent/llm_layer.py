import os
try:
    from groq import Groq
except ImportError:
    Groq = None

class LLMLayer:
    def __init__(self):
        self.provider = "groq"
        self.api_key = os.getenv("GROQ_API_KEY")
        
        if not Groq:
            raise ImportError("Groq library not installed. Add groq to requirements.txt")
        if not self.api_key:
            print("WARNING: GROQ_API_KEY is missing!")
            
        self.client = Groq(api_key=self.api_key)
        self.model = os.getenv("GROQ_MODEL", "llama-3.3-70b-versatile")

    def generate_json(self, prompt: str, system_prompt: str):
        """
        Generates a JSON response from the Groq provider.
        """
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": prompt}
                ],
                response_format={"type": "json_object"}
            )
            return response.choices[0].message.content
                
        except Exception as e:
            print(f"LLM Error (groq): {e}")
            return None
                
        except Exception as e:
            print(f"LLM Error ({self.provider}): {e}")
            return None
