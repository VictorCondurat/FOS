document.addEventListener('DOMContentLoaded', () => {
    const myProfile = document.getElementById('my-profile');
    const userInfoSection = document.getElementById('user-info');
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    const preferredFoodsElement = document.getElementById('preferred-foods');

    if (!userInfoSection || !emailElement || !passwordElement || !preferredFoodsElement) return;

    if (myProfile) {
        myProfile.addEventListener('click', () => {
            const user: User = {
                email: 'example@example.com',
                password: '********',
                preferredFoods: ['Pizza', 'Burger', 'Sushi'],
            };

            displayUserInfo(user, emailElement, passwordElement, preferredFoodsElement);
        });
    }

    const navLinks = document.querySelectorAll('.left-menu a:not(#my-profile)');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            userInfoSection.innerHTML = '';
        });
    });

    interface User {
        email: string;
        password: string;
        preferredFoods: string[];
    }

    function displayUserInfo(user: User, emailElement: HTMLElement, passwordElement: HTMLElement, preferredFoodsElement: HTMLElement) {
        emailElement.textContent = user.email;
        passwordElement.textContent = user.password;

        preferredFoodsElement.innerHTML = '';
        user.preferredFoods.forEach((food: string) => {
            const li = document.createElement('li');
            li.textContent = food;
            preferredFoodsElement.appendChild(li);
        });
    }
});
