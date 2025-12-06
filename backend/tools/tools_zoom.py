# series_hackathon/backend/tools/tools_zoom.py
import os
import json
import datetime
import asyncio
import aiohttp
import smtplib
from email.message import EmailMessage

SERVICE_ZOOM_API = "https://api.zoom.us/v2"
ZOOM_TOKEN = os.getenv("ZOOM_BEARER_TOKEN")  # Recommended: Server-to-Server OAuth token or JWT token
SMTP_HOST = os.getenv("SMTP_HOST")
SMTP_PORT = int(os.getenv("SMTP_PORT", "587"))
SMTP_USER = os.getenv("SMTP_USER")
SMTP_PASS = os.getenv("SMTP_PASS")
EMAIL_FROM = os.getenv("EMAIL_FROM", SMTP_USER)

async def _create_zoom_meeting_http(topic, start_time_iso, duration_minutes=60, timezone="UTC", host_user_id=None):
    """
    Call Zoom API to create a meeting. `host_user_id` is an email or 'me'/'userId'.
    Expects ZOOM_BEARER_TOKEN to be set as a Bearer token.
    Returns dict response or raises.
    """
    if not ZOOM_TOKEN:
        return {"error": "Missing ZOOM_BEARER_TOKEN environment variable."}

    if not host_user_id:
        host_user_id = "me"

    url = f"{SERVICE_ZOOM_API}/users/{host_user_id}/meetings"
    headers = {
        "Authorization": f"Bearer {ZOOM_TOKEN}",
        "Content-Type": "application/json"
    }

    payload = {
        "topic": topic,
        "type": 2,  # scheduled meeting
        "start_time": start_time_iso,  # RFC3339 / ISO format with timezone
        "duration": int(duration_minutes),
        "timezone": timezone,
        "settings": {
            "join_before_host": False,
            "approval_type": 0
        }
    }

    async with aiohttp.ClientSession() as session:
        async with session.post(url, json=payload, headers=headers) as resp:
            text = await resp.text()
            try:
                data = await resp.json()
            except Exception:
                data = {"raw": text}
            return {"status": resp.status, "data": data}

def _send_email_sync(subject, html_body, recipients, from_addr=EMAIL_FROM):
    """
    Synchronous SMTP send (used inside run_in_executor).
    Simple text/HTML email. Uses STARTTLS by default.
    """
    if not (SMTP_HOST and SMTP_USER and SMTP_PASS):
        return {"error": "SMTP configuration missing (SMTP_HOST/SMTP_USER/SMTP_PASS)"}
    try:
        msg = EmailMessage()
        msg["Subject"] = subject
        msg["From"] = from_addr
        msg["To"] = ", ".join(recipients)
        msg.set_content(html_body)
        msg.add_alternative(f"""\
        <html>
          <body>
            {html_body}
          </body>
        </html>
        """, subtype='html')

        with smtplib.SMTP(SMTP_HOST, SMTP_PORT) as smtp:
            smtp.ehlo()
            smtp.starttls()
            smtp.login(SMTP_USER, SMTP_PASS)
            smtp.send_message(msg)
        return {"ok": True}
    except Exception as e:
        return {"error": str(e)}

async def send_zoom_invite_email(subject, body_text, recipients):
    """
    Async wrapper to send email using blocking smtplib in executor.
    """
    loop = asyncio.get_running_loop()
    return await loop.run_in_executor(None, _send_email_sync, subject, body_text, recipients, EMAIL_FROM)

def _ensure_iso_with_tz(start_time_str, time_zone=None):
    """
    Accepts ISO datetime strings with/without tz. If naive, attaches the provided timezone IANA name (if time_zone),
    else uses local tz. Returns ISO with offset (UTC or offset) and timezone string for Zoom `timezone` param.
    """
    try:
        # Try parsing + detect tzinfo
        dt = datetime.datetime.fromisoformat(start_time_str)
    except Exception:
        raise ValueError("start_time_str must be ISO format: YYYY-MM-DDTHH:MM:SS optionally with offset")

    if dt.tzinfo is None:
        # attach timezone (try ZoneInfo if available)
        try:
            if time_zone:
                from zoneinfo import ZoneInfo
                tz = ZoneInfo(time_zone)
            else:
                tz = datetime.datetime.now().astimezone().tzinfo
            dt = dt.replace(tzinfo=tz)
        except Exception:
            # fallback to local tz offset
            dt = dt.replace(tzinfo=datetime.datetime.now().astimezone().tzinfo)

    # Zoom accepts ISO with offset; return iso and timezone label
    return dt.isoformat(), getattr(dt.tzinfo, 'key', None) or "UTC"

async def create_zoom_and_email(topic, start_time_str, duration_minutes, emails, host_user_email=None, time_zone=None):
    """
    High-level helper:
    - creates a Zoom meeting (expects ZOOM_BEARER_TOKEN)
    - emails join_url to `emails` list
    Returns a summary dict or error message string.
    """
    try:
        start_iso, tz_label = _ensure_iso_with_tz(start_time_str, time_zone)
    except Exception as e:
        return f"❌ Error parsing start time: {e}"

    # Create meeting
    resp = await _create_zoom_meeting_http(topic, start_iso, duration_minutes=duration_minutes, timezone=tz_label, host_user_id=host_user_email)
    if resp.get("status") is None:
        return f"❌ Zoom request failed: {resp}"

    if resp["status"] not in (200, 201):
        return f"❌ Zoom API Error {resp['status']}: {resp['data']}"

    meeting_data = resp["data"]
    join_url = meeting_data.get("join_url") or meeting_data.get("join_url")
    start_url = meeting_data.get("start_url")
    meeting_id = meeting_data.get("id") or meeting_data.get("uuid")

    if not join_url:
        return f"❌ Zoom created meeting but join_url missing. Response: {meeting_data}"

    # Compose email
    subject = f"Zoom Meeting: {topic} at {start_iso}"
    body = f"""You are invited to a Zoom meeting.

Topic: {topic}
Start Time: {start_iso}
Duration (mins): {duration_minutes}
Join Link: {join_url}
"""
    # Send email (async wrapper)
    email_resp = await send_zoom_invite_email(subject, body, emails)
    if email_resp.get("error"):
        return f"✅ Zoom meeting created: {join_url} (⚠️ Failed to email invite: {email_resp['error']})"

    return {
        "ok": True,
        "meeting_id": meeting_id,
        "join_url": join_url,
        "start_url": start_url,
        "emailed_to": emails
    }

async def email_meeting_link(topic, join_url, recipients, start_time_iso=None, duration_minutes=None):
    """
    Send an email containing the meeting join link to `recipients`.
    Reuses the existing `send_zoom_invite_email`.
    """
    start = f"Start Time: {start_time_iso}\n" if start_time_iso else ""
    dur = f"Duration (mins): {duration_minutes}\n" if duration_minutes else ""
    subject = f"Zoom Meeting: {topic}"
    body = f"""You are invited to a Zoom meeting.

Topic: {topic}
{start}{dur}
Join Link: {join_url}
"""
    return await send_zoom_invite_email(subject, body, recipients)