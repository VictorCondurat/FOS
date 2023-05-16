"use strict";

document.addEventListener('DOMContentLoaded', () => {
    const myProfile = document.getElementById('my-profile');
    const userInfoSection = document.getElementById('user-info');
    if (!userInfoSection)
        return;
    if (myProfile) {
        myProfile.addEventListener('click', () => {
            const user = {
                weight: 70,
                height: 175,
                recommendedFoods: ['Broccoli', 'Salmon', 'Quinoa']
            };
            displayUserInfo(user, userInfoSection);
        });
    }
    const navLinks = document.querySelectorAll('.left-menu a:not(#my-profile)');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            userInfoSection.innerHTML = '';
        });
    });
});

function displayUserInfo(user, container) {
    if (!container)
        return;
    container.innerHTML = '';
    const weight = document.createElement('span');
    weight.textContent = user.weight + ' kg';
    const height = document.createElement('span');
    height.textContent = user.height + ' cm';
    const recommendedFoods = document.createElement('ul');
    user.recommendedFoods.forEach((food) => {
        const li = document.createElement('li');
        li.textContent = food;
        recommendedFoods.appendChild(li);
    });
    container.querySelector('#weight').appendChild(weight);
    container.querySelector('#height').appendChild(height);
    container.querySelector('#recommended-foods').appendChild(recommendedFoods);
}
