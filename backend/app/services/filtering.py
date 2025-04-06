# filtering.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from app.config import conversations
from typing import Tuple, Optional

# Load a model with good vectors; ensure you have installed en_core_web_md
# pip install https://github.com/explosion/spacy-models/releases/download/en_core_web_md-3.5.0/en_core_web_md-3.5.0.tar.gz
nlp_md = spacy.load("en_core_web_md")  

def get_embedding(text: str) -> np.ndarray:
    """Compute an embedding vector for the text using Spacy."""
    doc = nlp_md(text)
    return doc.vector

def query_similar_entries(user_id: str, current_text: str, threshold: float = 0.75) -> str:
    """
    Query MongoDB for past entries for the given user whose summary (or user_message) 
    embedding is similar to the embedding of current_text. Returns an aggregated memory string.
    """
    current_embedding = get_embedding(current_text)
    
    # Retrieve all past entries for the user
    entries = list(conversations.find({"user_id": user_id}))
    
    memory_lines = []
    for entry in entries:
        # Use the 'summary' field if available; otherwise fall back to user_message
        past_text = entry.get("summary", "") or entry.get("user_message", "")
        if past_text:
            past_embedding = get_embedding(past_text)
            # Compute cosine similarity between current and past embeddings
            sim = cosine_similarity([current_embedding], [past_embedding])[0][0]
            if sim >= threshold:
                past_summary = entry.get("summary", "").strip()
                past_reply = entry.get("bot_reply", "").strip()
                memory_lines.append(f"Previously, you mentioned: '{past_summary}' and I replied: '{past_reply}'.")
    return "\n".join(memory_lines)

def get_prompt_for_reflection_with_memory(score: int, current_vent: str, previous_summary: str) -> str:
    """
    Returns a full Gemini prompt that uses a previous conversation summary (previous_summary),
    along with the current vent, to generate reflective advice. The tone is adjusted based on the sentiment score.
    """
    if score in [1, 2]:
        return (
            f"Act as a compassionate, urgent support guide. Previously, you mentioned: {previous_summary}. "
            f"Now, considering your current message: '{current_vent}', provide gentle and supportive reflective advice. "
            f"Limit your response to 50 words."
        )
    elif score in [3, 4]:
        return (
            f"Act as an empathetic reflection coach. Previously, you shared: {previous_summary}. "
            f"Now, with your current message: '{current_vent}', ask a thoughtful, open-ended question to explore your emotions further. "
            f"Limit your response to 50 words."
        )
    elif score in [5, 6]:
        return (
            f"Act as a calm and balanced emotional assistant. Previously, you noted: {previous_summary}. "
            f"Now, given your current message: '{current_vent}', generate a simple reflective question that helps you understand your emotions better. "
            f"Limit your response to 50 words."
        )
    elif score in [7, 8]:
        return (
            f"Act as an encouraging wellness coach. Previously, you stated: {previous_summary}. "
            f"Now, considering your current message: '{current_vent}', provide reflective advice that celebrates your progress and suggests what might help further. "
            f"Limit your response to 50 words."
        )
    elif score in [9, 10]:
        return (
            f"Act as a cheerful support figure. Previously, you shared: {previous_summary}. "
            f"Now, with your current message: '{current_vent}', generate a positive, brief reflective question that motivates you to continue your progress. "
            f"Limit your response to 50 words."
        )
    else:
        return (
            f"Act as a thoughtful guide. Previously, you mentioned: {previous_summary}. "
            f"Now, considering your current message: '{current_vent}', provide a concise reflective question to help you understand your feelings. "
            f"Limit your response to 20 words."
        )


def query_similar_entries_with_thread(user_id: str, current_text: str, threshold: float = 0.9) -> Tuple[Optional[str], str]:
    """
    Query MongoDB for past entries for the given user whose summary (or user_message) 
    embedding is similar to the embedding of current_text.
    
    Returns:
      - A thread ID (if found) from one of the similar entries, or None if no similar thread exists.
      - An aggregated memory string of the similar entries.
    """
    current_embedding = get_embedding(current_text)
    
    # Retrieve all past entries for the user
    entries = list(conversations.find({"user_id": user_id}))
    
    memory_lines = []
    thread_id_found = None
    for entry in entries:
        past_text = entry.get("summary", "") or entry.get("user_message", "")
        if past_text:
            past_embedding = get_embedding(past_text)
            sim = cosine_similarity([current_embedding], [past_embedding])[0][0]
            # Debug: Print the similarity score and the ID of the entry being compared.
            print(f"DEBUG: Comparing current_text with entry {entry.get('_id')} | Similarity: {sim:.4f}")
            if sim >= threshold:
                past_summary = entry.get("summary", "").strip()
                past_reply = entry.get("bot_reply", "").strip()
                memory_lines.append(f"Previously, you mentioned: '{past_summary}' and I replied: '{past_reply}'.")
                # Capture the thread_id from the first matching entry.
                if entry.get("thread_id") and not thread_id_found:
                    thread_id_found = entry["thread_id"]
    
    memory_context = "\n".join(memory_lines)
    return thread_id_found, memory_context
