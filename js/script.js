"use strict";

let activePage = "welcome";

// initialize the plugin navbar
const tabs = document.querySelector("#tabs")
const tabsInstance = M.Tabs.init(tabs, {
  onShow: function(sectionElement) {
    // console.log(sectionElement.id);

    location.href = `#${sectionElement.id}`;
    activePage = sectionElement.id;
  }
});

// initialize the floating button
document.addEventListener('DOMContentLoaded', function() {
  let elems = document.querySelectorAll('.fixed-action-btn');
  let instances = M.FloatingActionButton.init(elems, {
    direction: 'left',
    hoverEnabled: false
  });
});

// function showLoader(show) {
//   let loader = document.querySelector('#cooking');
//   if (show) {
//     loader.classList.remove("hide");
//   } else {
//     loader.classList.add("hide");
//   }
// }
//
// setTimeout(function() {
//   showLoader(false);
// }, 900);

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
var firebaseConfig = {
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
// console.log(recipeRef);

// watch the database ref for changes
recipeRef.onSnapshot(function(snapshotData) {
  let recipes = snapshotData.docs;
  // console.log(snapshotData);
  appendRecipes(recipes);
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
firebase.auth().onAuthStateChanged(function(user) {
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

// // Google sign in
// function signInWithPopup() {
//   var provider = new firebase.auth.GoogleAuthProvider();
//   //  provider.addScope('https://www.googleapis.com/auth/plus.login');
//   firebase.auth().signInWithPopup(provider).then(function (result) {
//     var token = result.credential.accessToken;
//     var user = result.user;
//   }).catch(function (error) {
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     var email = error.email;
//     var credential = error.credential;
//   });
// }

// // Facebook sign in
// function facebook() {
//   var provider = new firebase.auth.FacebookAuthProvider();

//   firebase.auth().signInWithPopup(provider).then(function (result) {
//     // This gives you a Facebook Access Token. You can use it to access the Facebook API.
//     var token = result.credential.accessToken;
//     // The signed-in user info.
//     var user = result.user;
//     // ...
//   }).catch(function (error) {
//     // Handle Errors here.
//     var errorCode = error.code;
//     var errorMessage = error.message;
//     // The email of the user's account used.
//     var email = error.email;
//     // The firebase.auth.AuthCredential type that was used.
//     var credential = error.credential;
//     // ...
//   });
// }

// sign out user
function logout() {

  //firebase.auth().signOut();
  firebase.auth().signOut().then(function() {

    // Sign-out successful.
    console.log("Succes sign out");
  }).catch(function(error) {

    // An error happened.
    console.log("Error sign out");
  });
}

// RECIPES
function appendRecipes(recipes) {
  let htmlTemplate = "";
  for (let recipe of recipes) {
    // console.log(recipe.data());
    // console.log(recipe.data().title);

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
          </div>
        </div>
      </div>
    `;
  }
  document.querySelector('#recipes-container').innerHTML = htmlTemplate;
}

// for recipe itself
/* <div class="col s12 m6 l4">
  <div class="card">
    <div class="card-image">
      <img src="${recipe.data().img}">
        <a class="btn-floating halfway-fab waves-effect waves-light " onclick="favourite()">
          <i class="material-icons">favorite</i>
        </a>
    </div>
    <div class="card-content">
      <p>${recipe.data().time}</p>
      <span class="card-title">${recipe.data().title}</span>
      <ul>
        <li>${recipe.data().ingredients}</li>
      </ul>
      <p>${recipe.data().steps}</p>
    </div>
  </div>
</div> */

// searcrh function

// function search() {

// }