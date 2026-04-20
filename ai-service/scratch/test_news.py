import asyncio
import sys, os
sys.path.insert(0, '.')
from dotenv import load_dotenv
load_dotenv()
from agent.api_services import SerperService

async def main():
    service = SerperService()
    news = await service.get_local_news("Amritsar")
    print("Filtered news:", news)

if __name__ == "__main__":
    asyncio.run(main())
