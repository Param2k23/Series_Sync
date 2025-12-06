# series_hackathon/backend/agents.py
import json
import os
from openai import AsyncOpenAI
from series_hackathon.backend.tools.networking import (
    find_match_tool, 
    create_instant_group_tool
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

networking_tools = [
    {
        "type": "function",
        "function": {
            "name": "find_match",
            "description": "Find a profile to show the user.",
        }
    },
    {
        "type": "function",
        "function": {
            "name": "connect_instantly",
            "description": "Used to connect users, call this when user specifically asks to connect with someone.",
            "parameters": {
                "type": "object",
                "properties": {
                    # Optional, because the tool will auto-lookup from memory
                    "name": {"type": "string"},
                    "names": {
                        "type": "array",
                        "items": {"type": "string"},
                        "description": "List of names to include in the group."
                    }
                },
                "required": ["name"]
            }
        }
    }
]

async def run_networking_agent(query, context, session, chat_id, user_phone):
    print(f"\n👔 [NETWORKING AGENT] User: {user_phone} | Query: {query}")

    system_prompt = (
        f"You are a Super-Connector AI. User Phone: {user_phone}.\n"
        "FLOW:\n"
        "1. If user asks to find someone -> Call 'find_match'. Present the result.\n"
        "2. If user says 'YES', 'Connect me ...', or 'Looks good' -> Call 'connect_instantly'.\n"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": query}
    ]

    response = await client.chat.completions.create(
        model="gpt-4o", messages=messages, tools=networking_tools, tool_choice="auto"
    )

    msg = response.choices[0].message

    if msg.tool_calls:
        tool_call = msg.tool_calls[0]
        func_name = tool_call.function.name
        args = json.loads(tool_call.function.arguments)

        print(f"   🛠 Tool: {func_name}")
        tool_result = ""

        if func_name == "find_match":
            tool_result = await find_match_tool(user_phone)

        elif func_name == "connect_instantly":
            # If you later support multiple names, adapt here to pass a list
            tool_result = await create_instant_group_tool(user_phone, args.get("name"))

        # --- IMPORTANT: attach the assistant message that made the tool call ---
        messages.append(msg)

        # Prepare the tool response content (stringify dicts/lists)
        if isinstance(tool_result, (dict, list)):
            tool_content = json.dumps(tool_result)
        else:
            tool_content = str(tool_result)

        # Append a properly formatted tool-response message so the API accepts it:
        # Must include role="tool", tool_call_id (from the original tool_call), name (tool name), and content.
        messages.append({
            "role": "tool",
            "tool_call_id": tool_call.id,
            "name": func_name,
            "content": tool_content
        })

        # Now call the model again with the assistant -> tool response included
        final_res = await client.chat.completions.create(model="gpt-4o", messages=messages)
        return final_res.choices[0].message.content

    return msg.content