import asyncio
import json
import os
import ssl
import certifi
import aiohttp
from series_hackathon.backend.kafka_setup.consumer import create_consumer
from dotenv import load_dotenv
from aiokafka.structs import TopicPartition
from series_hackathon.backend.agents.main_agent import route_query
from series_hackathon.backend.agents.networking_agent import run_networking_agent
from series_hackathon.backend.agents.pa import run_personal_agent

# Load environment variables
env_path = os.path.join(os.path.dirname(__file__), "..", ".env")
load_dotenv(os.path.abspath(env_path))

# --- CONFIGURATION ---
BASE_API_URL = "https://series-hackathon-service-202642739529.us-east1.run.app/api"
TOPIC_NAME = os.getenv('topic_name')
API_KEY = os.getenv('HACKATHON_API_KEY') or os.getenv('api_key')

# --- QUEUE SETTINGS ---
# If the user spams more than 3 messages, we warn them.
SPAM_THRESHOLD = 3 

# --- SEND REPLY FUNCTION ---
async def send_reply(session, chat_id, text):
    if not API_KEY:
        print("❌ CRITICAL: No API_KEY found.")
        return

    url = f"{BASE_API_URL}/chats/{chat_id}/chat_messages"
    payload = {"message": {"text": text}}
    headers = {"Content-Type": "application/json", "Authorization": f"Bearer {API_KEY}"}

    try:
        async with session.post(url, json=payload, headers=headers) as resp:
            if resp.status not in [200, 201]:
                print(f" ❌ API ERROR {resp.status}")
    except Exception as e:
        print(f" ❌ NETWORK ERROR: {e}")

# --- THE WORKER (PROCESSOR) ---
async def worker(queue, session, consumer):
    """
    Processes messages STRICTLY in order.
    This guarantees that Offset 100 is never committed before Offset 99.
    """
    while True:
        # 1. Get the next message from the queue
        msg = await queue.get()
        
        try:
            # Check if user is spamming (Queue pileup)
            q_size = queue.qsize()
            
            data_json = msg.value
            event_type = data_json.get("event_type")
            
            if event_type == "message.received":
                data = data_json.get('data', {})
                chat_id = data.get('chat_id')
                text = data.get('text')
                sender = data.get('from_phone')
                print(data_json)
                await send_reply(session, chat_id, "🤔 Thinking...")
                func_name, args = await route_query(text)
                print(f'Router chose: {func_name} with args: {args}')

                final_response = ""
                
                if func_name == "call_networking_agent":
                    # Placeholder for now
                    query = args.get("rewritten_query")
                    context = args.get("context_type")
                    final_response = await run_networking_agent(query,context, session, chat_id,sender)
                    # TODO: await networking_agent.process(rewritten_text)
                    
                elif func_name == "call_personal_agent":
                    # Placeholder for now
                    query = args.get("rewritten_query")
                    final_response = await run_personal_agent(query, session, chat_id)
                     # TODO: await personal_agent.process(rewritten_text)

                # 3. Send final result to WhatsApp
                await send_reply(session, chat_id, final_response)

            # 2. CRITICAL: Commit offset ONLY after successful processing
            # This ensures if the bot crashes, we re-read the message next time.
            tp = TopicPartition(msg.topic, msg.partition)
            await consumer.commit({tp: msg.offset + 1})
            # print(f"  ✅ Committed Offset {msg.offset}")

        except Exception as e:
            print(f"❌ Worker Error: {e}")
            # Optional: Add logic here to NOT commit if you want to retry later
        
        finally:
            # Tell the queue we are done with this item
            queue.task_done()

# --- MAIN LOOP ---
async def main():
    print("--- 🤖 STARTING ROBUST BOT (QUEUE MODE) 🤖 ---")
    
    # 1. Start Consumer
    try:
        consumer = create_consumer()
        await consumer.start()
        print(f"✅ Kafka Connected! Listening to topic: {TOPIC_NAME}")
    except Exception as e:
        print(f"❌ KAFKA CONNECTION FAILED: {e}")
        return

    # 2. Create the Queue (Buffer)
    message_queue = asyncio.Queue()

    async with aiohttp.ClientSession() as session:
        # 3. Start the Worker (Background Process)
        # This runs forever and eats messages from the queue
        worker_task = asyncio.create_task(worker(message_queue, session, consumer))
        
        print("👀 Waiting for messages...")

        try:
            # 4. The Collector Loop (Fast)
            # Its ONLY job is to grab from Kafka and dump into Queue.
            async for msg in consumer:
                # Put in queue immediately. Don't process here.
                message_queue.put_nowait(msg) 
                
        except Exception as e:
            print("❌ Consumer error:", e)
        finally:
            print("🛑 Shutting down...")
            # Cancel the worker
            worker_task.cancel()
            await consumer.stop()

if __name__ == "__main__":
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        pass