const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Mock data storage (in production, use a proper database)
let users = {
  users: [
    {
      email: "user@example.com",
      password: "password",
      favorites: [],
      search_history: [],
      premium: false,
      dark_mode: false
    }
  ]
};

// Helper functions
function getCurrentUser() {
  return users.users[0]; // Mock current user
}

function findUserByEmail(email) {
  return users.users.find(user => user.email === email);
}

function addToHistory(email, ingredients) {
  const user = findUserByEmail(email);
  if (user) {
    user.search_history.unshift(ingredients);
    user.search_history = user.search_history.slice(0, 10); // Keep last 10
  }
}

function addFavorite(email, recipe) {
  const user = findUserByEmail(email);
  if (user) {
    user.favorites.push(recipe);
  }
}

// Mock recipe search function
function searchRecipes(ingredients, diet) {
  // Mock recipe data
  return [
    {
      id: 1,
      title: "Simple Pasta",
      image: "https://images.pexels.com/photos/1279330/pexels-photo-1279330.jpeg",
      usedIngredients: [{ name: "pasta" }, { name: "tomato" }],
      missedIngredients: [{ name: "cheese" }]
    },
    {
      id: 2,
      title: "Quick Salad",
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      usedIngredients: [{ name: "lettuce" }, { name: "tomato" }],
      missedIngredients: [{ name: "dressing" }]
    }
  ];
}

// Routes
app.get('/', (req, res) => {
  const user = getCurrentUser();
  const history = user.search_history.slice(0, 5);
  res.render('index', { history });
});

app.get('/recipe', (req, res) => {
  const ingredients = req.query.ingredients;
  return searchWithIngredients(req, res, ingredients, null);
});

app.post('/recipe', (req, res) => {
  const ingredients = req.body.ingredients;
  const diet = req.body.diet;
  addToHistory("user@example.com", ingredients);
  return searchWithIngredients(req, res, ingredients, diet);
});

function searchWithIngredients(req, res, ingredients, diet) {
  const results = searchRecipes(ingredients, diet);
  if (!results || results.length === 0) {
    return res.send("<h3>No recipes found!</h3><a href='/'>Try again</a>");
  }

  const processed = results.map(r => {
    const used = r.usedIngredients.map(i => i.name).join(", ");
    const missed = r.missedIngredients.map(i => i.name).join(", ");
    const link = `https://spoonacular.com/recipes/${r.title.replace(/ /g, '-')}-${r.id}`;
    const saveUrl = `/save?title=${encodeURIComponent(r.title)}&image=${encodeURIComponent(r.image)}&link=${encodeURIComponent(link)}`;
    
    return {
      title: r.title,
      image: r.image,
      used,
      missed,
      link,
      save_url: saveUrl
    };
  });

  res.render('recipe', { recipes: processed, ingredients });
}

app.get('/save', (req, res) => {
  const title = decodeURIComponent(req.query.title);
  const image = decodeURIComponent(req.query.image);
  const link = decodeURIComponent(req.query.link);
  const user = getCurrentUser();
  addFavorite(user.email, { title, image, link });
  res.send(`✅ '${title}' saved! <br><a href='/favorites'>View Favorites</a>`);
});

app.get('/favorites', (req, res) => {
  const user = getCurrentUser();
  res.render('favorites', { favorites: user.favorites });
});

app.get('/planner', (req, res) => {
  res.render('planner');
});

app.get('/login', (req, res) => {
  res.render('login', { signup: false });
});

app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    res.send("👋 Welcome! <a href='/'>Home</a>");
  } else {
    res.send("❌ Invalid. <a href='/login'>Try again</a>");
  }
});

app.get('/signup', (req, res) => {
  res.render('login', { signup: true });
});

app.post('/signup', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  if (findUserByEmail(email)) {
    res.send("📧 Exists! <a href='/signup'>Try again</a>");
  } else {
    users.users.push({
      email,
      password,
      favorites: [],
      search_history: [],
      premium: false,
      dark_mode: false
    });
    res.send("✅ Done! <a href='/login'>Login</a>");
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});