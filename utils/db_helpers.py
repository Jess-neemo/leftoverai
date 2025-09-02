# utils/db_helpers.py
from models.user import load_users

def get_current_user():
    return load_users()["users"][0]  # Demo: first user

def is_premium():
    return get_current_user().get("premium", False)