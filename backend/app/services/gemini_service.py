import requests
from textblob import TextBlob
import spacy
from app.config import GEMINI_API_KEY
from app.prompts import get_prompt_for_reflection
from app.config import conversations
from .filtering import query_similar_entries, get_prompt_for_reflection_with_memory, query_similar_entries_with_thread
from datetime import datetime
from uuid import uuid4


def save_conversation(user_id, thread_id, topic, user_message, summary, bot_reply, sentiment, context):
    entry = {
        "user_id": user_id,
        "thread_id": thread_id,
        "topic": topic,
        "user_message": user_message,
        "summary": summary,
        "bot_reply": bot_reply,
        "sentiment": sentiment,
        "context": context,
        "timestamp": datetime.utcnow()
    }
    conversations.insert_one(entry)


# Load SpaCy model for context analysis
nlp = spacy.load("en_core_web_md")

def analyze_sentiment(text):
    analysis = TextBlob(text)
    polarity = analysis.sentiment.polarity
    sentiment_score = int(((polarity + 1) / 2) * 9) + 1

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

    # doc = nlp(text)
    # entities = [ent.text for ent in doc.ents]
    # topics = set([token.lemma_ for token in doc if token.is_alpha and not token.is_stop])

    """
    Perform context analysis using SpaCy to extract entities and topics,
    filtering out filler words.
    """
    doc = nlp(text)
    entities = [ent.text for ent in doc.ents]
    
    # Define a set of common filler words you want to ignore
    filler_words = {
    "like", "uh", "um", "you know", "so", "actually", "basically", "literally", "just",
    "well", "okay", "right", "yeah", "y'know", "I mean", "sort of", "kind of", "sorta", "kinda",
    "anyway", "really", "actually", "honestly", "truthfully", "in fact", "you see", "mind you",
    "at the end of the day", "to be honest", "to be fair", "you get me", "whatever", "stuff",
    "things", "thing", "obviously", "apparently", "clearly", "seriously", "basically", "literally",
    "probably", "maybe", "perhaps", "like I said", "I guess", "I suppose", "I think", "I believe",
    "you know what I mean", "you know what I'm saying", "as I was saying", "for sure", "I reckon",
    "to be clear", "to be real", "let me think", "hold on", "wait a minute", "give me a sec", "I feel like",
    "it seems like", "it looks like", "it sounds like", "it feels like", "to be honest", "if that makes sense",
    "at the end of the day", "in my opinion", "from my perspective", "from my point of view",
    "from what I can tell", "from what I understand", "you know what I mean", "as far as I know",
    "kind of like", "sort of like", "more or less", "give or take", "more like", "less like",
    "if that makes sense", "to some extent", "to a certain extent", "to a degree", "at least",
    "at most", "in some way", "in a way", "in some sense", "in a sense", "kind of", "sort of",
    "somehow", "somewhat", "in other words", "in a nutshell", "basically", "generally speaking",
    "for the most part", "by and large", "at this point", "to this day", "to this moment",
    "to this extent", "to this degree", "for instance", "for example", "like for instance",
    "you could say", "in a manner of speaking", "in a way of speaking", "for what it's worth",
    "on the whole", "in a way of thinking", "so to speak", "as it were"
    }

    
    topics = set(
        token.lemma_.lower()
        for token in doc 
        if token.is_alpha 
           and not token.is_stop 
           and token.lemma_.lower() not in filler_words
    )
    

    return {
        "entities": entities,
        "topics": list(topics)
    }


def process_vent(vent_text: str):
    if not GEMINI_API_KEY:
        return {
            "summary": "Error: API key not set",
            "bot_reply": "Please configure your GEMINI_API_KEY.",
            "sentiment": {"polarity": 0, "sentiment_score": 5, "sentiment_label": "Neutral"},
            "context": {"entities": [], "topics": []}
        }

    sentiment_result = analyze_sentiment(vent_text)
    context_result = analyze_context(vent_text)
    
    user_id = "shivani"  # (Replace with dynamic user info as needed)

    # First, query for similar past entries using the current vent text.
    existing_thread_id, memory_context = query_similar_entries_with_thread(user_id, vent_text)
    
    thread_id = existing_thread_id if existing_thread_id else str(uuid4())
    
    
    summary_prompt = {
        "contents": [
            {
                "parts": [{"text": f"Summarize this vent in 1-2 sentences without giving advice:\n\n{vent_text}"}],
                "role": "user"
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 100,
            "temperature": 0.3
        }
    }
    
    # Decide which prompt to use:
    if memory_context:
        # If memory exists, use the previously aggregated summary (or any chosen previous summary) as memory
        reflective_prompt_text = get_prompt_for_reflection_with_memory(
            sentiment_result["sentiment_score"], vent_text, summary_prompt
        )
    else:
        reflective_prompt_text = get_prompt_for_reflection(sentiment_result["sentiment_score"], vent_text)


    reflection_prompt = {
        "contents": [
            {
                "parts": [{"text": reflective_prompt_text}],
                "role": "user"
            }
        ],
        "generationConfig": {
            "maxOutputTokens": 100,
            "temperature": 0.7
        }
    }

    headers = {"Content-Type": "application/json"}

    try:
        summary_response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json=summary_prompt,
            headers=headers
        )
        reflection_response = requests.post(
            f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key={GEMINI_API_KEY}",
            json=reflection_prompt,
            headers=headers
        )

        summary_response.raise_for_status()
        reflection_response.raise_for_status()

        summary_data = summary_response.json()
        try:
            summary_text = summary_data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError):
            summary_text = "No summary available."
            
        reflection_data = reflection_response.json()
        try:
            reflection_text = reflection_data["candidates"][0]["content"]["parts"][0]["text"]
        except (KeyError, IndexError, TypeError):
            reflection_text = "How are you feeling now?"
        
        # Determine topic from context
        topic = context_result["topics"][0] if context_result["topics"] else "general"

        # Save the conversation to MongoDB
        save_conversation(
            user_id=user_id,
            thread_id=thread_id,
            topic=topic,
            user_message=vent_text,
            summary=summary_text,
            bot_reply=reflection_text,
            sentiment=sentiment_result,
            context=context_result
        )

        return {
            "user_message": vent_text,
            "topic": topic,
            "summary": summary_text,
            "bot_reply": reflection_text,
            "thread_id": thread_id,  # Optionally return thread_id for debugging or UI
            "sentiment": sentiment_result,
            "context": context_result
        }

    except requests.exceptions.RequestException as e:
        return {
            "user_message": vent_text,
            "topic": topic,
            "summary": "Summary unavailable due to an error.",
            "bot_reply": "Could you tell me more about what happened?",
            "thread_id": thread_id,
            "sentiment": sentiment_result,
            "context": context_result
        }