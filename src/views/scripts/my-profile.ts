document.addEventListener('DOMContentLoaded', () => {
    const myProfile = document.getElementById('my-profile');
    const userInfoSection = document.getElementById('user-info');

    if (!userInfoSection) return;

    if (myProfile) {
        myProfile.addEventListener('click', () => {
            const user = {
                mail: 'geocaru@gmail.com',
                pass: 'jsda123',
                preferedFoods: ['Broccoli', 'Salmon', 'Quinoa']
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

function displayUserInfo(user: { mail: string; pass: string; preferedFoods: string[] }, container: HTMLElement | null) {
    if (!container) return;

    container.innerHTML = '';

    const mail = document.createElement('span');
    mail.textContent = user.mail;

    const pass = document.createElement('span');
    pass.textContent = user.pass;

    const preferedFoods = document.createElement('ul');
    user.preferedFoods.forEach((food) => {
        const li = document.createElement('li');
        li.textContent = food;
        preferedFoods.appendChild(li);
    });

    container.querySelector('#mail')?.appendChild(mail);
    container.querySelector('#pass')?.appendChild(pass);
    container.querySelector('#prefered-foods')?.appendChild(preferedFoods);
}
