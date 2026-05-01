"""
Run with: python seed.py
Seeds the database with authentic Filipino recipes.
"""
import sys
import re
from datetime import datetime, timezone

sys.path.insert(0, ".")
from config import Config
from pymongo import MongoClient

RECIPES = [
    {
        "name": "Chicken Adobo",
        "description": "The quintessential Filipino dish — tender chicken braised in vinegar, soy sauce, garlic, and bay leaves. Tangy, savory, and utterly satisfying.",
        "cuisine": "Filipino",
        "cooking_time": "45 minutes",
        "prep_time": "15 minutes",
        "servings": 4,
        "difficulty": "Easy",
        "rating": 4.9,
        "ingredients": [
            {"item": "chicken pieces", "quantity": "1 kg", "notes": "thighs and drumsticks"},
            {"item": "soy sauce", "quantity": "1/2 cup", "notes": None},
            {"item": "white cane vinegar", "quantity": "1/3 cup", "notes": None},
            {"item": "garlic", "quantity": "8 cloves", "notes": "crushed"},
            {"item": "whole black peppercorns", "quantity": "1 tsp", "notes": None},
            {"item": "bay leaves", "quantity": "3", "notes": None},
            {"item": "cooking oil", "quantity": "2 tbsp", "notes": None},
            {"item": "water", "quantity": "1/2 cup", "notes": None},
        ],
        "instructions": [
            "Combine soy sauce, vinegar, garlic, peppercorns, and bay leaves in a large bowl.",
            "Add chicken and marinate for at least 30 minutes, or overnight in the fridge.",
            "Heat oil in a wide pan over medium-high heat. Remove chicken from marinade (reserve it).",
            "Sear chicken pieces until browned on all sides, about 5 minutes.",
            "Pour in reserved marinade and water. Bring to a boil.",
            "Reduce heat, cover, and simmer for 30 minutes until chicken is cooked through.",
            "Uncover and simmer 10 more minutes to reduce and glaze the sauce.",
            "Serve hot over steamed white rice.",
        ],
        "tags": ["Filipino", "Asian", "Chicken", "Main Course", "Classic", "Easy"],
        "substitutions": [
            "Use apple cider vinegar for a fruitier note",
            "Coconut vinegar (sukang tuba) is the most traditional choice",
            "Swap chicken for pork belly for an equally iconic version",
        ],
        "nutrition": {
            "calories_per_serving": 320,
            "protein_g": 28,
            "carbohydrates_g": 8,
            "fat_g": 18,
            "fiber_g": 1,
            "sodium_mg": 1200,
            "health_notes": ["High in protein", "Garlic provides natural antibacterial benefits"],
            "allergens": ["soy"],
        },
        "history": {
            "origin": "Philippines",
            "history": (
                "Adobo is widely regarded as the unofficial national dish of the Philippines. "
                "The cooking method predates Spanish colonization — Filipinos were already preserving "
                "food in vinegar long before the 16th century, capitalizing on the natural acidity "
                "that inhibits bacterial growth in the tropical climate.\n\n"
                "The word 'adobo' comes from the Spanish word for seasoning or marinade, but the "
                "Filipino version is entirely distinct from its Spanish and Latin American counterparts. "
                "Traditional recipes used sukang tuba (coconut vinegar) and patis (fish sauce) rather "
                "than soy sauce, which was introduced through Chinese trade.\n\n"
                "Every Filipino family guards their own adobo recipe — some add coconut milk, some "
                "omit soy sauce for a 'white adobo', and others include potatoes or hardboiled eggs."
            ),
            "cultural_significance": (
                "Adobo is the ultimate Filipino comfort food, evoking childhood memories "
                "and home cooking across the archipelago's 7,641 islands."
            ),
            "regional_variations": [
                "Adobo sa Gata — Bicolano version with creamy coconut milk",
                "Adobong Puti — white adobo using only vinegar, no soy sauce",
                "Adobo sa Dilaw — yellow adobo with turmeric from Cavite",
                "Adobong Pusit — squid adobo, popular in coastal areas",
            ],
            "fun_facts": [
                "Adobo can keep several days at room temperature thanks to the vinegar's preserving effect",
                "Chefs claim it tastes even better reheated the next day",
                "Over 100 documented regional variations exist across the Philippines",
            ],
        },
    },
    {
        "name": "Sinigang na Baboy",
        "description": "A soul-warming Filipino sour tamarind soup with tender pork ribs and garden-fresh vegetables — comfort in a bowl.",
        "cuisine": "Filipino",
        "cooking_time": "1 hour 15 minutes",
        "prep_time": "20 minutes",
        "servings": 6,
        "difficulty": "Medium",
        "rating": 4.8,
        "ingredients": [
            {"item": "pork spare ribs", "quantity": "1 kg", "notes": "cut into 3-inch pieces"},
            {"item": "tamarind pulp", "quantity": "200g", "notes": "or 1 packet sinigang mix"},
            {"item": "water", "quantity": "2 liters", "notes": None},
            {"item": "tomatoes", "quantity": "3 medium", "notes": "quartered"},
            {"item": "onion", "quantity": "1 large", "notes": "quartered"},
            {"item": "white radish", "quantity": "1 medium", "notes": "labanos, sliced 1/2-inch"},
            {"item": "eggplant", "quantity": "2 medium", "notes": "cut into chunks"},
            {"item": "sitaw", "quantity": "200g", "notes": "string beans, 2-inch pieces"},
            {"item": "kangkong", "quantity": "2 bunches", "notes": "water spinach"},
            {"item": "long green chili", "quantity": "2", "notes": "siling pangsigang"},
            {"item": "fish sauce", "quantity": "3 tbsp", "notes": "patis"},
            {"item": "salt", "quantity": "to taste", "notes": None},
        ],
        "instructions": [
            "Blanch pork ribs in boiling water for 5 minutes. Drain and rinse thoroughly.",
            "In a large pot, combine pork with 2 liters fresh water, tomatoes, and onion.",
            "Bring to a boil, skim off foam, then reduce to a simmer.",
            "Simmer 40 minutes until pork is tender.",
            "Add tamarind pulp (or dissolve sinigang mix in 1 cup broth and add). Cook 10 minutes.",
            "Season with fish sauce. Adjust sourness by adding more tamarind or mix.",
            "Add radish and long green chilis; cook 8 minutes.",
            "Add eggplant and sitaw; cook 5 minutes.",
            "Add kangkong last; cook just until wilted, about 2 minutes.",
            "Serve immediately with steamed rice and extra fish sauce on the side.",
        ],
        "tags": ["Filipino", "Asian", "Pork", "Soup", "Comfort Food", "Tamarind"],
        "substitutions": [
            "Use shrimp for Sinigang na Hipon",
            "Use salmon head for Sinigang na Salmon sa Miso",
            "Kamias (bilimbi) or calamansi can replace tamarind for a different sourness",
            "Spinach or pechay can substitute for kangkong",
        ],
        "nutrition": {
            "calories_per_serving": 290,
            "protein_g": 22,
            "carbohydrates_g": 16,
            "fat_g": 14,
            "fiber_g": 4,
            "sodium_mg": 850,
            "health_notes": [
                "Excellent source of Vitamin C from tamarind",
                "Rich in vegetables and fiber",
            ],
            "allergens": ["fish (patis)"],
        },
        "history": {
            "origin": "Philippines (Tagalog regions)",
            "history": (
                "Sinigang is one of the oldest and most beloved dishes in Filipino cuisine, "
                "predating Spanish colonization. Its defining characteristic — a sour, "
                "tamarind-based broth — reflects the Filipino love of sour flavors (asim), "
                "found across many regional dishes.\n\n"
                "The dish likely originated in the Tagalog regions of Luzon, where tamarind "
                "(sampalok) trees grow abundantly. Early Filipinos used locally available "
                "souring agents including guava, kamias, and calamansi before tamarind became "
                "the dominant choice.\n\n"
                "TasteAtlas named Sinigang the world's best vegetable soup, a recognition that "
                "Filipinos around the world celebrated with pride."
            ),
            "cultural_significance": (
                "Sinigang represents the Filipino soul — warm, restorative, and comforting. "
                "It is the dish Filipinos crave when homesick abroad."
            ),
            "regional_variations": [
                "Sinigang sa Bayabas — guava-soured broth, sweeter profile",
                "Sinigang sa Miso — with miso paste for umami depth",
                "Sinigang sa Kamias — using bilimbi for a cleaner sour note",
            ],
            "fun_facts": [
                "TasteAtlas ranked it the world's best vegetable soup",
                "The instant sinigang mix (Knorr) is one of the best-selling condiments in the Philippines",
            ],
        },
    },
    {
        "name": "Kare-Kare",
        "description": "A rich and indulgent Filipino stew of slow-braised oxtail and vegetables in a thick, golden peanut sauce — always paired with bagoong alamang.",
        "cuisine": "Filipino",
        "cooking_time": "3 hours",
        "prep_time": "30 minutes",
        "servings": 6,
        "difficulty": "Hard",
        "rating": 4.7,
        "ingredients": [
            {"item": "oxtail", "quantity": "1 kg", "notes": "cut crosswise into 2-inch segments"},
            {"item": "beef tripe", "quantity": "500g", "notes": "cleaned and cut into pieces"},
            {"item": "creamy peanut butter", "quantity": "1 cup", "notes": None},
            {"item": "ground toasted rice", "quantity": "3 tbsp", "notes": "for thickening"},
            {"item": "annatto powder", "quantity": "2 tbsp", "notes": "achuete"},
            {"item": "eggplant", "quantity": "2 medium", "notes": "sliced into thick rounds"},
            {"item": "banana blossom", "quantity": "1 cup", "notes": "puso ng saging, blanched"},
            {"item": "sitaw", "quantity": "200g", "notes": "string beans, 3-inch pieces"},
            {"item": "pechay", "quantity": "2 bunches", "notes": "bok choy"},
            {"item": "garlic", "quantity": "6 cloves", "notes": "minced"},
            {"item": "onion", "quantity": "1 large", "notes": "diced"},
            {"item": "fish sauce", "quantity": "3 tbsp", "notes": "patis"},
            {"item": "bagoong alamang", "quantity": "1/2 cup", "notes": "sautéed shrimp paste, for serving"},
        ],
        "instructions": [
            "Boil oxtail and tripe in salted water for 2.5 to 3 hours until very tender. Reserve 4 cups of broth.",
            "Sauté garlic and onion in oil until soft.",
            "Dissolve annatto powder in 2 tbsp water and add to the pot.",
            "Add cooked oxtail and tripe. Pour in reserved broth.",
            "Dissolve peanut butter in 1 cup warm broth; stir into the pot.",
            "Add ground toasted rice and simmer, stirring, until sauce thickens — about 10 minutes.",
            "Add eggplant, banana blossom, and sitaw. Cook 10 minutes.",
            "Add pechay and cook 3 minutes until wilted.",
            "Season with fish sauce. Serve with sautéed bagoong on the side.",
        ],
        "tags": ["Filipino", "Asian", "Beef", "Stew", "Traditional", "Peanut", "Main Course"],
        "substitutions": [
            "Beef shank works as a more affordable substitute",
            "Natural peanut butter gives the most authentic flavor",
            "Bagoong isda (fish paste) can replace bagoong alamang",
        ],
        "nutrition": None,
        "history": None,
    },
    {
        "name": "Pancit Canton",
        "description": "Festive Filipino stir-fried flour noodles loaded with chicken, shrimp, and crisp vegetables — traditionally served at birthdays to symbolize long life.",
        "cuisine": "Filipino",
        "cooking_time": "25 minutes",
        "prep_time": "20 minutes",
        "servings": 6,
        "difficulty": "Easy",
        "rating": 4.6,
        "ingredients": [
            {"item": "pancit canton noodles", "quantity": "400g", "notes": "flour stick noodles"},
            {"item": "chicken breast", "quantity": "300g", "notes": "sliced thin"},
            {"item": "shrimp", "quantity": "200g", "notes": "peeled and deveined"},
            {"item": "cabbage", "quantity": "2 cups", "notes": "shredded"},
            {"item": "carrots", "quantity": "2 medium", "notes": "julienned"},
            {"item": "snow peas", "quantity": "1 cup", "notes": "trimmed"},
            {"item": "celery stalks", "quantity": "2", "notes": "sliced diagonally"},
            {"item": "garlic", "quantity": "5 cloves", "notes": "minced"},
            {"item": "onion", "quantity": "1 large", "notes": "sliced"},
            {"item": "soy sauce", "quantity": "3 tbsp", "notes": None},
            {"item": "oyster sauce", "quantity": "2 tbsp", "notes": None},
            {"item": "chicken broth", "quantity": "2 cups", "notes": None},
            {"item": "sesame oil", "quantity": "1 tsp", "notes": "finishing"},
            {"item": "calamansi", "quantity": "6 pieces", "notes": "for serving"},
        ],
        "instructions": [
            "Sauté garlic and onion in oil over medium-high heat until fragrant.",
            "Add chicken; stir-fry until no longer pink, about 4 minutes.",
            "Add shrimp and cook 2 minutes until pink.",
            "Add carrots and celery; toss 2 minutes.",
            "Add cabbage and snow peas; toss 1 minute.",
            "Pour in chicken broth, soy sauce, and oyster sauce. Bring to a simmer.",
            "Add noodles; toss continuously until they absorb the liquid, about 5 minutes.",
            "Drizzle with sesame oil. Plate and serve with calamansi halves.",
        ],
        "tags": ["Filipino", "Asian", "Noodles", "Seafood", "Party Food", "Birthday"],
        "substitutions": [
            "Bihon (thin rice noodles) for a lighter, gluten-free version",
            "Firm tofu for a vegetarian adaptation",
            "Add Chinese sausage (chorizo de Bilbao) for extra flavor",
        ],
        "nutrition": None,
        "history": None,
    },
    {
        "name": "Lumpia Shanghai",
        "description": "Crispy Filipino mini spring rolls packed with seasoned ground pork and vegetables — the crowd-pleasing appetizer at every party.",
        "cuisine": "Filipino",
        "cooking_time": "25 minutes",
        "prep_time": "45 minutes",
        "servings": 8,
        "difficulty": "Medium",
        "rating": 4.7,
        "ingredients": [
            {"item": "ground pork", "quantity": "500g", "notes": None},
            {"item": "spring roll wrappers", "quantity": "30 sheets", "notes": "lumpia wrappers"},
            {"item": "carrots", "quantity": "2 medium", "notes": "finely minced"},
            {"item": "onion", "quantity": "1 large", "notes": "finely minced"},
            {"item": "garlic", "quantity": "4 cloves", "notes": "minced"},
            {"item": "water chestnuts", "quantity": "1 can (225g)", "notes": "drained, minced"},
            {"item": "eggs", "quantity": "2", "notes": None},
            {"item": "soy sauce", "quantity": "2 tbsp", "notes": None},
            {"item": "sesame oil", "quantity": "1 tsp", "notes": None},
            {"item": "salt and pepper", "quantity": "to taste", "notes": None},
            {"item": "cooking oil", "quantity": "for deep frying", "notes": None},
        ],
        "instructions": [
            "Mix ground pork, carrots, onion, garlic, water chestnuts, eggs, soy sauce, and sesame oil.",
            "Season with salt and pepper. Fry a small patty to taste-test the seasoning.",
            "Lay a wrapper in a diamond position. Place 1.5 tbsp filling near the bottom corner.",
            "Roll tightly from the bottom, tucking in the sides as you go.",
            "Seal the edge with a dab of water or beaten egg.",
            "Heat oil to 350°F (175°C) in a deep pan.",
            "Fry in batches for 3–4 minutes, turning once, until deep golden.",
            "Drain on paper towels. Serve with sweet chili sauce or banana ketchup.",
        ],
        "tags": ["Filipino", "Asian", "Pork", "Appetizer", "Fried", "Party Food", "Snack"],
        "substitutions": [
            "Ground chicken or shrimp for a lighter filling",
            "Air-fry at 390°F for 10–12 minutes for a lower-fat option",
            "Wonton wrappers in a pinch, though thinner and crispier",
        ],
        "nutrition": None,
        "history": None,
    },
    {
        "name": "Lechon Kawali",
        "description": "Shatteringly crispy deep-fried pork belly with juicy, melt-in-your-mouth meat inside — Filipino comfort food perfected.",
        "cuisine": "Filipino",
        "cooking_time": "1 hour 30 minutes",
        "prep_time": "15 minutes",
        "servings": 6,
        "difficulty": "Medium",
        "rating": 4.8,
        "ingredients": [
            {"item": "pork belly slab", "quantity": "1.5 kg", "notes": "bone-in preferred"},
            {"item": "water", "quantity": "4 cups", "notes": "for boiling"},
            {"item": "rock salt", "quantity": "2 tbsp", "notes": None},
            {"item": "garlic", "quantity": "6 cloves", "notes": "smashed"},
            {"item": "bay leaves", "quantity": "3", "notes": None},
            {"item": "black peppercorns", "quantity": "1 tsp", "notes": None},
            {"item": "cooking oil", "quantity": "enough to submerge pork", "notes": "for deep frying"},
        ],
        "instructions": [
            "Simmer pork belly in salted water with garlic, bay leaves, and peppercorns for 1 hour until tender.",
            "Remove and cool completely. Pat skin completely dry with paper towels.",
            "For maximum crispiness, refrigerate uncovered on a rack overnight.",
            "Heat oil in a large, deep pot to 375°F (190°C).",
            "Carefully lower the pork belly skin-side down into the oil.",
            "Fry 20–25 minutes, turning once, until skin is deep gold and crackling.",
            "Rest on a rack for 10 minutes before chopping.",
            "Chop into pieces and serve with lechon sauce or spiced cane vinegar.",
        ],
        "tags": ["Filipino", "Asian", "Pork", "Fried", "Crispy", "Main Course"],
        "substitutions": [
            "Air-fry the boiled pork at 400°F for 25–30 minutes after refrigerating overnight",
            "Serve with sarsa (liver sauce) for the most authentic pairing",
        ],
        "nutrition": None,
        "history": None,
    },
    {
        "name": "Bulalo",
        "description": "A luxurious Batangas beef bone-marrow soup with fall-off-the-bone shanks in a crystal-clear, beefy broth.",
        "cuisine": "Filipino",
        "cooking_time": "3 hours",
        "prep_time": "20 minutes",
        "servings": 4,
        "difficulty": "Medium",
        "rating": 4.8,
        "ingredients": [
            {"item": "beef shank with marrow bones", "quantity": "1.5 kg", "notes": "cut cross-wise"},
            {"item": "corn on the cob", "quantity": "2 ears", "notes": "cut into thirds"},
            {"item": "cabbage", "quantity": "1/2 head", "notes": "cut into wedges"},
            {"item": "pechay", "quantity": "1 bunch", "notes": "bok choy"},
            {"item": "potatoes", "quantity": "3 medium", "notes": "quartered"},
            {"item": "onion", "quantity": "1 large", "notes": "quartered"},
            {"item": "whole black peppercorns", "quantity": "1 tsp", "notes": None},
            {"item": "fish sauce", "quantity": "to taste", "notes": "patis"},
            {"item": "salt", "quantity": "to taste", "notes": None},
        ],
        "instructions": [
            "Blanch beef shanks in boiling water for 5 minutes. Drain and rinse.",
            "Place shanks in a large stockpot with fresh water, onion, and peppercorns.",
            "Bring to a boil, skim foam, then reduce to a gentle simmer.",
            "Simmer 2.5–3 hours, skimming periodically, until beef is very tender.",
            "Add corn and potatoes in the last 30 minutes.",
            "Add cabbage and pechay; cook until just tender, about 5 minutes.",
            "Season with fish sauce and salt.",
            "Serve piping hot with rice and fish sauce for dipping.",
        ],
        "tags": ["Filipino", "Asian", "Beef", "Soup", "Comfort Food", "Batangas"],
        "substitutions": [
            "Add beef neck bones for even more marrow richness",
            "Napa cabbage works as a substitute for pechay",
        ],
        "nutrition": None,
        "history": None,
    },
    {
        "name": "Tinolang Manok",
        "description": "A light, nourishing Filipino chicken ginger soup with green papaya and moringa leaves — warmth in its simplest, healthiest form.",
        "cuisine": "Filipino",
        "cooking_time": "50 minutes",
        "prep_time": "15 minutes",
        "servings": 4,
        "difficulty": "Easy",
        "rating": 4.5,
        "ingredients": [
            {"item": "whole chicken", "quantity": "1 kg", "notes": "cut into serving pieces"},
            {"item": "green papaya", "quantity": "1 medium", "notes": "peeled, seeded, cut into wedges"},
            {"item": "malunggay leaves", "quantity": "1 cup", "notes": "moringa, or use siling labuyo leaves"},
            {"item": "fresh ginger", "quantity": "3-inch piece", "notes": "peeled and sliced thin"},
            {"item": "garlic", "quantity": "4 cloves", "notes": "minced"},
            {"item": "onion", "quantity": "1 medium", "notes": "sliced"},
            {"item": "fish sauce", "quantity": "3 tbsp", "notes": "patis"},
            {"item": "black pepper", "quantity": "to taste", "notes": None},
            {"item": "water", "quantity": "6 cups", "notes": None},
        ],
        "instructions": [
            "Sauté ginger in oil until fragrant. Add garlic, then onion.",
            "Add chicken pieces and stir-fry until lightly golden, about 5 minutes.",
            "Season with fish sauce and pepper.",
            "Pour in water and bring to a boil. Skim off foam.",
            "Reduce heat and simmer 30 minutes until chicken is cooked through.",
            "Add green papaya; simmer 10 minutes until tender.",
            "Add malunggay or chili leaves; cook 2 minutes until just wilted.",
            "Adjust seasoning and serve hot with steamed rice.",
        ],
        "tags": ["Filipino", "Asian", "Chicken", "Soup", "Healthy", "Light", "Ginger"],
        "substitutions": [
            "Sayote (chayote) is a common substitute for green papaya",
            "Spinach or moringa powder if fresh leaves are unavailable",
            "Add a stalk of lemongrass with the ginger for added fragrance",
        ],
        "nutrition": None,
        "history": None,
    },
]


def make_slug(name):
    return re.sub(r"[^a-z0-9]+", "-", name.lower()).strip("-")


def seed():
    client = MongoClient(Config.MONGODB_URI, serverSelectionTimeoutMS=8000)
    db = client[Config.DB_NAME]
    now = datetime.now(timezone.utc)

    inserted = 0
    skipped = 0
    for data in RECIPES:
        slug = make_slug(data["name"])
        if db.recipes.find_one({"slug": slug}):
            print(f"  skip  {data['name']}")
            skipped += 1
            continue

        doc = {
            **data,
            "slug": slug,
            "source": "manual",
            "views": 0,
            "image_url": None,
            "created_at": now,
            "updated_at": now,
        }
        db.recipes.insert_one(doc)
        print(f"  added {data['name']}")
        inserted += 1

    print(f"\nDone — {inserted} inserted, {skipped} skipped.")
    client.close()


if __name__ == "__main__":
    seed()
