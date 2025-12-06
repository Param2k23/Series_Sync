import json
import os

STATE_FILE = "pending_matches.json"

def _load_state():
    if not os.path.exists(STATE_FILE):
        return {}
    try:
        with open(STATE_FILE, "r") as f:
            return json.load(f)
    except:
        return {}

def _save_state(data):
    with open(STATE_FILE, "w") as f:
        json.dump(data, f, indent=4)

# --- EXISTING FUNCTIONS ---
def save_pending_request(requestor_phone, target_phone):
    data = _load_state()
    # Store under target_phone so we can look it up when they reply
    data[f"pending_{target_phone}"] = requestor_phone 
    _save_state(data)

def check_and_clear_pending(target_phone):
    data = _load_state()
    key = f"pending_{target_phone}"
    if key in data:
        requestor = data.pop(key)
        _save_state(data)
        return requestor
    return None

# --- NEW CONTEXT FUNCTIONS ---
def save_last_suggestion(user_phone, match_phone):
    """Remembers who we just showed to the user."""
    data = _load_state()
    data[f"last_shown_{user_phone}"] = match_phone
    _save_state(data)

def get_last_suggestion(user_phone):
    """Retrieves the last person we showed this user."""
    data = _load_state()
    return data.get(f"last_shown_{user_phone}")