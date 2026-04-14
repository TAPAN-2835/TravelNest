import os
import httpx
import asyncio
from dotenv import load_dotenv

load_dotenv()

async def test_serper_news(query: str):
    api_key = os.getenv("SERPER_API_KEY")
    url = "https://google.serper.dev/news"
    
    headers = {
        'X-API-KEY': api_key,
        'Content-Type': 'application/json'
    }
    
    payload = {
        "q": query,
        "num": 5
    }
    
    async with httpx.AsyncClient() as client:
        response = await client.post(url, headers=headers, json=payload)
        return response.json()

async def main():
    res = await test_serper_news("Events in Bangalore April 2026")
    print(res)

if __name__ == "__main__":
    asyncio.run(main())
