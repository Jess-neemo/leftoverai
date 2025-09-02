from flask import Flask, request, render_template, redirect
import urllib.parse
from models.recipe import search_recipes
from models.user import add_favorite, add_to_history, find_user_by_email
from utils.db_helpers import get_current_user

app = Flask(__name__)
app.secret_key = "super-secret-temp-key"

@app.route("/")
def index():
    user = get_current_user()
    history = user.get("search_history", [])[:5]
    return render_template("index.html", history=history)

@app.route("/recipe")
def get_recipe_from_link():
    ingredients = request.args.get("ingredients")
    return _search_with_ingredients(ingredients, None)

@app.route("/recipe", methods=["POST"])
def post_recipe():
    ingredients = request.form["ingredients"]
    diet = request.form.get("diet")
    add_to_history("user@example.com", ingredients)
    return _search_with_ingredients(ingredients, diet)

def _search_with_ingredients(ingredients, diet):
    results = search_recipes(ingredients, diet)
    if not results:
        return "<h3>No recipes found!</h3><a href='/'>Try again</a>"

    processed = []
    for r in results:
        used = ", ".join([i["name"] for i in r["usedIngredients"]])
        missed = ", ".join([i["name"] for i in r["missedIngredients"]])
        link = f"https://spoonacular.com/recipes/{r['title'].replace(' ', '-')}-{r['id']}"
        save_url = f"/save?title={urllib.parse.quote(r['title'])}&image={urllib.parse.quote(r['image'])}&link={urllib.parse.quote(link)}"
        processed.append({
            "title": r["title"],
            "image": r["image"],
            "used": used,
            "missed": missed,
            "link": link,
            "save_url": save_url
        })

    return render_template("recipe.html", recipes=processed, ingredients=ingredients)

@app.route("/save")
def save_recipe():
    title = urllib.parse.unquote(request.args.get("title"))
    image = urllib.parse.unquote(request.args.get("image"))
    link = urllib.parse.unquote(request.args.get("link"))
    user = get_current_user()
    add_favorite(user["email"], {"title": title, "image": image, "link": link})
    return f"✅ '{title}' saved! <br><a href='/favorites'>View Favorites</a>"

@app.route("/favorites")
def favorites():
    user = get_current_user()
    return render_template("favorites.html", favorites=user["favorites"])

@app.route("/planner")
def planner():
    return render_template("planner.html")

@app.route("/login")
def login_page():
    return render_template("login.html", signup=False)

@app.route("/login", methods=["POST"])
def login():
    email = request.form["email"]
    password = request.form["password"]
    user = find_user_by_email(email)
    if user and user["password"] == password:
        return f"👋 Welcome! <a href='/'>Home</a>"
    return "❌ Invalid. <a href='/login'>Try again</a>"

@app.route("/signup")
def signup_page():
    return render_template("login.html", signup=True)

@app.route("/signup", methods=["POST"])
def signup():
    email = request.form["email"]
    password = request.form["password"]
    if find_user_by_email(email):
        return "📧 Exists! <a href='/signup'>Try again</a>"
    from models.user import load_users, save_users
    data = load_users()
    data["users"].append({
        "email": email,
        "password": password,
        "favorites": [],
        "search_history": [],
        "premium": False,
        "dark_mode": False
    })
    save_users(data)
    return "✅ Done! <a href='/login'>Login</a>"

if __name__ == "__main__":
    app.run(debug=True)