import os
import aiohttp
import json
import logging
from series_hackathon.backend.tools.match_state import save_pending_request, check_and_clear_pending, save_last_suggestion, get_last_suggestion
from dotenv import load_dotenv
load_dotenv()
# Configure simple logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- CONFIG ---
HARDCODED_MATCH = {
    "name": "Harsh Shah",
    "role": "Senior Frontend Engineer at Google",
    "interests": ["React", "UI/UX Design", "Hackathons"],
    "phone": "+15164341033",
    "bio": "I love mentoring junior devs on building sleek user interfaces. Open to chats."
}

MOCK_USER_DATABASE = {
    "harsh": "+15164341033",
    "sarah": "+15559876543",
    "mike": "+15551112222",
    "john": "+19342463396"
}
MY_BOT_NUMBER = "+16463450518"

SERVICE_URL = "https://series-hackathon-service-202642739529.us-east1.run.app/api"
API_KEY = os.getenv('api_key')

async def find_match_tool(user_phone_number):
    """
    Returns the profile AND saves it as the 'Last Suggestion'.
    """
    match = HARDCODED_MATCH
    # Optionally save this match as last suggestion for the user
    try:
        save_last_suggestion(user_phone_number, match["phone"])
    except Exception:
        # Non-fatal
        pass
    return json.dumps(match)

async def _post_try(session, url, headers, payload):
    """
    Post payload and attempt to parse response. Returns tuple(status, json_or_text).
    """
    try:
        async with session.post(url, json=payload, headers=headers) as resp:
            text = await resp.text()
            status = resp.status
            try:
                data = json.loads(text)
            except Exception:
                data = {"raw_text": text}
            return status, data
    except Exception as e:
        return None, {"error": str(e)}

def _extract_chat_id(response_json):
    """
    Try common locations for a newly-created chat id in the API's response.
    """
    if not isinstance(response_json, dict):
        return None
    # common shapes observed in this repo and typical APIs
    candidates = [
        lambda d: d.get('data', {}).get('chat_id'),
        lambda d: d.get('data', {}).get('id'),
        lambda d: d.get('chat', {}).get('uuid'),
        lambda d: d.get('chat', {}).get('id'),
        lambda d: d.get('id'),
        lambda d: d.get('chat_id'),
        lambda d: d.get('uuid'),
    ]
    for fn in candidates:
        try:
            v = fn(response_json)
            if v:
                return v
        except Exception:
            continue
    return None

async def create_instant_group_tool(user_phone, name=None):
    """
    Creates a group between User, a specific Person (by Name), and Bot.
    Uses the payload shape:
    {
      "chat": { "display_name": "...", "phone_numbers": ["+1..", "+1.."] },
      "message": { "text": "..." },
      "send_from": "+1..."
    }
    Extracts the new chat id from several possible response locations (including data.id).
    If the API already returned the initial message in the response, we won't re-post it.
    Returns a short status string suitable for sending back to the original chat.
    """
    match_phone = None
    match_name_display = "New Connection"

    # --- LOGIC A: Search by Name ---
    if name:
        print(f"   🔍 Searching database for: '{name}'...")
        search_term = name.lower().strip()

        for db_name, db_phone in MOCK_USER_DATABASE.items():
            if search_term in db_name:
                match_phone = db_phone
                match_name_display = db_name.title()
                print(f"   ✅ Found match: {match_name_display} ({match_phone})")
                break

        if not match_phone:
            return f"❌ Error: I couldn't find anyone named '{name}' in the database."

    # --- LOGIC B: Fallback to Context (Last person shown) ---
    else:
        print(f"   🔍 No name provided. Looking up last context for {user_phone}...")
        match_phone = get_last_suggestion(user_phone)
        if not match_phone:
            return "❌ Error: I don't know who to connect you with. Provide a name or ask to find a match first."

    # --- Create payload ---
    group_name = f"Intro: You & {match_name_display} 🚀"
    intro_message = (
        f"👋 Hi everyone! I've created this group to introduce you two.\n\n"
        f"User A: {user_phone}\n"
        f"User B: {match_phone}\n\n"
        "I'll let you take it from here!"
    )

    url = f"{SERVICE_URL}/chats"
    payload = {
        "chat": {"display_name": group_name, "phone_numbers": [user_phone, match_phone]},
        "message": {"text": intro_message},
        "send_from": MY_BOT_NUMBER
    }
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

    print(f" 🚀 CREATING GROUP: {group_name} with {match_phone}")

    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, json=payload, headers=headers) as resp:
                text = await resp.text()
                status = resp.status
                try:
                    data = await resp.json()
                except Exception:
                    data = {"raw_text": text}

                if status in (200, 201):
                    # extract chat id from likely spots (including the `data.id` you observed)
                    new_id = None
                    if isinstance(data, dict):
                        # data may be: {'data': {'id': ... , ...}}
                        new_id = data.get('data', {}).get('chat_id') or data.get('data', {}).get('id')
                        new_id = new_id or data.get('chat', {}).get('uuid') if data.get('chat') else new_id
                        new_id = new_id or data.get('chat', {}).get('id') if data.get('chat') else new_id
                        new_id = new_id or data.get('id') or data.get('chat_id') or data.get('uuid')
                    # If we still have no id, return response for debugging
                    if not new_id:
                        return f"✅ Group created (status {status}) but no chat id parsed. Full response: {data}"

                    # If API already included chat_messages in response, use that and avoid posting again
                    already_has_msg = False
                    if isinstance(data, dict):
                        if data.get('data', {}).get('chat_messages') or data.get('chat_messages'):
                            already_has_msg = True

                    # If the API didn't already include the intro message, post it explicitly to new chat
                    if not already_has_msg:
                        post_msg_url = f"{SERVICE_URL}/chats/{new_id}/chat_messages"
                        post_payload = {"message": {"text": intro_message}}
                        async with session.post(post_msg_url, json=post_payload, headers=headers) as post_resp:
                            if post_resp.status not in (200, 201):
                                post_text = await post_resp.text()
                                return f"✅ Group created with {match_name_display}. Chat ID: {new_id} (⚠️ failed to post intro message: {post_resp.status} {post_text})"
                    # save last suggestion (non-fatal)
                    try:
                        save_last_suggestion(user_phone, match_phone)
                    except Exception:
                        pass
                    return f"✅ SUCCESS! Group created with {match_name_display}. Chat ID: {new_id}"

                else:
                    # Non-success HTTP status
                    return f"❌ API Error {status}: {text}"

        except Exception as e:
            return f"❌ NETWORK ERROR while creating group: {e}"