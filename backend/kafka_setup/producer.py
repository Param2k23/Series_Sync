from kafka import KafkaProducer
import json
import os
from dotenv import load_dotenv
import certifi
import ssl

# Build a path to: series_hackathon/backend/.env
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
env_path = os.path.abspath(env_path)

print("Loading .env from:", env_path)
load_dotenv(env_path)

def create_producer(bootstrap_servers=None, api_key=None, api_secret=None):
    """
    Return an initialized KafkaProducer.
    Reads from env vars if args are None:
      - bootstrap_servers (comma-separated string)
      - api_key
      - api_secret
    """
    bootstrap = bootstrap_servers or os.getenv('bootstrap_servers')
    if not bootstrap:
        raise ValueError('bootstrap_servers is required (arg or env var `bootstrap_servers`)')

    print(f"Creating Kafka producer for servers: {bootstrap}")
    username = 'QRHNR6BCKVHD4M3U'
    print(f"Using username: {username}")
    password = api_secret or os.getenv('api_secret')
    print(f"Using password: {password}")
    if not username or not password:
        raise ValueError('api_key and api_secret are required (args or env vars `api_key` and `api_secret`)')
    context = ssl.create_default_context(cafile=certifi.where())
    configs = {
        'bootstrap_servers': bootstrap.split(','),
        'security_protocol': 'SASL_SSL',
        'sasl_mechanism': 'PLAIN',
        'ssl_context': context,
        'value_serializer': lambda v: json.dumps(v).encode('utf-8'),
    }
    if username is not None:
        configs['sasl_plain_username'] = username
    if password is not None:
        configs['sasl_plain_password'] = password

    return KafkaProducer(**configs)