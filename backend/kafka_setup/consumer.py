from kafka import KafkaConsumer
import json
import os
from dotenv import load_dotenv

# Build a path to: series_hackathon/backend/.env
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
env_path = os.path.abspath(env_path)

print("Loading .env from:", env_path)
load_dotenv(env_path)

def create_consumer(topic=None, bootstrap_servers=None, api_key=None, api_secret=None, group_id=None):
    """
    Return an initialized KafkaConsumer subscribed to `topic`.
    Reads from env vars if args are None:
      - bootstrap_servers (comma-separated string)
      - api_key
      - api_secret
      - group_id
    """

    bootstrap = bootstrap_servers or os.getenv('bootstrap_servers')
    if not bootstrap:
        raise ValueError('bootstrap_servers is required (arg or env var `bootstrap_servers`)')

    username = 'QRHNR6BCKVHD4M3U'
    password = api_secret or os.getenv('api_secret')
    if not username or not password:
        raise ValueError('api_key and api_secret are required (args or env vars `api_key` and `api_secret`)')
    group = group_id or os.getenv('group_id')
    topic = topic or os.getenv('topic_name')
    configs = {
        'bootstrap_servers': bootstrap.split(','),
        'security_protocol': 'SASL_SSL',
        'sasl_mechanism': 'PLAIN',
        'value_deserializer': lambda m: json.loads(m.decode('utf-8')),
        'auto_offset_reset': 'earliest',
        'enable_auto_commit': True,
    }

    if group is not None:
        configs['group_id'] = group
    if username is not None:
        configs['sasl_plain_username'] = username
    if password is not None:
        configs['sasl_plain_password'] = password

    return KafkaConsumer(topic, **configs)