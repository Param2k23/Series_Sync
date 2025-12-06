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

HARDCODED_NEEL = {
    "name": "Neel Modi",
    "role": "Backend Developer",
    "interests": ["Go", "Distributed Systems", "Databases"],
    "phone": "+16315423843",  # <-- mock phone for Neel (also added to MOCK_USER_DATABASE)
    "bio": "Backend dev experienced in distributed systems and building reliable services."
}

MOCK_USER_DATABASE = {
    "harsh": "+15164341033",
    "neel": "+16315423843",
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

async def create_instant_group_tool(user_phone, names=None):
    """
    Create a group for user_phone plus multiple matches in `names`.
    Improved logging and explicit 'send_from' on follow-up message POST.
    """
    # Normalize names to list
    resolved_names = []
    if names is None:
        last = get_last_suggestion(user_phone)
        if not last:
            return "❌ Error: I don't know who to connect you with. Provide at least one name."
        resolved_phones = [last]
        display_names = ["Suggested"]
    else:
        if isinstance(names, str):
            names_list = [n.strip() for n in names.split(",") if n.strip()]
        else:
            names_list = [n.strip() for n in names if isinstance(n, str) and n.strip()]

        resolved_phones = []
        display_names = []
        for n in names_list:
            found = None
            for db_name, db_phone in MOCK_USER_DATABASE.items():
                if n.lower() in db_name.lower():
                    found = (db_name.title(), db_phone)
                    break
            if not found:
                return f"❌ Error: Couldn't find '{n}' in the database."
            display_names.append(found[0])
            resolved_phones.append(found[1])

    # Build phone_numbers list: start with user, then matched phones, dedupe preserve order
    phone_numbers = [user_phone] + list(dict.fromkeys(resolved_phones))
    group_name = f"Intro: You, {', '.join(display_names)} 🚀"

    intro_message = (
        f"👋 Hi everyone! I've created this group to introduce you.\n\n"
        + "\n".join([f"- {name}: {phone}" for name, phone in zip(['You'] + display_names, phone_numbers)])
        + "\n\nI'll let you take it from here!"
    )

    url = f"{SERVICE_URL}/chats"
    payload = {
        "chat": {"display_name": group_name, "phone_numbers": phone_numbers},
        "message": {"text": intro_message},
        "send_from": MY_BOT_NUMBER
    }

    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

    logger.info(f" 🚀 CREATING GROUP: {group_name} with phones: {phone_numbers}")
    async with aiohttp.ClientSession() as session:
        try:
            async with session.post(url, json=payload, headers=headers) as resp:
                text = await resp.text()
                status = resp.status
                # Try parse JSON but keep raw text too
                try:
                    data = await resp.json()
                except Exception:
                    data = {"raw_text": text}

                # Log full creation response for debugging
                logger.info(f"Create group response status={status} data={data}")

                if status in (200, 201):
                    # parse chat id
                    new_id = None
                    if isinstance(data, dict):
                        new_id = (data.get('data', {}).get('id')
                                  or data.get('data', {}).get('chat_id')
                                  or (data.get('chat', {}) or {}).get('uuid')
                                  or data.get('id'))

                    # If we can't parse an id, return the server response so you can inspect it
                    if not new_id:
                        return f"✅ Group created (status {status}) but couldn't parse chat id. Full response: {data}"

                    # If the server already included chat_messages, don't repost:
                    has_chat_messages = False
                    if isinstance(data, dict):
                        if (data.get('data', {}).get('chat_messages') or data.get('chat_messages')):
                            has_chat_messages = True

                    # Otherwise explicitly post the intro message into the new chat.
                    if not has_chat_messages:
                        post_msg_url = f"{SERVICE_URL}/chats/{new_id}/chat_messages"
                        post_payload = {
                            "message": {"text": intro_message},
                            "send_from": MY_BOT_NUMBER   # include explicit sender
                        }
                        logger.info(f"Posting intro message to new chat {new_id} with payload: {post_payload}")
                        async with session.post(post_msg_url, json=post_payload, headers=headers) as post_resp:
                            post_text = await post_resp.text()
                            post_status = post_resp.status
                            # Log the post response for debugging
                            logger.info(f"Post intro response status={post_status} text={post_text}")
                            if post_status not in (200, 201):
                                return (f"✅ Group created with {', '.join(display_names)}. Chat ID: {new_id} "
                                        f"(⚠️ failed to post intro: {post_status} {post_text})")

                    # Save last suggestion (best-effort)
                    try:
                        save_last_suggestion(user_phone, resolved_phones[0])
                    except Exception:
                        pass

                    return f"✅ SUCCESS! Group created with {', '.join(display_names)}. Chat ID: {new_id}"

                else:
                    # Non-success HTTP status - include server body for debugging
                    logger.warning(f"API Error creating group: status={status} body={text}")
                    return f"❌ API Error {status}: {text}"

        except Exception as e:
            logger.exception("Network error while creating group")
            return f"❌ NETWORK ERROR while creating group: {e}"