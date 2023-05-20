"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const userInfoSection = document.getElementById('user-info');
    if (!userInfoSection)
        return;
    fetch('/get-user')
        .then((response) => response.json())
        .then((users) => {
        users.forEach((user) => {
            // Assuming you have corresponding HTML elements for displaying user information
            const usernameElement = document.getElementById('uname');
            const emailElement = document.getElementById('email');
            const passwordElement = document.getElementById('password');
            const preferredFoodsElement = document.getElementById('preferred-foods');
            const alergenElement = document.getElementById('alergen');
            const dietElement = document.getElementById('diet');
            if (usernameElement && emailElement && passwordElement && preferredFoodsElement && alergenElement && dietElement) {
                displayUserInfo(user, usernameElement, emailElement, passwordElement, preferredFoodsElement, alergenElement, dietElement);
            }
        });
    })
        .catch((error) => {
        console.error('Error fetching user data:', error);
    });
    const navLinks = document.querySelectorAll('.left-menu a:not(#my-profile)');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            userInfoSection.innerHTML = '';
        });
    });
    function displayUserInfo(user, usernameElement, emailElement, passwordElement, preferredFoodsElement, alergenElement, dietElement) {
        usernameElement.textContent = user.uname;
        emailElement.textContent = user.email;
        passwordElement.textContent = user.password;
        alergenElement.textContent = user.alergen;
        dietElement.textContent = user.diet;
        preferredFoodsElement.innerHTML = '';
        if (Array.isArray(user.preferredFoods)) {
            user.preferredFoods.forEach((food) => {
                const li = document.createElement('li');
                li.textContent = food;
                preferredFoodsElement.appendChild(li);
            });
        }
    }
});
