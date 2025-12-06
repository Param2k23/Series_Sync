# Python Kafka Producer Example
# Install: pip install kafka-python

from kafka import KafkaProducer
import json
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# Kafka Configuration
bootstrap_servers = os.getenv('bootstrap_servers')
topic_name = os.getenv('topic_name')
api_key = os.getenv('api_key')
api_secret = os.getenv('api_secret')

# Initialize Producer
producer = KafkaProducer(
    bootstrap_servers=bootstrap_servers.split(','),
    security_protocol='SASL_SSL',
    sasl_mechanism='PLAIN',
    sasl_plain_username=api_key,
    sasl_plain_password=api_secret,
    value_serializer=lambda v: json.dumps(v).encode('utf-8')
)

# Send a message
message = {
    'event': 'test_message',
    'data': {
        'message': 'Hello from Series Sync!',
        'timestamp': '2024-01-01T00:00:00Z'
    }
}

try:
    future = producer.send(topic_name, value=message)
    record_metadata = future.get(timeout=10)
    print(f"Message sent successfully!")
    print(f"Topic: {record_metadata.topic}")
    print(f"Partition: {record_metadata.partition}")
    print(f"Offset: {record_metadata.offset}")
except Exception as e:
    print(f"Error sending message: {e}")
finally:
    producer.close()