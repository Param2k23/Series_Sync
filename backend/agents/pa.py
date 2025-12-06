import json
import os
import datetime
from openai import AsyncOpenAI
# Import the tools we just made
from series_hackathon.backend.tools.tools_calendar import (
    search_events_tool, 
    create_event_tool, 
    delete_event_tool
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- DEFINE TOOLS SCHEMA ---
tools = [
    {
        "type": "function",
        "function": {
            "name": "search_events",
            "description": "Search for upcoming events. useful for checking schedule or finding an Event ID to delete.",
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {"type": "string", "description": "Keywords (e.g. 'Dinner', 'Meeting'). Empty for all."},
                    "count": {"type": "integer"}
                }
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "create_event",
            "description": "Schedule a new event.",
            "parameters": {
                "type": "object",
                "properties": {
                    "summary": {"type": "string", "description": "Event Title"},
                    "start_time_str": {"type": "string", "description": "ISO format (YYYY-MM-DDTHH:MM:SS)"},
                    "duration_minutes": {"type": "integer"}
                },
                "required": ["summary", "start_time_str"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "delete_event",
            "description": "Delete an event. YOU MUST HAVE THE EVENT ID FIRST (search for it).",
            "parameters": {
                "type": "object",
                "properties": {
                    "event_id": {"type": "string", "description": "The Google Event ID"}
                },
                "required": ["event_id"]
            }
        }
    }
]

async def run_personal_agent(query, session, chat_id):
    """
    Personal Agent Handler.
    """
    print(f"\n🏠 [PERSONAL AGENT] Received: {query}")
    
    # Context: Give today's date so it knows when "Tomorrow" is
    today = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
    system_msg = f"You are a Personal Assistant. Current Date/Time: {today}. Use Google Calendar tools to manage schedule."

    messages = [
        {"role": "system", "content": system_msg},
        {"role": "user", "content": query}
    ]

    # 1. Ask LLM
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
        tool_choice="auto"
    )

    msg = response.choices[0].message

    # 2. Check for Tool Call
    if msg.tool_calls:
        tool_call = msg.tool_calls[0]
        func_name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)
        
        print(f"   🛠 Executing Tool: {func_name}")
        
        tool_result = ""
        
        # 3. Execute Python Function
        if func_name == "search_events":
            tool_result = await search_events_tool(args.get("query"), args.get("count", 5))
        elif func_name == "create_event":
            tool_result = await create_event_tool(args["summary"], args["start_time_str"], args.get("duration_minutes", 60))
        elif func_name == "delete_event":
            tool_result = await delete_event_tool(args["event_id"])

        # 4. Return Result to LLM
        messages.append(msg)
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "content": str(tool_result)
        })

        # 5. Get Final Answer
        final = await client.chat.completions.create(
            model="gpt-4o",
            messages=messages
        )
        return final.choices[0].message.content

    return msg.content