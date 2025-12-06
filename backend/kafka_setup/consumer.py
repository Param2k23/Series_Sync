# Python Kafka Consumer Example
# Install: pip install kafka-python

from kafka import KafkaConsumer
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

# Initialize Consumer
consumer = KafkaConsumer(
    topic_name,
    bootstrap_servers=bootstrap_servers.split(','),
    security_protocol='SASL_SSL',
    sasl_mechanism='PLAIN',
    sasl_plain_username=api_key,
    sasl_plain_password=api_secret,
    value_deserializer=lambda m: json.loads(m.decode('utf-8')),
    auto_offset_reset='earliest',
    enable_auto_commit=True,
    group_id='team-cg-91abd2354c1c42b0a1caaf16c18b93a6'
)

print(f"Listening to topic: {topic_name}")
print("Waiting for messages... (Press Ctrl+C to stop)")

try:
    for message in consumer:
        print(f"\nReceived message:")
        print(f"Topic: {message.topic}")
        print(f"Partition: {message.partition}")
        print(f"Offset: {message.offset}")
        print(f"Value: {message.value}")
except KeyboardInterrupt:
    print("\nStopping consumer...")
finally:
    consumer.close()