import asyncio
from series_hackathon.backend.tools.networking import create_instant_group_tool

async def main():
    user_phone = "+19342463396"   # your test user
    name = "harsh"                # or None
    res = await create_instant_group_tool(user_phone, name=name)
    print(res)

if __name__ == "__main__":
    asyncio.run(main())