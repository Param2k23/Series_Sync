from series_hackathon.backend.kafka_setup.producer import create_producer
import os
from dotenv import load_dotenv
load_dotenv()
topic_name = os.getenv('topic_name')
if not topic_name:
    raise ValueError('topic_name env var is required')
prod = create_producer()
print(f"Producing to topic: {topic_name}")
# Send a message
message = {
    'event': 'test_message',
    'data': {
        'message': 'Hello from Series Sync!',
        'timestamp': '2024-01-01T00:00:00Z'
    }
}

try:
    future = prod.send(topic_name, value=message)
    record_metadata = future.get(timeout=10)
    print(f"Message sent successfully!")
    print(f"Topic: {record_metadata.topic}")
    print(f"Partition: {record_metadata.partition}")
    print(f"Offset: {record_metadata.offset}")
except Exception as e:
    print(f"Error sending message: {e}")
finally:
    prod.close()
