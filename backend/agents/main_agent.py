import os
import json
from openai import AsyncOpenAI # Make sure to pip install openai

# Initialize Client
client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))

# --- 1. DEFINING THE TOOLS (Function Definitions) ---
# This tells the LLM what capabilities it has.
tools = [
    {
        "type": "function",
        "function": {
            "name": "call_networking_agent",
            "description": (
                "Route queries related to connecting people, introductions, and matchmaking. "
                "Use this when the user asks to find, suggest, introduce, or connect two or more people, "
                "or when the user explicitly approves an introduction (e.g., 'Yes, connect me', 'Introduce me to Alice'). "
                "Examples: "
                " - 'Find a frontend engineer to mentor me', "
                " - 'Connect me with John from last week's event', "
                " - 'Yes, create that intro', "
                " - 'Introduce my friend +1555.. to Tom'. "
                "Not for scheduling personal events, setting calendar reminders, or personal tasks."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "rewritten_query": {
                        "type": "string",
                        "description": "A concise, action-ready rewrite of the user's networking request (e.g., 'connect user A with user B', 'find mentor for react dev')."
                    },
                    "context_type": {
                        "type": "string",
                        "enum": ["professional", "dating", "social_outing", "event", "mentorship", "general"],
                        "description": "High-level category of the networking request to help the networking agent choose the right flow."
                    },
                    "intent": {
                        "type": "string",
                        "enum": ["find_match", "introduce", "approve_introduction", "show_profile", "exchange_contact"],
                        "description": "Optional explicit intent label describing what the user wants to do."
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Optional internal reasoning or context summary to help the agent (not shown to user)."
                    }
                },
                "required": ["rewritten_query"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "call_personal_agent",
            "description": (
                "Route queries that manage the user's personal tasks, calendar, or settings. "
                "Use this for scheduling events, setting reminders, managing the user's calendar or personal preferences, "
                "and any request that acts on the user's own data or resources. "
                "Examples: "
                " - 'Schedule a zoom meeting and email xxxx@gmail.com from 3pm today"
                " - 'Schedule an event: Smash Karts today at 5pm for me', "
                " - 'Add dentist appointment to my calendar next Monday at 10am', "
                " - 'Remind me tomorrow to call Sarah at 3pm', "
                " - 'What's on my calendar for Friday?'. "
                "Not for creating introductions, matchmaking, or connecting two other people."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "rewritten_query": {
                        "type": "string",
                        "description": "A concise, action-ready rewrite of the user's personal request (e.g., 'create calendar event: Smash Karts, today 17:00, attendee: me'), Do not change any emails or personal details keep them as it is."
                    },
                    "reasoning": {
                        "type": "string",
                        "description": "Optional internal reasoning or context summary to help the personal agent."
                    },
                    "time_zone": {
                        "type": "string",
                        "description": "Optional timezone to schedule events in (e.g., 'America/Chicago')."
                    },
                    "explicit_action": {
                        "type": "string",
                        "enum": ["schedule_event", "set_reminder", "query_calendar", "update_event", "cancel_event"],
                        "description": "Optional explicit action label to guide the personal agent's behavior."
                    }
                },
                "required": ["rewritten_query"]
            }
        }
    }
]

# --- 2. THE ROUTING LOGIC ---
async def route_query(user_raw_input):
    """
    Takes raw input, decides which agent to call, and returns the 
    rewritten query + agent name.
    """
    
    system_persona = (
        "You are an intelligent Orchestrator Agent. Your job is to: "
        "1. Analyze the user's raw input. "
        "2. Rewrite it to be precise, clear, and context-rich. "
        "3. Route it to either the Networking Agent or the Personal Agent using the correct function call."
    )

    try:
        response = await client.chat.completions.create(
            model="gpt-3.5-turbo", # Or gpt-3.5-turbo if you want cheaper
            messages=[
                {"role": "system", "content": system_persona},
                {"role": "user", "content": user_raw_input}
            ],
            tools=tools,
            tool_choice="required", # Forces the model to pick a function
        )

        # Extract the function call
        tool_call = response.choices[0].message.tool_calls[0]
        function_name = tool_call.function.name
        arguments = json.loads(tool_call.function.arguments)
        
        return function_name, arguments

    except Exception as e:
        print(f"❌ Router Error: {e}")
        # Fallback if AI fails
        return "call_personal_agent", user_raw_input