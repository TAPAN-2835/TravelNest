import asyncio
from agent.api_services import SerperService

async def main():
    service = SerperService()
    news = await service.get_local_news("goa")
    print("Filtered news:", news)

if __name__ == "__main__":
    asyncio.run(main())
