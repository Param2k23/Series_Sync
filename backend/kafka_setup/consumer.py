from aiokafka import AIOKafkaConsumer as KafkaConsumer
import json
import os
import ssl
import certifi
from dotenv import load_dotenv

# Build a path to: series_hackathon/backend/.env
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
env_path = os.path.abspath(env_path)

print("Loading .env from:", env_path)
load_dotenv(env_path)

SERVICE_URL = "https://series-hackathon-service-202642739529.us-east1.run.app/api/chats"
MY_BOT_NUMBER = "+16463450518"

def create_consumer(topic=None, bootstrap_servers=None, api_key=None, api_secret=None, group_id=None):
    """
    Return an initialized AIOKafkaConsumer subscribed to `topic`.
    Reads from env vars if args are None.
    
    NOTE: Since this is AIOKafka, you must call `await consumer.start()` 
    in your async code before consuming.
    """

    bootstrap = bootstrap_servers or os.getenv('bootstrap_servers')
    if not bootstrap:
        raise ValueError('bootstrap_servers is required (arg or env var `bootstrap_servers`)')

    username = 'QRHNR6BCKVHD4M3U'
    password = api_secret or os.getenv('api_secret')
    if not username or not password:
        raise ValueError('api_key and api_secret are required (args or env vars `api_key` and `api_secret`)')
    
    group = 'team-cg-91abd2354c1c42b0a1caaf16c18b93a6'
    topic = topic or os.getenv('topic_name')
    
    # SSL Context is required for SASL_SSL in aiokafka to verify certificates
    ssl_context = ssl.create_default_context(cafile=certifi.where())

    configs = {
        'bootstrap_servers': bootstrap.split(','),
        'security_protocol': 'SASL_SSL',
        'sasl_mechanism': 'PLAIN',
        'ssl_context': ssl_context,
        'value_deserializer': lambda m: json.loads(m.decode('utf-8')),
        'auto_offset_reset': 'latest',
        'enable_auto_commit': False,
        'sasl_plain_username': username,
        'sasl_plain_password': password,
        'fetch_max_wait_ms': 50,
        'max_poll_records': 1,
        'fetch_min_bytes': 1
    }

    if group is not None:
        configs['group_id'] = group

    # Returns the async consumer instance
    return KafkaConsumer(topic, **configs)