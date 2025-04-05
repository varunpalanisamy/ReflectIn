from pymongo import MongoClient
from app.config import MONGODB_URI

client = None
db = None

def init_db():
    global client, db
    client = MongoClient(MONGODB_URI)
    db = client.get_database("reflectin_db")
    # Ensure the collections exist
    if "sessions" not in db.list_collection_names():
        db.create_collection("sessions")
