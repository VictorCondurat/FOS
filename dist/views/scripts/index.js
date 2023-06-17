import { toggleMobileMenu } from './toggleMobileMenu.js';
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}
const logoutButton = document.getElementById('logout');
if (logoutButton) {
    logoutButton.addEventListener('click', () => {
        fetch('/logout', {
            method: 'GET',
            credentials: 'same-origin' // ensures that the request includes session cookies
        })
            .then(response => {
            if (response.ok) {
                // Logout successful, perform any additional necessary actions
                console.log('Logout successful');
                // Redirect the user to the login page or another relevant page
                window.location.href = './login.html';
            }
            else {
                // Logout failed, display an error message or take appropriate actions
                console.error('Logout failed');
            }
        })
            .catch(error => {
            console.error('Logout error:', error);
        });
    });
}
const exportButton = document.getElementById('export');
if (exportButton) {
    exportButton.addEventListener('click', () => {
        fetch('/export', {
            method: 'GET',
        })
            .then((response) => {
            if (response.ok) {
                // Răspunsul este OK, deci putem trata datele exportate
                // Verifică header-urile răspunsului pentru a determina formatul
                const contentType = response.headers.get('Content-Type');
                if (contentType === 'application/pdf') {
                    // Răspunsul este în format PDF
                    return response.arrayBuffer().then((pdfData) => {
                        // Utilizează datele PDF
                        console.log(pdfData);
                    });
                }
                else {
                    // Formatul răspunsului nu este suportat
                    throw new Error('Formatul răspunsului nu este suportat');
                }
            }
            else {
                // Răspunsul a întors o eroare
                throw new Error('Eroare la obținerea datelor exportate');
            }
        })
            .catch((error) => {
            // Gestionarea erorilor
            console.error(error);
        });
    });
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
