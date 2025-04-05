import os
from dotenv import load_dotenv

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

MONGODB_URI = os.getenv("MONGODB_URI", "your_default_mongodb_atlas_connection_string")
