# models/recipe.py
import requests
from config import API_KEY, BASE_URL

def search_recipes(ingredients, diet=None):
    params = {
        "ingredients": ingredients,
        "number": 3,  # Show 3 recipes
        "ranking": 1,
        "ignorePantry": "true",
        "apiKey": API_KEY
    }
    if diet:
        params["diet"] = diet

    response = requests.get(BASE_URL, params=params)
    return response.json() if response.status_code == 200 else []