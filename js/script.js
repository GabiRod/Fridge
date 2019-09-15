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

  // // redirect to log in page if user is not logged in
  // if (activePage === 'favourites' || activePage === 'recipes') {
  //   console.log("you are shit");
  //   showPage("login");
  // } else {
  //   console.log("you are not clicking on favourite or recipes page");
  // };

  document.querySelector(`#${pageId}`).style.display = display;
  setActiveTab(pageId);

  if (isTab) {
    tabsInstance.select(pageId);
  }
  setTimeout(function () {
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
const favouritesRef = db.collection("favourites");
const myRecipesRef = db.collection("myRecipes");
let allRecipes = {};
let allIngredients = {};
let myRecipes = {};
let userData = null;

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
  allIngredients = ingredients;
  // console.log(allIngredients);

});

// myRecipesRef.onSnapshot(function(snapshotData) {
//   let myRecipes = snapshotData.docs;
//   myRecipes = myRecipesRef;
//   console.log(myRecipes);
//
//   appendMyRecipes(myRecipes);
//
// });


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
  userData = user;
  setTimeout(function () {
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

    favouritesRef.where("userId", "==", user.uid)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          console.log(doc.data());
        });
      })
      .catch(function (error) {
        console.log("Error getting favourites: ", error);
      });

  } else { // if user is not logged in
    // hide profile floating button and show log in button
    document.getElementById('profile-photo-button').style.display = 'none';
    document.getElementById('navbar-login').style.display = 'flex';

    // if (activePage === "favourites" || activePage === "recipes") {
    //   console.log("im log out on fav / recipes")
    //   showPage("login");
    // } else {
    //   console.log("im log out")
    // }

    ui.start('#firebaseui-auth-container', uiConfig);
  }
});
let provider = new firebase.auth.FacebookAuthProvider();
provider.addScope('email, picture');

// sign out user
function logout() {
  //firebase.auth().signOut();
  firebase.auth().signOut().then(function () {
    // Sign-out successful.
    console.log("Succes sign out");
    M.toast({
      html: 'Successfuly logged out.'
    })
  }).catch(function (error) {
    // An error happened.
    console.log("Error sign out");
  });
}

// RECIPES
function appendRecipes(recipes) {
  let htmlTemplate = "";
  for (let recipe of recipes) {
    htmlTemplate += `
      <div id="recipe-${recipe.id}" class="col s12 m6 l4">
        <div class="card">
          <div class="card-image">
            <img src="${recipe.data().img}">
            <a class="btn-floating halfway-fab waves-effect waves-light " onclick="favourite('${recipe.id}');">
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

function openRecipe(id) {
  const recipe = allRecipes.find(r => r.id === id);
  let htmlTemplate = "";
  // loop throught all steps
  let steps = recipe.data().steps.map(step => {
    return `<p class="recipe-step">${step}</p>`
  })

  // loop throught all ingredients
  let recipeIngredients = recipe.data().ingredients.map(recipeIngredient => {
    // console.log(recipeIngredient.title);
    return `<li class="recipe-ingredient">${recipeIngredient.amount + " " + recipeIngredient.title}</li>`
  })

  htmlTemplate = `
  <div>
    <h1 class="recipe-title">${recipe.data().title}</h1>
    <div class="card-image" id="recipe-card-img">
      <img src="${recipe.data().img}">
      <p class="time">${recipe.data().time}'</p>
      <a class="btn-floating halfway-fab waves-effect waves-light recipe-floating-button" onclick="favourite('${recipe.id}')"><i
          class="material-icons fav">favorite</i></a>
    </div>
    <h2>Ingredients</h2>
    <ul class="recipe-ingredients">${recipeIngredients}</ul>
    <h2>Steps</h2>
    <div class="recipe-steps">${steps}</div>
  </div>
  `;

  document.querySelector('#recipe-page-container').innerHTML = htmlTemplate;

  showPage("recipe");
}

// add or remove recipe from favourites
function favourite(id) {
  const recipeElement = document.querySelector(`#recipe-${id} .fav`);

  // change colour of the add favourite recipes button
  recipeElement.style.color = "red";
  recipeElement.style.background = "white";

  // console.log(userData.uid);
  // console.log(`recipes/${id}`);

  // favouritesRef.where("recipe", "==", `recipes/${id}`)
  //   .get()
  //   .then(function (querySnapshot) {
  //     console.log("snapshot", querySnapshot);

  //     querySnapshot.forEach(function (doc) {
  //       console.log(doc.data());
  //     });
  //   })
  //   .catch(function (error) {
  //     console.log("Error getting favourites: ", error);
  //   });

  // find rcipe by id
  // const recipe = allRecipes.find(r => r.id === id);



  // check if recipe is in favourites https://stackoverflow.com/questions/37910008/check-if-value-exists-in-firebase-db
  //favouritesRef.orderByChild
  // firebase.database().ref("favourites").orderByChild("recipe").equalTo(recipe).once("value", snapshot => {
  //   if (snapshot.exists()) {
  //     const userData = snapshot.val();
  //     console.log("exists!", userData);


  //   }
  // });

  // favouritesRef.child(recipe).equalTo("recipe").once('value', function (snapshot) {
  //   if (snapshot.exists()) {
  //     alert('exists');
  //   } else {
  //     alert('nope');
  //   }
  // });





  // let htmlTemplate = "";

  // for (let recipe of recipes) {
  //   htmlTemplate += `
  //     <div class="col s12 m6 l4">
  //       <div class="card">
  //         <div class="card-image">
  //           <img src="${recipe.data().img}">
  //           <a class="btn-floating halfway-fab waves-effect waves-light " onclick="favourite();">
  //             <i class="material-icons fav">favorite</i>
  //           </a>
  //         </div>
  //         <div class="card-content">
  //         <p class="time">${recipe.data().time}'</p>
  //           <span class="card-title">${recipe.data().title}</span>
  //           <a class="waves-effect waves-light btn radius" onclick="openRecipe('${recipe.id}')">OPEN RECIPE</a>
  //         </div>
  //       </div>
  //     </div>
  //   `;
  // }
  // document.querySelector('#recipes-container').innerHTML = htmlTemplate;
  // console.log(recipes);
}

// search-autocomplete function
// Getting the ingridients from the collection of firebase
db.collection("ingredients").get().then(function (querySnapshot) {
  //Convert the objects to display them on the search
  let data = {};
  let i = 0;
  //Function to get the data(ingridients) to use them in the search
  querySnapshot.forEach(function (doc) {
    data[`${doc.data().name}`] = null;
    i++;
  });

  // console.log(data);
  //let to display the data, in this case, our ingredients and append them to the DOM
  let options = {
    data: data,
    onAutocomplete: function (doc) {
      console.log(doc);
      let htmlTemplate = "";
      htmlTemplate = `
          <li class="ingredients-we-have input-flex">${doc}
          <a class="delete" onclick="deleteInput(this)">
          <i class="material-icons">clear</i>
          </a>
          </li>
        `;

      document.querySelector("#response").innerHTML += htmlTemplate;
      document.querySelector(".autocomplete").value = "";

      console.log(allRecipes);
      // //  allRecipes.filter(recipe => recipe.ingredients.data().title.some(recipes => recipes.ingredients.title.includes(doc)));
      // let recipeIngredients = allRecipes.data().ingredients.map(recipeIngredient => {
      //   // console.log(recipeIngredient.title);
      //   return recipeIngredient.title
      // })

      let filteredRecipes = [];
      for (let recipe of allRecipes) {
        let ingredient = allRecipes.ingredients;
        if (ingredient.includes(doc)) {
          filteredRecipes.push(recipe);
          console.log(filteredRecipes);

        }
      }
    }
  };

  let elems = document.querySelectorAll('.autocomplete');
  let instances = M.Autocomplete.init(elems, options);
});


// filtering ingredients

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

// add nwe input of ingredient
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

// ad new step of recipe
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

function deleteInput(element) {
  element.parentNode.remove();
  //  let element = document.querySelector(".delete-area");
  //element.parentNode.removeChild(element);
  //  button.parentNode.removeChild(button);
};

function deleteInputIng() {
  let element = document.querySelector(".delete-area");
  element.parentNode.removeChild(element);
};


//POP UP - NEW RECIPE
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