"use strict";

let activePage = "welcome";

// initialize the plugin navbar
const tabs = document.querySelector("#tabs")
const tabsInstance = M.Tabs.init(tabs, {
  onShow: function (sectionElement) {
    // console.log(sectionElement.id);

    location.href = `#${sectionElement.id}`;
    activePage = sectionElement.id;
  }
});

// initialize the floating button
document.addEventListener('DOMContentLoaded', function () {
  let elems = document.querySelectorAll('.fixed-action-btn');
  let instances = M.FloatingActionButton.init(elems, {
    direction: 'left',
    hoverEnabled: false
  });
});

//
// function showLoader(show) {
//   let loader = document.querySelector('#cooking');
//   if (show) {
//     loader.classList.remove("hide");
//   } else {
//     loader.classList.add("hide");
//   }
// }


// hide all pages
function hideAllPages() {
  let pages = document.querySelectorAll(".page");
  for (let page of pages) {
    page.style.display = "none";
  }
};

// show page or tab
function showPage(pageId, isTab) {
  let display = 'block';

  activePage = pageId;
  hideAllPages();

  // hide navbar if welcome or login page are active
  if (activePage === 'welcome' || activePage === 'login') {
    display = 'flex';
    document.querySelector(".nav-extended").classList.add("hide-navbar")
  } else {
    document.querySelector(".nav-extended").classList.remove("hide-navbar")
  }

  document.querySelector(`#${pageId}`).style.display = display;
  setActiveTab(pageId);

  if (isTab) {
    tabsInstance.select(pageId);
  }
  // setTimeout(function() {
  //   showLoader(false);
  // }, 900);

};

// sets active tabbar/ menu item
function setActiveTab(pageId) {
  let pages = document.querySelectorAll(".nav-extended a");

  for (let page of pages) {
    if (`#${pageId}` === page.getAttribute("href")) {
      page.classList.add("active");
    } else {
      page.classList.remove("active");
    }
  }
};

// set default page
function setDefaultPage() {
  let page = "welcome";

  if (location.hash) {
    page = location.hash.slice(1);

  }

  showPage(page);
};

setDefaultPage();

// ========== Firebase sign in functionality ========== //

// Your web app's Firebase configuration
let firebaseConfig = {
  apiKey: "AIzaSyAcZVFE2aDY5jyAvPGI3K0eD_y7ZcL0Wmo",
  authDomain: "whats-in-your-fridge-59e9e.firebaseapp.com",
  databaseURL: "https://whats-in-your-fridge-59e9e.firebaseio.com",
  projectId: "whats-in-your-fridge-59e9e",
  storageBucket: "whats-in-your-fridge-59e9e.appspot.com",
  messagingSenderId: "510325509620",
  appId: "1:510325509620:web:ccc332572aca6af57cbda1"
};
// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const recipeRef = db.collection("recipes");
const ingredientRef = db.collection("ingredients");
let allRecipes = {};

// watch the database ref for changes
recipeRef.onSnapshot(function (snapshotData) {
  let recipes = snapshotData.docs;
  allRecipes = recipes;
  // console.log(snapshotData);
  appendRecipes(recipes);
});
// ingredients
ingredientRef.onSnapshot(function (snapshotData) {
  let ingredients = snapshotData.docs;
  // console.log(snapshotData);
  appendIngredients(ingredients);
});

// Firebase UI configuration
const uiConfig = {
  credentialHelper: firebaseui.auth.CredentialHelper.NONE,
  signInOptions: [
    firebase.auth.GoogleAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
  ],
  signInSuccessUrl: '#search',
};

// Init Firebase UI Authentication
const ui = new firebaseui.auth.AuthUI(firebase.auth());

// Listen on authentication state change
firebase.auth().onAuthStateChanged(function (user) {
  // let tabbar = document.querySelector('#tabbar');
  // console.log(user);
  if (user) { // if user exists and is authenticated

    setDefaultPage('search');
    //  tabbar.classList.remove("hide");
  } else { // if user is not logged in
    // showPage("login");
    // tabbar.classList.add("hide");

    ui.start('#firebaseui-auth-container', uiConfig);
  }
});

// sign out user
function logout() {

  //firebase.auth().signOut();
  firebase.auth().signOut().then(function () {

    // Sign-out successful.
    console.log("Succes sign out");
  }).catch(function (error) {

    // An error happened.
    console.log("Error sign out");
  });
}



// RECIPES

console.log("user is log in");

function appendRecipes(recipes) {
  let htmlTemplate = "";
  for (let recipe of recipes) {
    htmlTemplate += `
      <div class="col s12 m6 l4">
        <div class="card">
          <div class="card-image">
            <img src="${recipe.data().img}">
            <a class="btn-floating halfway-fab waves-effect waves-light " onclick="favourite()">
              <i class="material-icons">favorite</i>
            </a>
          </div>
          <div class="card-content">
          <p class="time">${recipe.data().time}'</p>
            <span class="card-title">${recipe.data().title}</span>
            <ul>
              <li>${recipe.data().ingredients}</li>
            </ul>
            <a class="waves-effect waves-light btn radius" onclick="openRecipe('${recipe.id}')">OPEN RECIPE</a>
          </div>
        </div>
      </div>
    `;
  }
  document.querySelector('#recipes-container').innerHTML = htmlTemplate;
  console.log(recipes);
}

function openRecipe(id) {
  const recipe = allRecipes.find(r => r.id === id);
  console.log(recipe);
  let htmlTemplate = "";
  let steps = recipe.data().steps.map(step => {
    console.log(step);
    return `<p class="recipe-step">${step}</p>`
  })

  htmlTemplate = `
  <div>
    <h1 class="recipe-title">${recipe.data().title}</h1>
    <div class="card-image" id="recipe-card-img">
      <img src="${recipe.data().img}">
      <p class="time">${recipe.data().time}'</p>
      <a class="btn-floating halfway-fab waves-effect waves-light recipe-floating-button" onclick="favourite()"><i
          class="material-icons">favorite</i></a>
    </div>
    <h2>Ingredients</h2>
    <ul class="recipe-ingredients">
      <li class="recipe-ingredient">${recipe.data().ingredients}</li>
    </ul>
    <h2>Steps</h2>
    <div class="recipe-steps">${steps}</div>
  </div>
  `;

  document.querySelector('#recipe-page-container').innerHTML = htmlTemplate;

  showPage("recipe");
}

// search function
function appendIngredients(ingredients) {
  let htmlTemplate = "";
  for (let ingredient of ingredients) {
    // console.log(ingredient.data().name);
    htmlTemplate = `
    <ul>
      <li>${ingredient.data().name}</li>
    </ul>
    `;
  }
  document.querySelector('.autocomplete').innerHTML = htmlTemplate;

}

// initialize autocomplete search
document.addEventListener('DOMContentLoaded', function () {
  let options = {
    data: {
      "Apple": null,
      "Microsoft": null,
      "Google": 'https://placehold.it/250x250'
    },
    onAutocomplete: function (text) {
      response.innerHTML = '<h3>helloo:</h3>'
    }
  }
  let elems = document.querySelectorAll('.autocomplete');
  let instances = M.Autocomplete.init(elems, options);
});

let response = document.getElementById('response');


// function search() {

// }


function addStep() {
  let htmlTemplate = "";
  htmlTemplate = `
    <input id="step" placeholder="Type another step of the recipe">`;
  console.log(htmlTemplate);
  document.querySelector('.policko').innerHTML += htmlTemplate;
};

//POP UP - NEW RECIPE
function newRecipe() {
  // references to the input fields
  let titleInput = document.querySelector('#title');
  let pictureInput = document.querySelector('#mail');
  console.log(titleInput.value);
  console.log(pictureInput.value);

  let newUser = {
    title: titleInput.value,
    picture: pictureInput.value
  };

  recipeRef.add(newRecipe);
}