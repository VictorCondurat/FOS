document.addEventListener('DOMContentLoaded', () => {
    const userInfoSection = document.getElementById('user-info');

    if (!userInfoSection) return;

    interface User {
        uname: string;
        //email: string;
        //password: string;
        preferredFoods: string;
        alergen: string;
        diet: string;
    }

    fetch('/get-user', { credentials: 'include' })
        .then((response) => {
            console.log(response);
            return response.json();
        })
        .then((users) => {
            users.forEach((user: User) => {
                // Assuming you have corresponding HTML elements for displaying user information
                const usernameElement = document.getElementById('uname');
                //const emailElement = document.getElementById('email');
                // const passwordElement = document.getElementById('password');
                const preferredFoodsElement = document.getElementById('preferred-foods');
                const alergenElement = document.getElementById('alergen');
                const dietElement = document.getElementById('diet');

                if (usernameElement && /*emailElement &&*/ /*passwordElement*/  preferredFoodsElement && alergenElement && dietElement) {
                    displayUserInfo(user, usernameElement, preferredFoodsElement, alergenElement, dietElement);
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

    function displayUserInfo(
        user: User,
        usernameElement: HTMLElement,
        //emailElement: HTMLElement,
        /* passwordElement: HTMLElement*/
        preferredFoodsElement: HTMLElement,
        alergenElement: HTMLElement,
        dietElement: HTMLElement
    ) {
        usernameElement.textContent = user.uname;
        //emailElement.textContent = user.email;
        // passwordElement.textContent = user.password;
        preferredFoodsElement.textContent = user.preferredFoods;
        alergenElement.textContent = user.alergen;
        dietElement.textContent = user.diet;

        /* preferredFoodsElement.innerHTML = '';
        if (Array.isArray(user.preferredFoods)) {
            user.preferredFoods.forEach((food: string) => {
                const li = document.createElement('li');
                li.textContent = food;
                preferredFoodsElement.appendChild(li);
            });
        } */
    }
    const modifyButton = document.getElementById('modify-btn');
    if (modifyButton) {
        modifyButton.addEventListener('click', handleModifyButtonClick);
    }

    function handleModifyButtonClick() {
        // Implement your desired behavior when the "Modify" button is clicked
        // For example, you can show a form or redirect to a separate edit profile page
        // You can access the user information and make the necessary modifications

        // Example: Redirecting to an edit profile page
        window.location.href = 'edit-profile.html';
    }

});