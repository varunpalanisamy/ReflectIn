def get_prompt_for_reflection(score: int, user_message: str) -> str:
    """
    Returns a full Gemini prompt based on sentiment score and user message.
    This defines how Gemini should act and what kind of reflection prompt to generate.
    """
    if score in [1, 2]:
        return (
            f"Act as a compassionate, urgent support guide. The user is likely experiencing high distress. "
            f"Validate their emotions and gently ask if they'd consider speaking to a mental health professional.\n\n"
            f"Here is the user's message:\n{user_message}\n\n"
            f"Now, write a gentle, emotionally supportive reflection prompt to help them process this."
        )
    elif score in [3, 4]:
        return (
            f"Act as an empathetic reflection coach. The user seems to be going through something heavy. "
            f"Your goal is to help them explore their emotions softly, without pushing too hard.\n\n"
            f"User message:\n{user_message}\n\n"
            f"Respond with a thoughtful, open-ended question for reflection."
        )
    elif score in [5, 6]:
        return (
            f"Act as a calm and balanced emotional assistant. The user might be in a reflective or uncertain state. "
            f"Encourage them to unpack what led to this feeling in a supportive way.\n\n"
            f"User message:\n{user_message}\n\n"
            f"Write a simple reflective question to help them make sense of their emotions."
        )
    elif score in [7, 8]:
        return (
            f"Act as an encouraging wellness coach. The user seems to be recovering or doing better. "
            f"Your job is to reinforce their strengths and ask them what helped them feel better.\n\n"
            f"User message:\n{user_message}\n\n"
            f"Create a reflection prompt that celebrates progress while inspiring growth."
        )
    elif score in [9, 10]:
        return (
            f"Act as a cheerful support figure. The user is in a great emotional state. "
            f"Congratulate them and ask a light reflection question to keep the momentum going.\n\n"
            f"User message:\n{user_message}\n\n"
            f"Write a short positive reflection question to help them stay grounded and motivated."
        )
    else:
        return (
            f"Act as a thoughtful guide. Help the user reflect on their emotions with compassion.\n\n"
            f"User message:\n{user_message}\n\n"
            f"Write a reflection prompt that helps them better understand how they feel."
        )
