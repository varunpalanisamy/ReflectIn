# filtering.py
import numpy as np
from sklearn.metrics.pairwise import cosine_similarity
import spacy
from app.config import conversations

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

def get_prompt_for_reflection_with_memory(current_vent: str, memory_context: str) -> str:
    """
    Create a prompt that incorporates the memory context from similar past entries.
    """
    prompt = (
        f"In previous conversations, you mentioned the following:\n{memory_context}\n\n"
        f"Now, considering your current message: '{current_vent}', please provide further reflective advice that builds on the past discussion. Limit response to 50-100 words."
    )
    return prompt
