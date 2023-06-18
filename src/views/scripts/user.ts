document.addEventListener('DOMContentLoaded', (event) => {
    const cookies = document.cookie.split(';');
    let username = '';

    for (let i = 0; i < cookies.length; i++) {
        let cookie = cookies[i];
        while (cookie.charAt(0) == ' ') {
            cookie = cookie.substring(1);
        }
        if (cookie.indexOf('username=') == 0) {
            username = cookie.substring('username='.length, cookie.length);
        }
    }

    if (username) {
        const navbarRight = document.querySelector('.header__navbar-right');
        if (navbarRight) {
            navbarRight.innerHTML = `
                <a class="header__navbar-item" href="./user-settings.html">User Settings</a>
                <span>Welcome ${username}</span>
            `;
        }
    }
});
