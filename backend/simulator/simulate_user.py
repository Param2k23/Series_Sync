from series_hackathon.backend.kafka_setup.producer import create_producer
import os
import time
import uuid
import datetime
from dotenv import load_dotenv

load_dotenv()
TOPIC_NAME = os.getenv('topic_name')

# --- Configuration ---
# 1. Put YOUR real cell number here if you want to see if the reply API actually texts you.
#    Or just use a fake one to test the logic.
TEST_USER_NUMBER = "+19342463396" 

# 2. Put the Bot's number here (matches the 'is_me': True logic)
BOT_NUMBER = "+16463450518" 

def create_mock_payload(text_content):
    """
    Wraps the text in the exact structure the Hackathon Service uses.
    """
    timestamp = datetime.datetime.now().isoformat()
    
    return {
        "event_id": str(uuid.uuid4()),
        "event_type": "message.received",
        "api_version": "v2",
        "created_at": timestamp,
        "data": {
            "id": str(uuid.uuid4()),
            "chat_id": "1702082", # Mock Chat ID
            "from_phone": TEST_USER_NUMBER,
            "text": text_content,
            "sent_at": timestamp,
            "is_read": False,
            "service": "SMS",
            "attachments": [],
            "reaction_id": None,
            "chat_handles": [
                {
                    "display_name": "User",
                    "identifier": TEST_USER_NUMBER,
                    "is_me": False
                },
                {
                    "display_name": "Bot",
                    "identifier": BOT_NUMBER,
                    "is_me": True
                }
            ]
        }
    }

def main():
    if not TOPIC_NAME:
        print("Error: 'topic_name' env var missing.")
        return

    producer = create_producer()
    print(f"--- 🤖 SMS Simulator 🤖 ---")
    print(f"Target Topic: {TOPIC_NAME}")
    print(f"Simulating user: {TEST_USER_NUMBER}")
    print("Type a message and press Enter to send. (Type 'quit' to exit)")
    print("------------------------------------------------")

    while True:
        try:
            user_input = input("You (User) > ")
            
            if user_input.lower() in ['quit', 'exit']:
                break
            
            if not user_input.strip():
                continue

            # Create the fake payload
            payload = create_mock_payload(user_input)
            
            # Send to Kafka
            producer.send(TOPIC_NAME, value=payload)
            producer.flush()
            print(f"   [Sent to Kafka as 'message.received']")
            
        except KeyboardInterrupt:
            break
        except Exception as e:
            print(f"Error: {e}")

    producer.close()
    print("\nSimulator closed.")

if __name__ == "__main__":
    main()