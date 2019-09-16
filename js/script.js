"use strict";

// Firebase sign in functionality =============================================

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
// Initialize Firebase ========================================================
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore();
const recipeRef = db.collection("recipes");
const ingredientRef = db.collection("ingredients");
const favouritesRef = db.collection("favourites");
const myRecipesRef = db.collection("myRecipes");
const usersRef = db.collection("users");
let allRecipes = {};
let allIngredients = {};
let myRecipes = {};
let userData = null;
let selectedIngredients = [];
let valueOfInput = {};
let favouriteRecipes = [];

let activePage = "welcome";

// watch the database ref for changes =========================================
recipeRef.onSnapshot(function(snapshotData) {
  let recipes = snapshotData.docs;
  allRecipes = recipes;
  // console.log(snapshotData);
});
// ingredients
ingredientRef.onSnapshot(function(snapshotData) {
  let ingredients = snapshotData.docs;
  allIngredients = ingredients;
  // console.log(allIngredients);

});

usersRef.onSnapshot(function(snapshotData) {
  let users = snapshotData.docs;
  favouriteRecipes = users;
});

// myRecipesRef.onSnapshot(function(snapshotData) {
//   let myRecipes = snapshotData.docs;
//   myRecipes = myRecipesRef;
//   console.log(myRecipes);
//
//   appendMyRecipes(myRecipes);
//
// });

//initialize PLUGIN NAVBAR ====================================================
const tabs = document.querySelector("#tabs")
const tabsInstance = M.Tabs.init(tabs, {
  onShow: function(sectionElement) {
    // console.log(sectionElement.id);

    location.href = `#${sectionElement.id}`;
    activePage = sectionElement.id;
    showPage(sectionElement.id)
  }
});

// initialize the FLOATING BUTTON =============================================
document.addEventListener('DOMContentLoaded', function() {
  let elems = document.querySelectorAll('.fixed-action-btn');
  let instances = M.FloatingActionButton.init(elems, {
    direction: 'left',
    hoverEnabled: false
  });
});
// HIDE AND SHOW PAGES/NAV ====================================================
// hide all pages
function hideAllPages() {
  let pages = document.querySelectorAll(".page");
  for (let page of pages) {
    page.style.display = "none";
  }
};

function showLoader(show) {
  let loader = document.querySelector('#cooking');
  if (show) {
    loader.classList.remove("hide");
    // hideAllPages(pageId, isTab);
  } else {
    loader.classList.add("hide");
  }
}

// show page or tab
function showPage(pageId, isTab) {
  let display = 'block';

  activePage = pageId;
  hideAllPages();

  // hide navbar if welcome or login pages are active
  if (activePage === 'welcome' || activePage === 'login') {
    display = 'flex';

    document.querySelector(".nav-extended").classList.add("hide-navbar")
  } else {
    document.querySelector(".nav-extended").classList.remove("hide-navbar")
  };

  // redirect to log in page if user is not logged in
  if (!userData) {
    if (activePage === 'favourites' || activePage === 'recipes') {
      console.log("you should log in");
      showPage("login");
    }
  }

  document.querySelector(`#${pageId}`).style.display = display;
  setActiveTab(pageId);

  if (isTab) {
    tabsInstance.select(pageId);
  }
  setTimeout(function() {
    showLoader(false);
  }, 2000);

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

let stepNumber = 1;








// Firebase UI configuration ==================================================
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

// Listen on authentication state change ======================================
firebase.auth().onAuthStateChanged(function(user) {
  userData = user;
  setTimeout(function() {
    showLoader(false);
  }, 5000);

  if (user) { // if user exists and is authenticated
    // appendMyRecipes(myRecipes);

    setDefaultPage('search');

    // hide log in button and show profile floating button
    document.getElementById('profile-photo-button').style.display = 'block';
    document.getElementById('navbar-login').style.display = 'none';

    // Show profile photo
    let htmlTemplate = "";
    htmlTemplate = `
    <img id="user-image" class="profile-photo" src="${userData.photoURL}" alt="Profile photo">
    `;
    document.querySelector('.add-profile-photo').innerHTML = htmlTemplate;

    console.log("user is log in");

    // check if....
    favouritesRef.where("userId", "==", user.uid)
      .get()
      .then(function(querySnapshot) {
        querySnapshot.forEach(function(doc) {
          console.log(doc.data());
        });
      })
      .catch(function(error) {
        console.log("Error getting favourites: ", error);
      });
    checkFavourites();
  } else { // if user is not logged in
    // hide profile floating button and show log in button
    document.getElementById('profile-photo-button').style.display = 'none';
    document.getElementById('navbar-login').style.display = 'flex';

    ui.start('#firebaseui-auth-container', uiConfig);
  }
});

let provider = new firebase.auth.FacebookAuthProvider();

provider.addScope('email, picture');

// sign out user
function logout() {
  //firebase.auth().signOut();
  firebase.auth().signOut().then(function() {
    // Sign-out successful.
    console.log("Succes sign out");
    M.toast({
      html: 'Successfuly logged out.'
    })
  }).catch(function(error) {
    // An error happened.
    console.log("Error sign out");
  });
}

// SEARCH-AUTOCOMPLETE FUNCTION ===============================================
// Getting the ingridients from the collection of firebase
db.collection("ingredients").get().then(function(querySnapshot) {
  //Convert the objects to display them on the search
  let data = {};
  let i = 0;
  //Function to get the data(ingridients) to use them in the search
  querySnapshot.forEach(function(doc) {
    data[`${doc.data().name}`] = null;
    i++;
  });

  // console.log(data);
  //let to display the data, in this case, our ingredients and append them to the DOM
  let options = {
    data: data,
    onAutocomplete: function(doc) {
      console.log(doc);
      selectedIngredients.push(doc);
      let htmlTemplate = "";
      htmlTemplate = `
          <li class="ingredients-we-have input-flex">${doc}
          <a class="delete" onclick="deleteInput(this)">
          <i class="material-icons">clear</i>
          </a>
          </li>
        `;
      valueOfInput = doc;
      console.log(valueOfInput);
      document.querySelector("#response").innerHTML += htmlTemplate;
      document.querySelector(".autocomplete").value = "";
      console.log(allRecipes);
    }
  };

  let elems = document.querySelectorAll('.autocomplete');
  let instances = M.Autocomplete.init(elems, options);
});

// FILLTERED RECIPES BY INGREDIENTS AND SEARCH THEM ============================
function searchRecipe() {
  if (selectedIngredients.length === 0) {
    document.querySelector('#recipes-container').innerHTML = "";
  }

  console.log(selectedIngredients);
  let filteredRecipes = [];
  // loop through all recipes
  for (let recipe of allRecipes) {
    // console.log(recipe.data());
    //loop through all ingredients
    for (let ingredient of recipe.data().ingredients) {

      //console.log(ingredient.title);
      if (selectedIngredients.includes(ingredient.title)) {
        filteredRecipes.push(recipe);

        console.log(filteredRecipes);
        // problem with the duplicated recipes solved by using Set (https://wsvincent.com/javascript-remove-duplicates-array/)
        let unique = [...new Set(filteredRecipes)];
        console.log(unique);

        let htmlTemplate = "";
        for (let recipe of unique) {
          htmlTemplate += `
            <div id="recipe-${recipe.id}" class="col s12 m6 l4">
              <div class="card">
                <div class="card-image">
                  <img src="${recipe.data().img}">
                  <a class="btn-floating halfway-fab waves-effect waves-light " onclick="heartFavourites('${recipe.id}')">
                    <i class="material-icons fav">favorite</i>
                  </a>
                </div>
                <div class="card-content">
                <p class="time">${recipe.data().time}'</p>
                  <span class="card-title">${recipe.data().title}</span>
                  <a class="waves-effect waves-light btn radius" onclick="openRecipe('${recipe.id}')">OPEN RECIPE</a>
                </div>
              </div>
            </div>
          `;
        }
        document.querySelector('#recipes-container').innerHTML = htmlTemplate;
      }
    }
  }
};


// OPEN RECIPE =========================================================================================================
function openRecipe(id) {
  const recipe = allRecipes.find(r => r.id === id);
  let htmlTemplate = "";

  // loop throught all ingredients
  let ingredientsTemplate = "";
  for (let recipeIngredient of recipe.data().ingredients) {
    ingredientsTemplate += `<li class="recipe-ingredient" onclick="checked()">${recipeIngredient.amount + " " + recipeIngredient.title}</li>`;
  }
  // loop throught all steps
  let stepsTemplate = "";
  for (let step of recipe.data().steps) {
    stepsTemplate += `<p class="recipe-step">${step}</p>`;
  }

  htmlTemplate = `
  <div class="list">
    <h1 class="recipe-title">${recipe.data().title}</h1>
    <div class="card-image" id="recipe-card-img">
      <img src="${recipe.data().img}">
      <p class="time">${recipe.data().time}'</p>
      <a class="btn-floating halfway-fab waves-effect waves-light recipe-floating-button" onclick="heartFavourites('${recipe.id}')"><i
          class="material-icons fav">favorite</i></a>
    </div>
    <h2>Ingredients</h2>
    <ul class="recipe-ingredients">${ingredientsTemplate}</ul>
    <h2>Steps</h2>
    <div class="recipe-steps">${stepsTemplate}</div>
  </div>
  `;

  document.querySelector('#recipe-page-container').innerHTML = htmlTemplate;

  showPage("recipe");
  // Add a "checked" symbol when clicking on a list item
  function checked() {
    let list = document.querySelector('.list');
    if (ev.target.tagName === 'ul') {
      ev.target.classList.toggle('checked');
    }
    false;
  }
}


// FAVOURITES ==================================================================
// check all favourites after log in
function checkFavourites() {

  usersRef.doc(userData.uid).onSnapshot(function(snapshotData) {
    let myFavs = snapshotData.data().favourites;
    if (myFavs.length === 0) {
      document.querySelector('#favourites-recipes-container').innerHTML = "";
    }
    let selectedRecipes = [];
    for (let myFav of myFavs) {
      recipeRef.doc(myFav).get().then(function(doc) {
        selectedRecipes.push(doc);
        appendFavourites(selectedRecipes);
      });
    }
  });

  // append favourites
  function appendFavourites(selectedRecipes) {
    console.log(selectedRecipes);
    let htmlTemplate = "";
    for (let recipe of selectedRecipes) {
      htmlTemplate += `
      <div class="col s12 m6 l4">
        <div class="card">
          <div class="card-image">
            <img src="${recipe.data().img}">
            <a class="btn-floating halfway-fab waves-effect waves-light " onclick="deleteFavourites('${recipe.id}')">
              <i class="material-icons fav heart">favorite</i>
            </a>
          </div>
          <div class="card-content">
          <p class="time">${recipe.data().time}'</p>
            <span class="card-title">${recipe.data().title}</span>
            <a class="waves-effect waves-light btn radius" onclick="openRecipe('${recipe.id}')">OPEN RECIPE</a>
          </div>
        </div>
      </div>
    `;
    }

    document.querySelector('#favourites-recipes-container').innerHTML = htmlTemplate;
    console.log(recipes);

    // // check if....
    // favouritesRef.where("favourites", "==", selectedRecipes)

  };
};

//ADD AND REMOVE THE RECIPE AS A FAVOURITES ====================================
function heartFavourites(id) {
  const recipeElement = document.querySelector(`#recipe-${id} .fav`);

  // change colour of the add favourite recipes button
  recipeElement.style.color = "red";
  recipeElement.style.background = "white";

  usersRef.doc(userData.uid).set({
    favourites: firebase.firestore.FieldValue.arrayUnion(id)
  }, {
    merge: true
  });
}

function deleteFavourites(id) {
  usersRef.doc(userData.uid).update({
    favourites: firebase.firestore.FieldValue.arrayRemove(id)
  });
}

//MY Recipes

// function appendMyRecipes(myRecipes) {
//   let htmlTemplate = "";
//   console.log(myRecipes);
//   for (let myRecipe of myRecipes) {
//     htmlTemplate += `
//       <div id="myRecipes-${myRecipes.id}" class="col s12 m6 l4">
//         <div class="card">
//           <div class="card-image">
//             <img src="${myRecipes.data().recipe.img}">
//           </div>
//           <div class="card-content">
//           <p class="time">${myRecipes.data().recipe.time}'</p>
//             <span class="card-title">${myRecipes.data().recipe.title}</span>
//             <a class="waves-effect waves-light btn radius" onclick="openRecipe('${myRecipes.id}')">OPEN RECIPE</a>
//           </div>
//         </div>
//       </div>
//     `;
//   }
//   document.querySelector('#myRecipes-container').innerHTML = htmlTemplate;
//   showPage("recipes", isTab);
//   //console.log(myRecipes);
// }
//

// ADD NEW NEW INGREDIENT OF RECIPE IN POP UP ==================================
function addIngredient() {
  let htmlTemplate = "";
  htmlTemplate = `
    <div class="delete-area">
        <div class = "input-field col s6 ingredient-margin">
            <input placeholder = "Amount" id = "amount" type = "text" >
        </div>
        <div class = "input-field col s6 ingredient-margin input-flex">
            <input placeholder = "Ingredient" id = "ingredient" type = "text" >
            <a class="delete" onclick="deleteInputIng(this)">
            <i class="material-icons">clear</i>
            </a>
        </div>

    </div>`;
  document.querySelector('.field-ingredient').innerHTML += htmlTemplate;
};

// ADD THE NEW STEP OF RECIPE IN POP UP ========================================
function addStep() {
  if (stepNumber < 10) {
    stepNumber++

    let htmlTemplate = "";
    htmlTemplate = `
    <div class="delete-area">
    <div class="input-field col s12 input-flex step-${stepNumber}">
    <span class="small-button number-step"> ${stepNumber} </span>
    <input type = "text" placeholder="Type another step of the recipe">
    <a class="delete" onclick="deleteInput(this)">
    <i class="material-icons">clear</i>
    </a>
    </div>
    </div>`;
    document.querySelector('.policko').innerHTML += htmlTemplate;
  }
};

// DELETE THE INPUT IN LIST OF SEARCH ==========================================
function deleteInput(element) {
  //delete an element from an array - https://love2dev.com/blog/javascript-remove-from-array/#remove-from-array-splice-value
  for (var i = 0; i < selectedIngredients.length; i++) {
    if (selectedIngredients[i] === valueOfInput) {
      selectedIngredients.splice(0, 1);
    }
  }
  element.parentNode.remove();
};

function deleteInputIng() {
  let element = document.querySelector(".delete-area");
  element.parentNode.removeChild(element);
};

// SAVING NEW RECIPE ==========================================================
function newRecipe() {
  // references to the input fields
  let titleInput = document.querySelector('#title');
  let pictureInput = document.querySelector('#mail');
  let ingredients = document.querySelector('#ingredients');
  let steps = document.querySelector('#steps').value;
  // console.log(titleInput.value);
  // console.log(pictureInput.value);

  for (let step of steps) {
    steps = [`
        step${stepNumber}= step-${stepNumber}.value;
        `];
    console.log(steps);
  };

  let newRecipe = [
    title = titleInput.value,
    picture = pictureInput.value,
  ];

  myRecipesRef.add(newRecipe);
}