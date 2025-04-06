from apscheduler.schedulers.background import BackgroundScheduler
from datetime import datetime, timedelta
import random
from app.config import conversations

def generate_generic_notification_message():
    # A generic, friendly notification message
    return "ReflectIn would love to know: How are you feeling now?"

def send_followup_notification():
    now = datetime.utcnow()
    # Only consider conversations from the last 5 minutes
    recent_threshold = now - timedelta(minutes=5)
    last_convo = conversations.find_one(
        {"timestamp": {"$gte": recent_threshold}, "bot_reply": {"$exists": True}},
        sort=[("timestamp", -1)]
    )
    
    if not last_convo:
        return  # No recent conversation, do nothing

    last_timestamp = last_convo.get("timestamp")
    if not last_timestamp:
        return
    
    # Check if the conversation has been quiet for more than 15 seconds
    delta = (now - last_timestamp).total_seconds()
    if delta <= 15:
        return  # Conversation is still active, do nothing

    notifications_sent = last_convo.get("notifications_sent", 0)
    if notifications_sent == 0:
        # Send the first notification
        notification_text = generate_generic_notification_message()
        print(notification_text)  # Print only the notification message
        conversations.update_one(
            {"_id": last_convo["_id"]},
            {"$set": {"notifications_sent": 1, "first_notification_time": now}}
        )
    elif notifications_sent == 1:
        first_notification_time = last_convo.get("first_notification_time")
        if first_notification_time and (now - first_notification_time).total_seconds() > 15:
            # Send the second notification
            notification_text = generate_generic_notification_message()
            print(notification_text)  # Print only the notification message
            conversations.update_one(
                {"_id": last_convo["_id"]},
                {"$set": {"notifications_sent": 2}}
            )

def start_scheduler():
    scheduler = BackgroundScheduler()
    # For testing: check every 5 seconds if a notification should be sent.
    scheduler.add_job(send_followup_notification, 'interval', seconds=5, id='notify_check')
    scheduler.start()
