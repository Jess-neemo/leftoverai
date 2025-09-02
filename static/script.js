// script.js

// Dark Mode Toggle
function toggleDarkMode() {
  const body = document.body;
  const isDark = body.getAttribute("data-theme") === "dark";
  body.setAttribute("data-theme", isDark ? "light" : "dark");
  localStorage.setItem("darkMode", !isDark);
}

// Load saved theme
document.addEventListener("DOMContentLoaded", () => {
  const saved = localStorage.getItem("darkMode") === "true";
  if (saved) {
    document.body.setAttribute("data-theme", "dark");
  }
});

// Show loading
function showLoading() {
  document.getElementById("loading").style.display = "block";
}

// AI Tip Generator
function askAI() {
  const input = document.getElementById("ai-question").value.trim();
  if (!input) return;

  const tips = {
    milk: "You can substitute yogurt or almond milk.",
    egg: "Use mashed banana or flaxseed for vegan option.",
    meat: "Try tofu, lentils, or mushrooms as substitutes."
  };

  const word = Object.keys(tips).find(k => input.toLowerCase().includes(k));
  const answer = word ? tips[word] : "Try using it in a stir-fry or soup!";
  alert("💡 AI Tip: " + answer);
}