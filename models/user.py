import json
from config import DATA_FILE

def load_users():
    with open(DATA_FILE, "r") as f:
        return json.load(f)

def save_users(data):
    with open(DATA_FILE, "w") as f:
        json.dump(data, f, indent=2)

def find_user_by_email(email):
    for user in load_users()["users"]:
        if user["email"] == email:
            return user
    return None

def add_favorite(email, recipe):
    users = load_users()
    for user in users["users"]:
        if user["email"] == email:
            if not any(fav["title"] == recipe["title"] for fav in user["favorites"]):
                user["favorites"].append(recipe)
                save_users(users)
                return True
    return False

def add_to_history(email, ingredients):
    users = load_users()
    for user in users["users"]:
        if user["email"] == email:
            if ingredients not in user["search_history"]:
                user["search_history"].insert(0, ingredients)
                if len(user["search_history"]) > 5:
                    user["search_history"] = user["search_history"][:5]
                save_users(users)