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
            "description": "Route ANY query related to connecting with people, finding matches, OR APPROVING a connection (e.g., 'Yes', 'Connect', 'Let's do it').",
            "parameters": {
                "type": "object",
                "properties": {
                    "rewritten_query": {"type": "string", "description": "Actionable query for the agent. if yes or no is the answer then forward that the user is interested in connecting"},
                    "context_type": {
                        "type": "string", 
                        "enum": ["professional", "dating", "social_outing", "event"],
                        "description": "The specific sub-category of networking."
                    },
                    "reasoning": {"type": "string"}
                },
                "required": ["rewritten_query", "context_type", "reasoning"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "call_personal_agent",
            "description": "Route queries related to the user's internal self (health, habits, solo tasks).",
            "parameters": {
                "type": "object",
                "properties": {
                    "rewritten_query": {"type": "string"},
                    "reasoning": {"type": "string"}
                },
                "required": ["rewritten_query", "reasoning"]
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