document.addEventListener('DOMContentLoaded', () => {
    const myProfile = document.getElementById('my-profile');
    const userInfoSection = document.getElementById('user-info');

    if (!userInfoSection) return;

    if (myProfile) {
        myProfile.addEventListener('click', () => {
            const user = {
                email: 'example@example.com',
                password: '********',
                preferredFoods: ['Pizza', 'Burger', 'Sushi'],
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

interface User {
    email: string;
    password: string;
    preferredFoods: string[];
}

function displayUserInfo(user: User, container: HTMLElement | null) {
    if (!container) return;

    container.innerHTML = '';

    const email = document.createElement('p');
    email.textContent = 'Email: ' + user.email;

    const password = document.createElement('p');
    password.textContent = 'Password: ' + user.password;

    const preferredFoods = document.createElement('ul');
    user.preferredFoods.forEach((food) => {
        const li = document.createElement('li');
        li.textContent = food;
        preferredFoods.appendChild(li);
    });

    container.appendChild(email);
    container.appendChild(password);
    container.appendChild(preferredFoods);
}
