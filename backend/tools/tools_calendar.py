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
async def create_event_tool(summary, start_time_str, duration_minutes=60):
    """
    Creates an event.
    start_time_str example: '2025-12-06T15:00:00'
    """
    try:
        service = get_service()
        if not service: return "❌ Error: Missing credentials.json"
        
        # Parse Time
        try:
            start_dt = datetime.datetime.fromisoformat(start_time_str)
        except ValueError:
            return "❌ Error: Date format must be ISO (YYYY-MM-DDTHH:MM:SS)"

        end_dt = start_dt + datetime.timedelta(minutes=duration_minutes)

        event_body = {
            'summary': summary,
            'start': {'dateTime': start_dt.isoformat(), 'timeZone': 'UTC'},
            'end': {'dateTime': end_dt.isoformat(), 'timeZone': 'UTC'},
        }

        event = service.events().insert(calendarId='primary', body=event_body).execute()
        return f"✅ Event Created: '{summary}' at {start_time_str} (Link: {event.get('htmlLink')})"

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