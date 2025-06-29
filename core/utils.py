import openai
import os
import re
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

DOC_EXTRACTION_PROMPT = """
You are a solar installation assistant. Given a document's raw text, extract equipment information.

Return ONLY valid JSON in this EXACT format (all fields required):
{
  "modules": {"model": "string", "quantity": number},
  "inverter": {"model": "string", "quantity": number},
  "battery": {"model": "string", "quantity": number},
  "optimizer": {"model": "string", "quantity": number},
  "extras": ["string1", "string2"]
}

If a component is not found, use "Not specified" for model and 0 for quantity.
If extras are not found, use an empty array [].
Do not include any explanation or additional text.

Document Text:
"""

def _strip_json_fence(text: str) -> str:
    """Remove triple backticks or ```json from LLM replies."""
    # Fixed: Use single backslashes for regex patterns
    return re.sub(r"^```(?:json)?\s*|```$", "", text.strip(), flags=re.MULTILINE)

def call_openai_prompt(prompt: str) -> str:
    """Use OpenAI v1.x API to send prompt and clean the result."""
    response = openai.chat.completions.create(
        model="gpt-4o",  # use gpt-4o-mini if preferred
        messages=[
            {"role": "system", "content": "You are a helpful assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.2,
        max_tokens=1000
    )
    raw_content = response.choices[0].message.content.strip()
    return _strip_json_fence(raw_content)