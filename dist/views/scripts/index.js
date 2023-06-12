import { toggleMobileMenu } from './toggleMobileMenu.js';
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}
const logoutButton = document.getElementById("logout");
function logout() {
    console.log("Logout button clicked"); // Add this console.log statement
    // Clear the session cookie by setting an expired date
    document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=None; Secure';
    // Redirect the user to the login page or any other desired page
    window.location.href = '/login.html'; // Redirect to the login page
}
if (logoutButton) {
    logoutButton.addEventListener('click', logout);
}
/* // Check user's login status and update the buttons accordingly
window.addEventListener('DOMContentLoaded', () => {
    console.log("Something");
    const loggedIn = checkUserLoginStatus(); // Function to check user's login status

    if (loggedIn) {
        // User is logged in, hide login and sign-up buttons, and display logout button
        const loginButton = document.querySelector('.header__navbar-button--login') as HTMLButtonElement;
        const signUpButton = document.querySelector('.header__navbar-button--signup') as HTMLButtonElement;
        console.log("Logged in");
        if (loginButton && signUpButton && signUpButton.parentNode) {
            const logoutButton = document.createElement('button');
            logoutButton.className = 'header__navbar-button header__navbar-button--logout';
            logoutButton.textContent = 'Logout';
            logoutButton.addEventListener('click', logout);

            signUpButton.parentNode.insertBefore(logoutButton, signUpButton.nextSibling);
            loginButton.style.display = 'none';
            signUpButton.style.display = 'none';
        }
    }
});

// // Helper function to check the user's login status
function checkUserLoginStatus() {
   // Retrieve the value of the session cookie
    const sessionCookie = getSessionCookie();
    console.log(sessionCookie);
    // Check if the session cookie exists
    return sessionCookie !== '';
}

// // Helper function to retrieve the value of the session cookie
function getSessionCookie() {
    const cookieString = document.cookie;
    const cookies = cookieString.split(';');

    for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i].trim();

        // Check if the cookie starts with "session="
       if (cookie.startsWith('session=')) {
           // Return the value of the session cookie
            return cookie.substring('session='.length);
        }
    }

    return ''; // Session cookie not found
}

function logout() {
//     // Clear the session cookie by setting an expired date
//     document.cookie = 'session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = "name=session; max-age=0";
//     // Redirect the user to the login page or any other desired page
      window.location.href = '/login.html'; // Redirect to the login page
}
*/ 
