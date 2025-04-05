import requests
from textblob import TextBlob
import spacy
from app.config import GEMINI_API_KEY

# Load SpaCy model for context analysis
nlp = spacy.load("en_core_web_sm")

def analyze_sentiment(text):
    """
    Perform sentiment analysis on the given text using TextBlob.
    The sentiment score will be normalized to a scale of 1-10.
    """
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity  # Range: -1 to 1

    # Normalize polarity to a scale of 1-10
    sentiment_score = int(((polarity + 1) / 2) * 9) + 1  # Ensure it's between 1-10

    if sentiment_score > 6:
        sentiment_label = "Positive"
    elif sentiment_score < 4:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"

    return {
        "polarity": polarity,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label
    }

def analyze_context(text):
    """
    Perform context analysis using SpaCy to extract entities and topics.
    """
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents]
    topics = set([token.lemma_ for token in doc if token.is_alpha and not token.is_stop])

    return {
        "entities": entities,
        "topics": list(topics)
    }

def process_vent(vent_text: str):
    """
    Send the vent text to the Gemini API to get a summary and a reflective prompt.
    """
    # Check if API key is set
    if not GEMINI_API_KEY:
        return {
            "summary": "Error: API key not set",
            "reflective_prompt": "Please configure your GEMINI_API_KEY.",
            "sentiment": {"polarity": 0, "sentiment_score": 5, "sentiment_label": "Neutral"},
            "context": {"entities": [], "topics": []}
        }

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

        # Extract the summary from the response
        summary = data.get("candidates", [{}])[0].get("content", {}).get("parts", [{}])[0].get("text", "No summary available.")
        prompt = "What emotions were you feeling when this happened?"

        # Sentiment and context analysis
        sentiment_result = analyze_sentiment(vent_text)
        context_result = analyze_context(vent_text)

        return {
            "summary": summary,
            "reflective_prompt": prompt,
            "sentiment": sentiment_result,
            "context": context_result
        }

    except requests.exceptions.RequestException as e:
        return {
            "summary": f"Error: {str(e)}",
            "reflective_prompt": "Could you tell me more about what happened?",
            "sentiment": {"polarity": 0, "sentiment_score": 5, "sentiment_label": "Neutral"},
            "context": {"entities": [], "topics": []}
        }
