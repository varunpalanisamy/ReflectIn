import requests
from app.config import GEMINI_API_KEY

def process_vent(vent_text: str):
    """
    Send the vent text to the Gemini API to get a summary and a reflective prompt.
    """
    if not GEMINI_API_KEY:
        return "Error: API key not set", "Please configure your GEMINI_API_KEY."

    payload = {
        "contents": [
            {
                "parts": [{"text": vent_text}],
                "role": "user"
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 100,
            "temperature": 0.7,
            "topP": 0.9,
            "topK": 40
        }
    }

    headers = {
        "Content-Type": "application/json"
    }

    try:
        response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json=payload,
            headers=headers
        )
        response.raise_for_status()
        data = response.json()

        summary = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No summary available.")
        prompt = "What emotions were you feeling when this happened?"

        return summary, prompt

    except requests.exceptions.RequestException as e:
        return f"Error: {str(e)}", "Could you tell me more about what happened?"
