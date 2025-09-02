# config.py
API_KEY = "ae3013f661b243a6adda00cb37052365"  # Get from spoonacular.com
BASE_URL = "https://api.spoonacular.com/recipes/findByIngredients"

DATA_FILE = "data/users.json"
SECRET_KEY = "super-secret-temp-key"

# Premium features
PREMIUM_PRICE = 3.99
SUPPORTED_DIETS = [
    "vegetarian", "vegan", "glutenFree", "dairyFree",
    "keto", "paleo", "lowFodmap"
]