# libs/core/whatsapp.py

import urllib.parse

def build_whatsapp_link(message: str, number: str = "91XXXXXXXXXX") -> str:
    """
    Returns a WhatsApp URL that opens a pre-filled message.
    Example:
    https://wa.me/91XXXXXXXXXX?text=Hello%20World
    """
    encoded_message = urllib.parse.quote(message)
    return f"https://wa.me/{number}?text={encoded_message}"
