"use strict";

// initialize the plugin navbar
const tabs = document.querySelector("#tabs")
const instance = M.Tabs.init(tabs);

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

let activePage = "welcome";

// hide all pages
function hideAllPages() {
  let pages = document.querySelectorAll(".page");
  for (let page of pages) {
    page.style.display = "none";
  }
};

// show page or tab
function showPage(pageId) {
  activePage = pageId;

  hideAllPages();
  document.querySelector(`#${pageId}`).style.display = "block";
  location.href = `#${pageId}`;
  setActiveTab(pageId);

  // load posts if activePage === "movie"
  if (activePage === "welcome") {
    console.log("Hello")
    document.querySelector(".nav-extended").classList.add("hide-navbar")
  } else {
    document.querySelector(".nav-extended").classList.remove("hide-navbar")
  }

  if (activePage === "login") {
    console.log("Hello")
    document.querySelector(".nav-extended").classList.add("hide-navbar")
  } else {
    document.querySelector(".nav-extended").classList.remove("hide-navbar")
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

// add anchor
// if ($active.length > 0) {
//   var id = $(this).parent().attr('id');
//   $('a[href="#'+id+'"]').trigger('click');
// }

// RECIPES

// function appendRecipes(recipes) {
//   let htmlTemplate = "";
//   for (let recipe of recipes) {
//     console.log(recipe.id);
//     console.log(recipe.data().title);
//     htmlTemplate += `
//       <div class="col s12 m6">
//         <div class="card">
//           <div class="card-image">
//             <img src="${recipe.data().img}">
//             <a class="btn-floating halfway-fab waves-effect waves-light " onclick="favourite()">
//               <i class="material-icons">favorite</i>
//             </a>
//           </div>
//           <div class="card-content">
//           <p>${recipe.data().time}</p>
//             <span class="card-title">${recipe.data().title}</span>
//             <ul>
//               <li>${recipe.data().ingridients}</li>
//             </ul>
//             <p>${recipe.data().steps}</p>
//           </div>
//         </div>
//       </div>
//     `;
//   }
//   document.querySelector('#recipes-container').innerHTML = htmlTemplate;
// }

// facebook log in
function statusChangeCallback(response) { // Called with the results from FB.getLoginStatus().
  console.log('statusChangeCallback');
  console.log(response); // The current login status of the person.
  if (response.status === 'connected') { // Logged into your webpage and Facebook.
    testAPI();
  } else { // Not logged into your webpage or we are unable to tell.
    document.getElementById('status').innerHTML = 'Please log ' +
      'into this webpage.';
  }
}

function checkLoginState() { // Called when a person is finished with the Login Button.
  FB.getLoginStatus(function(response) { // See the onlogin handler
    statusChangeCallback(response);
  });
}

window.fbAsyncInit = function() {
  FB.init({
    appId: '{502338947216772}',
    cookie: true, // Enable cookies to allow the server to access the session.
    xfbml: true, // Parse social plugins on this webpage.
    version: '{v4.0.}' // Use this Graph API version for this call.
  });

  FB.getLoginStatus(function(response) { // Called after the JS SDK has been initialized.
    statusChangeCallback(response); // Returns the login status.
  });
};

(function(d, s, id) { // Load the SDK asynchronously
  var js, fjs = d.getElementsByTagName(s)[0];
  if (d.getElementById(id)) return;
  js = d.createElement(s);
  js.id = id;
  js.src = "https://connect.facebook.net/en_US/sdk.js";
  fjs.parentNode.insertBefore(js, fjs);
}(document, 'script', 'facebook-jssdk'));

function testAPI() { // Testing Graph API after login.  See statusChangeCallback() for when this call is made.
  console.log('Welcome!  Fetching your information.... ');
  FB.api('/me', function(response) {
    console.log('Successful login for: ' + response.name);

  });
}
