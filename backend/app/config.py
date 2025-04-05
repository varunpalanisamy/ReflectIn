import os
from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")


MONGO_URI = os.getenv("MONGO_URI")
client = MongoClient(MONGO_URI)

db = client["reflectinDB"]
conversations = db["conversations"]  # one collection for now
