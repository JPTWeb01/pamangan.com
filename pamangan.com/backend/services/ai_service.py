import json
import re
import logging
import requests
from config import Config

logger = logging.getLogger(__name__)

_RECIPE_SCHEMA = """
{
  "name": "string",
  "description": "brief appetizing description",
  "cuisine": "string — the dish's actual country or region of origin (e.g. Italian, Japanese, Mexican, Filipino, Indian)",
  "cooking_time": "string (e.g. '45 minutes')",
  "prep_time": "string (e.g. '15 minutes')",
  "servings": number,
  "difficulty": "Easy | Medium | Hard",
  "ingredients": [{"item": "string", "quantity": "string", "notes": "string or null"}],
  "instructions": ["Step 1...", "Step 2..."],
  "tags": ["tag1", "tag2"],
  "substitutions": ["tip 1", "tip 2"],
  "image_search_query": "3-5 word descriptive search term for finding an accurate photo of this specific dish (e.g. 'beef adobo braised soy sauce', 'kare-kare peanut oxtail stew', 'tiramisu italian dessert coffee')"
}"""

_GROCERY_SCHEMA = """
{
  "grouped": {
    "Produce": [{"item": "string", "quantity": "string"}],
    "Meat & Seafood": [{"item": "string", "quantity": "string"}],
    "Pantry": [{"item": "string", "quantity": "string"}],
    "Dairy": [{"item": "string", "quantity": "string"}],
    "Other": [{"item": "string", "quantity": "string"}]
  },
  "total_items": number
}"""

_NUTRITION_SCHEMA = """
{
  "calories_per_serving": number,
  "protein_g": number,
  "carbohydrates_g": number,
  "fat_g": number,
  "fiber_g": number,
  "sodium_mg": number,
  "health_notes": ["string"],
  "allergens": ["string"]
}"""

_HISTORY_SCHEMA = """
{
  "origin": "string",
  "history": "2-3 paragraph cultural history",
  "cultural_significance": "string",
  "regional_variations": ["string"],
  "fun_facts": ["string"]
}"""


def _extract_json(text):
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)```", text)
    if match:
        text = match.group(1).strip()
    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1:
        return text[start : end + 1]
    return text


GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent"
# Both providers must fit inside the frontend's 45s request timeout
GEMINI_TIMEOUT = 26
GROQ_TIMEOUT = 16


def _call_gemini(prompt):
    # REST call (the google-generativeai SDK is discontinued)
    resp = requests.post(
        GEMINI_URL.format(model=Config.GEMINI_MODEL),
        headers={"x-goog-api-key": Config.GEMINI_API_KEY, "Content-Type": "application/json"},
        json={
            "contents": [{"role": "user", "parts": [{"text": prompt}]}],
            "generationConfig": {"responseMimeType": "application/json"},
        },
        timeout=GEMINI_TIMEOUT,
    )
    if resp.status_code != 200:
        raise RuntimeError(f"Gemini HTTP {resp.status_code}: {resp.text[:300]}")
    data = resp.json()
    try:
        parts = data["candidates"][0]["content"]["parts"]
    except (KeyError, IndexError, TypeError):
        raise RuntimeError(f"Gemini returned no content: {str(data)[:300]}")
    text = "".join(p.get("text", "") for p in parts if not p.get("thought"))
    if not text.strip():
        raise RuntimeError("Gemini returned an empty response")
    return text


def _call_groq(prompt):
    from groq import Groq

    client = Groq(api_key=Config.GROQ_API_KEY, timeout=GROQ_TIMEOUT)
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model=Config.GROQ_MODEL,
        temperature=0.2,
        max_tokens=6000,  # gpt-oss reasons before answering; leave room for both
        response_format={"type": "json_object"},
        extra_body={"reasoning_effort": "low"},
    )
    return completion.choices[0].message.content


def _generate(prompt):
    if Config.GEMINI_API_KEY:
        try:
            text = _call_gemini(prompt)
            return json.loads(_extract_json(text))
        except Exception as exc:
            logger.warning("Gemini (%s) failed, trying Groq: %s", Config.GEMINI_MODEL, exc)

    if Config.GROQ_API_KEY:
        try:
            text = _call_groq(prompt)
            return json.loads(_extract_json(text))
        except Exception as exc:
            logger.error("Groq (%s) failed: %s", Config.GROQ_MODEL, exc)

    raise RuntimeError("All AI providers failed. Check your API keys in .env")


def generate_recipe(name):
    prompt = (
        f'The user requested a recipe for: "{name}".\n'
        "First, identify the correct dish name — fix any spelling mistakes.\n"
        "If the user included a specific ingredient or variant (e.g. 'Squash Pinakbet', 'Beef Kare-Kare', 'Chicken Adobo'), "
        "preserve it in the name using the format 'Base Dish (Variant)' — e.g. 'Pinakbet (Squash)', 'Kare-Kare (Beef)', 'Adobo (Chicken)'. "
        "Only apply this format when the user clearly specified a variant; if the ingredient is already part of the official dish name (e.g. 'Beef Steak', 'Pork Sinigang'), keep the name as-is.\n"
        "Generate a detailed and authentic recipe for that dish.\n"
        "Set the cuisine to the dish's actual country or region of origin — do not default to Filipino unless it is genuinely a Filipino dish.\n"
        "Use traditional and authentic preparation methods for whatever cuisine the dish belongs to.\n"
        f"Return ONLY a valid JSON object with this exact schema (no extra text):\n{_RECIPE_SCHEMA}"
    )
    return _generate(prompt)


def generate_grocery_list(ingredients_list):
    lines = "\n".join(
        f"- {i.get('quantity', '')} {i.get('item', '')}".strip()
        for i in ingredients_list
    )
    prompt = (
        "Combine these ingredients from multiple recipes into a grocery list.\n"
        "Remove duplicates, normalize quantities, group by store section.\n\n"
        f"Ingredients:\n{lines}\n\n"
        f"Return ONLY a valid JSON object:\n{_GROCERY_SCHEMA}"
    )
    return _generate(prompt)


def generate_nutrition(recipe_name, ingredients):
    lines = "\n".join(
        f"- {i.get('quantity', '')} {i.get('item', '')}".strip()
        for i in ingredients
    )
    prompt = (
        f'Estimate nutritional information per serving for "{recipe_name}".\n'
        f"Ingredients:\n{lines}\n\n"
        f"Return ONLY a valid JSON object:\n{_NUTRITION_SCHEMA}"
    )
    return _generate(prompt)


def generate_history(recipe_name):
    prompt = (
        f'Provide cultural and historical background for the dish "{recipe_name}".\n'
        "Focus on the dish's actual country or region of origin and its culinary heritage.\n\n"
        f"Return ONLY a valid JSON object:\n{_HISTORY_SCHEMA}"
    )
    return _generate(prompt)
