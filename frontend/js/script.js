const searchBtn = document.getElementById("searchBtn");
const ingredientBtn = document.getElementById("ingredientBtn");
const searchInput = document.getElementById("searchInput");
const ingredientInput = document.getElementById("ingredientInput");
const resultsDiv = document.getElementById("results");
const welcomeMessage = document.getElementById("welcomeMessage");
const resultsMeta = document.getElementById("resultsMeta");
const resultsLoader = document.getElementById("resultsLoader");
const resultsContent = document.getElementById("resultsContent");
const resultsOutput = document.getElementById("resultsOutput");
const randomRecipe = document.getElementById("randomRecipe");

const modal = document.getElementById("recipe-modal");
const modalContent = document.getElementById("recipe-details-content");
const modalCloseBtn = document.getElementById("modal-close-btn");

searchBtn.addEventListener("click", () => {
  searchBtn.classList.add("clicked");

  setTimeout(() => {
    searchBtn.classList.remove("clicked");
  }, 400);
});

// Toggle menu close/open
function toggleMenu() {
  document.querySelector(".menu-icon").classList.toggle("active");
  document.querySelector(".navlinks").classList.toggle("active");
  document.querySelector(".overlay").classList.toggle("active");  
}

// Close menu when clicking a nav link
document.querySelectorAll(".navlinks a").forEach((link) => {
  link.addEventListener("click", () => {
    document.querySelector(".menu-icon").classList.remove("active");
    document.querySelector(".navlinks").classList.remove("active");
    document.querySelector(".overlay").classList.remove("active");
  });
});

// Search by recipe name
searchBtn.addEventListener("click", async () => {
  const query = searchInput.value.trim();
  welcomeMessage.style.display = "none";
  if (!query) {
    resultsContent.innerHTML = "";
    resultsOutput.innerHTML = "";
    resultsMeta.classList.add("hidden");
    resultsOutput.innerHTML = `<p class="alertMsg">Please enter a meal name first.</p>`;
    return;
  }
  resultsContent.innerHTML = "";
  resultsOutput.innerHTML = "";
  resultsMeta.classList.add("hidden");
  resultsLoader.classList.remove("hidden");
  try {
    const url = `https://www.themealdb.com/api/json/v1/1/search.php?s=${query}`;
    const response = await fetch(url);
    const data = await response.json();
    resultsMeta.classList.remove("hidden");
    resultsMeta.innerHTML = `<h3 class="glowing-heading">
        Found meals for <span class="glowing-word">${query}</span>
      </h3>`;
    displayResults(data.meals);
    if (resultsDiv && data.meals) {
    resultsDiv.scrollIntoView({ behavior: "smooth" });
    messageText = document.querySelector(".welcome-animation");
    messageText.innerHTML = "⬇️<span>Scroll to discover delicious results!</span>";
    messageText.style.cursor = "pointer"
    messageText.addEventListener("click",()=>{
      resultsDiv.scrollIntoView({ behavior: "smooth" });
    })
    welcomeMessage.style.display = "block";
    }
  } catch (err) {
    resultsMeta.classList.add("hidden");
    resultsOutput.innerHTML = `<p class="alertMsg" style="color:red;">Error fetching data.</p>`;
  } finally {
    resultsLoader.classList.add("hidden");
  }
});

searchInput.addEventListener("keydown", function (event) {
  if (event.key === "Enter") {
    event.preventDefault();
    searchBtn.click();
  }
});

// Function to show results
function displayResults(meals) {
  resultsContent.innerHTML = ""; // clear old results
  resultsOutput.innerHTML = "";

  if (!meals) {
    resultsMeta.classList.add("hidden");
    resultsOutput.innerHTML = `<p class="alertMsg">Oops! We couldn’t find any meals.</p>`;
    return;
  }

  meals.forEach((meal) => {
    const card = document.createElement("div");
    card.classList.add("card");
    card.dataset.id = meal.idMeal;
    card.innerHTML = `
      <img src="${meal.strMealThumb}" alt="${meal.strMeal}">
      <div class="recipe-options">
      <div class="recipe-name"><h3>${meal.strMeal}</h3></div>
      <button class="show-recipe-btn">Show recipe</button>
      </div>
    `;
    resultsContent.appendChild(card);
    console.log(meal.idMeal);
  });

  const recipeDiv = document.querySelectorAll(".recipe-name");
  recipeDiv.forEach((div) => {
    if (div.scrollHeight > div.clientHeight) {
      div.classList.add("overflow");
    } else {
      div.classList.remove("overflow");
    }
  });
}

document.getElementById("contactForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const email = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();
  const sendBtn = document.getElementById("sendBtn");

  if (!name || !email || !message) return;

  // Indicate sending state
  sendBtn.textContent = "Sending...";
  sendBtn.classList.add("sending");

  // Prepare form data
  const formData = new FormData(this);

  try {
    const response = await fetch(this.action, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      // Success animation
      sendBtn.textContent = "Message Sent!";
      sendBtn.classList.remove("sending");
      sendBtn.classList.add("success");
      this.reset(); // clear fields
    } else {
      sendBtn.textContent = "Failed to Send!";
      sendBtn.classList.remove("sending");
      sendBtn.classList.add("error");
    }
  } catch (err) {
    console.error(err);
    sendBtn.textContent = "Error!";
    sendBtn.classList.remove("sending");
    sendBtn.classList.add("error");
  }

  // Revert button after 3 seconds
  setTimeout(() => {
    sendBtn.textContent = "Send Message";
    sendBtn.classList.remove("success", "error");
  }, 3000);
});

let originalPadding = '';

function showRecipeModal() {
  if (!modal) return; // Guard clause to prevent undefined errors
  
  const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
  originalPadding = document.body.style.paddingRight;
  
  // Add padding before changing overflow to prevent layout shift
  if (scrollBarWidth > 0) {
    document.body.style.paddingRight = `${scrollBarWidth}px`;
  }
  
  requestAnimationFrame(() => {
    document.body.style.overflow = "hidden";
    modal.classList.remove("hidden");
  });
}

function closeRecipeModal() {
  if (!modal) return; // Guard clause to prevent undefined errors
  
  modal.classList.add("hidden");
  
  // Wait for modal close animation to complete
  setTimeout(() => {
    document.body.style.overflow = "";
    document.body.style.paddingRight = originalPadding;
  }, 350); // Match the modal fade-out animation duration
}


// function showModal() {
//   modal.classList.remove("hidden");
//   document.body.style.overflow = "hidden";
// }

// function closeModal() {
//   modal.classList.add("hidden");
//   document.body.style.overflow = "";
// }

resultsDiv.addEventListener("click", (e) => {
  const btn = e.target.closest(".show-recipe-btn");
  if (!btn) return;
  const card = btn.closest(".card");

  if (card) {
    const recipeId = card.dataset.id;
    getRecipeDetails(recipeId);
  }
});

async function getRecipeDetails(id) {
  if (!modalContent) return; // Guard clause for modalContent
  
  console.log('Fetching recipe details for ID:', id);
  modalContent.innerHTML = '<p class="message loading">Loading details...</p>';
  
  try {
    showRecipeModal();
    console.log('Modal should be visible now');
    
    const response = await fetch(
      `https://www.themealdb.com/api/json/v1/1/lookup.php?i=${id}`
    );
    if (!response.ok) throw new Error("Failed to fetch recipe details.");
    const data = await response.json();

    console.log("Recipe details received:", data);
    if (data.meals && data.meals.length > 0) {
      displayRecipeDetails(data.meals[0]);
    } else {
      modalContent.innerHTML =
        '<p class="message error">Could not load recipe details.</p>';
    }
  } catch (error) {
    console.error('Error fetching recipe:', error);
    modalContent.innerHTML =
      '<p class="message error">Failed to load recipe details. Check your connection or try again.</p>';
  }
}

// Make sure modal elements exist before adding event listeners
if (modalCloseBtn) {
    modalCloseBtn.addEventListener("click", closeRecipeModal);
}

if (modal) {
    modal.addEventListener("click", (e) => {
        if (e.target === modal) {
            closeRecipeModal();
        }
    });
}

// Add keyboard event listener for ESC key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal && !modal.classList.contains('hidden')) {
        closeRecipeModal();
    }
});

function displayRecipeDetails(recipe) {
  const ingredients = [];

  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe[`strIngredient${i}`]?.trim();
    const measure = recipe[`strMeasure${i}`]?.trim();

    if (ingredient) {
      ingredients.push(`<li>${measure ? `${measure} ` : ""}${ingredient}</li>`);
    } else {
      break;
    }
  }

  const categoryHTML = recipe.strCategory
    ? `<h3>Category: ${recipe.strCategory}</h3>`
    : "";
  const areaHTML = recipe.strArea ? `<h3>Area: ${recipe.strArea}</h3>` : "";
  const ingredientsHTML = ingredients.length
    ? `<h3>Ingredients</h3><ul>${ingredients.join("")}</ul>`
    : "";
  const instructionsHTML = `<h3>Instructions</h3><p>${
    recipe.strInstructions
      ? recipe.strInstructions.replace(/\r?\n/g, "<br>")
      : "Instructions not available."
  }</p>`;
  const youtubeHTML = recipe.strYoutube
    ? `<h3>Video Recipe</h3><div class="video-wrapper"><a href="${recipe.strYoutube}" target="_blank">Watch on YouTube</a><div>`
    : "";
  const sourcHTML = recipe.strSource
    ? `<div class="source-wrapper"><a href="${recipe.strSource}" target="_blank">View Original Source</a></div>`
    : "";

  modalContent.innerHTML = `
  <h2>${recipe.strMeal}</h2>
  <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}">
  ${categoryHTML}
  ${areaHTML}
  ${ingredientsHTML}
  ${instructionsHTML}
  ${youtubeHTML}
  ${sourcHTML}
  `;
}
