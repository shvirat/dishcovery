const randomRecipeContainer = document.getElementById("randomRecipes");

// Fetch one random recipe
const getRandomRecipe = async () => {
  const url = "https://www.themealdb.com/api/json/v1/1/random.php";
  const response = await fetch(url);
  const data = await response.json();
  return data.meals[0];
};

// Display 3 random recipes
const displayRandomRecipes = async (count = 3) => {
  for (let i = 0; i < count; i++) {
    const meal = await getRandomRecipe();

    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = meal.idMeal;
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="recipe-options">
        <div class="recipe-name"><h3>${meal.strMeal}</h3></div>
        <button class="show-recipe-btn" data-id="${meal.idMeal}">
          Show Recipe
        </button>
      </div>
    `;

    randomRecipeContainer.appendChild(card);
  }
  const recipeDiv = document.querySelectorAll(".recipe-name");
  recipeDiv.forEach((div) => {
    if (div.scrollHeight > div.clientHeight) {
      div.classList.add("overflow");
    } else {
      div.classList.remove("overflow");
    }
  });
};

// Automatically show recipes when the page loads
// window.addEventListener("DOMContentLoaded", displayRandomRecipes);
window.addEventListener("DOMContentLoaded", () => {
  displayRandomRecipes(3);
});
