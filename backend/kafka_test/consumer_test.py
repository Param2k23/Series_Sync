from series_hackathon.backend.kafka_setup.consumer import create_consumer
import os
from dotenv import load_dotenv
load_dotenv()
cons = create_consumer()
cons.subscribe([os.getenv('topic_name')])
print(f"Listening to topic")
print("Waiting for messages... (Press Ctrl+C to stop)")

try:
    for message in cons:
        print(f"\nReceived message:")
        print(f"Topic: {message.topic}")
        print(f"Partition: {message.partition}")
        print(f"Offset: {message.offset}")
        print(f"Value: {message.value}")
except KeyboardInterrupt:
    print("\nStopping consumer...")
finally:
    cons.close()