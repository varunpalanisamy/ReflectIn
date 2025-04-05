import requests
from app.config import GEMINI_API_KEY

def process_vent(vent_text: str):
    """
    Send the vent text to the Gemini API to get a summary and a reflective prompt.
    """
    # Check if API key is set
    if not GEMINI_API_KEY:
        return "Error: API key not set", "Please configure your GEMINI_API_KEY."

    payload = {
        "prompt": {
            "text": vent_text
        },
        "model": "models/gemini-2.0-flash",
        "parameters": {
            "max_output_tokens": 100,
            "temperature": 0.7,
            "top_p": 0.9,
            "top_k": 40
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

        # Extract the summary from the response
        summary = data.get("candidates", [{}])[0].get("output", "No summary available.")
        prompt = "What emotions were you feeling when this happened?"

        return summary, prompt

    except requests.exceptions.RequestException as e:
        return f"Error: {str(e)}", "Could you tell me more about what happened?"
