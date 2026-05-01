import json
import re
import logging
from config import Config

logger = logging.getLogger(__name__)

_RECIPE_SCHEMA = """
{
  "name": "string",
  "description": "brief appetizing description",
  "cuisine": "string (e.g. Filipino, Italian, Thai)",
  "cooking_time": "string (e.g. '45 minutes')",
  "prep_time": "string (e.g. '15 minutes')",
  "servings": number,
  "difficulty": "Easy | Medium | Hard",
  "ingredients": [{"item": "string", "quantity": "string", "notes": "string or null"}],
  "instructions": ["Step 1...", "Step 2..."],
  "tags": ["tag1", "tag2"],
  "substitutions": ["tip 1", "tip 2"]
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


def _call_gemini(prompt):
    import google.generativeai as genai

    genai.configure(api_key=Config.GEMINI_API_KEY)
    model = genai.GenerativeModel("gemini-2.0-flash")
    response = model.generate_content(prompt)
    return response.text


def _call_groq(prompt):
    from groq import Groq

    client = Groq(api_key=Config.GROQ_API_KEY)
    completion = client.chat.completions.create(
        messages=[{"role": "user", "content": prompt}],
        model="llama-3.1-8b-instant",
        temperature=0.7,
        max_tokens=2048,
    )
    return completion.choices[0].message.content


def _generate(prompt):
    if Config.GEMINI_API_KEY:
        try:
            text = _call_gemini(prompt)
            return json.loads(_extract_json(text))
        except Exception as exc:
            logger.warning("Gemini failed, trying Groq: %s", exc)

    if Config.GROQ_API_KEY:
        try:
            text = _call_groq(prompt)
            return json.loads(_extract_json(text))
        except Exception as exc:
            logger.error("Groq failed: %s", exc)

    raise RuntimeError("All AI providers failed. Check your API keys in .env")


def generate_recipe(name):
    prompt = (
        f'Generate a detailed and authentic recipe for "{name}".\n'
        "If this is a Filipino dish, provide traditional Filipino preparation methods.\n"
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
        "Focus on Filipino culinary heritage if applicable.\n\n"
        f"Return ONLY a valid JSON object:\n{_HISTORY_SCHEMA}"
    )
    return _generate(prompt)
