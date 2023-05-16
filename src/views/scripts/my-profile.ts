document.addEventListener('DOMContentLoaded', () => {
    //const myProfile = document.getElementById('my-profile');
    const userInfoSection = document.getElementById('user-info');
    const usernameElement = document.getElementById('uname');
    const emailElement = document.getElementById('email');
    const passwordElement = document.getElementById('password');
    const preferredFoodsElement = document.getElementById('preferred-foods');

    if (!userInfoSection || !usernameElement || !emailElement || !passwordElement || !preferredFoodsElement) return;


    const user: User = {
        uname: 'Man123',
        email: 'example@example.com',
        password: '********',
        preferredFoods: ['Pizza', 'Burger', 'Sushi']
    };

    displayUserInfo(user, usernameElement, emailElement, passwordElement, preferredFoodsElement);


    const navLinks = document.querySelectorAll('.left-menu a:not(#my-profile)');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            userInfoSection.innerHTML = '';
        });
    });

    interface User {
        uname: string,
        email: string,
        password: string,
        preferredFoods: string[]
    }

    function displayUserInfo(user: User, usernameElement: HTMLElement, emailElement: HTMLElement, passwordElement: HTMLElement, preferredFoodsElement: HTMLElement) {
        usernameElement.textContent = user.uname;
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
