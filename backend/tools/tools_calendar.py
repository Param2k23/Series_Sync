import os.path
import datetime
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
from googleapiclient.discovery import build

# If modifying these scopes, delete the file token.json.
SCOPES = ['https://www.googleapis.com/auth/calendar']

# Paths to your credentials (ensure these exist in your project structure)
TOKEN_FILE = 'series_hackathon/backend/token.json'
CREDENTIALS_FILE = 'series_hackathon/backend/credentials.json'

def get_service():
    """Authenticates and returns the Google Calendar Service."""
    creds = None
    if os.path.exists(TOKEN_FILE):
        creds = Credentials.from_authorized_user_file(TOKEN_FILE, SCOPES)
    
    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            creds.refresh(Request())
        else:
            if not os.path.exists(CREDENTIALS_FILE):
                return None 
            flow = InstalledAppFlow.from_client_secrets_file(CREDENTIALS_FILE, SCOPES)
            creds = flow.run_local_server(port=0)
        
        with open(TOKEN_FILE, 'w') as token:
            token.write(creds.to_json())

    return build('calendar', 'v3', credentials=creds)

# --- 1. SEARCH / LIST ---
async def search_events_tool(query=None, count=10):
    """
    Searches for upcoming events. 
    If 'query' is provided, filters by text. 
    Returns events with IDs so the Agent can delete them later.
    """
    try:
        service = get_service()
        if not service: return "❌ Error: Missing credentials.json"

        now = datetime.datetime.utcnow().isoformat() + 'Z'
        
        # Call Google API
        events_result = service.events().list(
            calendarId='primary', 
            timeMin=now,
            q=query, # Filter by text (e.g., 'meeting', 'dinner')
            maxResults=count, 
            singleEvents=True,
            orderBy='startTime'
        ).execute()
        
        events = events_result.get('items', [])

        if not events:
            return f"📅 No upcoming events found for '{query}'."

        # Format output for the LLM
        result = f"📅 Found {len(events)} Events:\n"
        for event in events:
            start = event['start'].get('dateTime', event['start'].get('date'))
            # We include the ID so the LLM can use it for deletion
            result += f"- [ID: {event['id']}] {start}: {event['summary']}\n"
        
        return result

    except Exception as e:
        return f"❌ Calendar Search Error: {e}"

# --- 2. CREATE ---
async def create_event_tool(summary, start_time_str, duration_minutes=60, time_zone=None):
    """
    Creates an event.
    - start_time_str example: '2025-12-06T17:00:00' or '2025-12-06T17:00:00-05:00' or '2025-12-06T17:00:00Z'
    - If the string has no timezone offset, we assume the system local timezone (or `time_zone` if provided),
      convert to UTC and send UTC ISO to Google Calendar to avoid shifts.
    """
    try:
        service = get_service()
        if not service:
            return "❌ Error: Missing credentials.json"

        # Parse Time (ISO)
        try:
            start_dt = datetime.datetime.fromisoformat(start_time_str)
        except Exception:
            return "❌ Error: Date format must be ISO (YYYY-MM-DDTHH:MM:SS) optionally with timezone offset."

        # Detect whether parsed datetime is timezone-aware
        if start_dt.tzinfo is None:
            # If caller provided an explicit IANA timezone string (e.g., 'America/Chicago'), try to use it
            try:
                if time_zone:
                    from zoneinfo import ZoneInfo  # Python 3.9+
                    tz = ZoneInfo(time_zone)
                else:
                    # Use the system local timezone
                    tz = datetime.datetime.now().astimezone().tzinfo
                # Attach the timezone to the naive datetime (interpret input as local to that zone)
                start_dt = start_dt.replace(tzinfo=tz)
            except Exception:
                # Fallback: assume system local tz offset
                start_dt = start_dt.replace(tzinfo=datetime.datetime.now().astimezone().tzinfo)

        # Convert to UTC for Google API (returns tz-aware datetime in UTC)
        start_utc = start_dt.astimezone(datetime.timezone.utc)
        end_utc = (start_dt + datetime.timedelta(minutes=duration_minutes)).astimezone(datetime.timezone.utc)

        # Prepare event body - use UTC ISO strings and indicate timeZone='UTC'
        event_body = {
            'summary': summary,
            'start': {'dateTime': start_utc.isoformat(), 'timeZone': 'UTC'},
            'end': {'dateTime': end_utc.isoformat(), 'timeZone': 'UTC'},
        }

        event = service.events().insert(calendarId='primary', body=event_body).execute()
        return f"✅ Event Created: '{summary}' at {start_dt.isoformat()} (local). Link: {event.get('htmlLink')}"

    except Exception as e:
        return f"❌ Create Event Error: {e}"

# --- 3. DELETE ---
async def delete_event_tool(event_id):
    """
    Deletes an event by its ID.
    The Agent usually searches first to get the ID, then calls this.
    """
    try:
        service = get_service()
        if not service: return "❌ Error: Missing credentials.json"

        service.events().delete(calendarId='primary', eventId=event_id).execute()
        return f"🗑️ Event {event_id} successfully deleted."

    except Exception as e:
        return f"❌ Delete Error: {e}"