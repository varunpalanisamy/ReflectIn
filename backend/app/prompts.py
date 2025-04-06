def get_prompt_for_reflection(
    score: int,
    user_message: str,
    persona: str,
    band1: str,
    band2: str,
    band3: str,
    band4: str,
    band5: str
) -> str:
    """
    Returns a full Gemini prompt based on sentiment score, user message,
    and user‑selected persona + value priorities for each sentiment band.
    """
    # Common preamble using persona and values:
    preamble = (
        f"Act as a {persona} voice. "
        f"When highly distressed you value {band1}; when sad you value {band2}; "
        f"when neutral you value {band3}; when happy you value {band4}; "
        f"when elated you value {band5}.\n\n"
    )

    if score in [1, 2]:
        return (
            preamble +
            "The user is likely experiencing high distress. "
            "Validate their emotions and gently ask if they'd consider speaking to a mental health professional.\n\n"
            f"User message:\n{user_message}\n\n"
            "Now, write a gentle, emotionally supportive reflection prompt to help them process this. "
            "Limit your response to 50 words."
        )
    elif score in [3, 4]:
        return (
            preamble +
            "The user seems to be going through something heavy. "
            "Your goal is to help them explore their emotions softly, without pushing too hard.\n\n"
            f"User message:\n{user_message}\n\n"
            "Respond with a thoughtful, open-ended question for reflection. Limit your response to 50 words."
        )
    elif score in [5, 6]:
        return (
            preamble +
            "The user might be in a reflective or uncertain state. "
            "Encourage them to unpack what led to this feeling in a supportive way.\n\n"
            f"User message:\n{user_message}\n\n"
            "Write a simple reflective question to help them make sense of their emotions. Limit your response to 50 words."
        )
    elif score in [7, 8]:
        return (
            preamble +
            "The user seems to be recovering or doing better. "
            "Your job is to reinforce their strengths and ask them what helped them feel better.\n\n"
            f"User message:\n{user_message}\n\n"
            "Create a reflection prompt that celebrates progress while inspiring growth. Limit your response to 50 words."
        )
    elif score in [9, 10]:
        return (
            preamble +
            "The user is in a great emotional state. "
            "Congratulate them and ask a light reflection question to keep the momentum going.\n\n"
            f"User message:\n{user_message}\n\n"
            "Write a short positive reflection question to help them stay grounded and motivated. Limit your response to 50 words."
        )
    else:
        return (
            preamble +
            "Help the user reflect on their emotions with compassion.\n\n"
            f"User message:\n{user_message}\n\n"
            "Write a concise reflective prompt that helps them better understand how they feel. Limit your response to 20 words."
        )
