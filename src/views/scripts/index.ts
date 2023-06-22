function toggleMobileMenu() {
    const mobileMenuContent = document.querySelector('.header__navbar-dropdown-mobile') as HTMLElement;

    if (mobileMenuContent) {
        if (mobileMenuContent.style.display === 'block') {
            mobileMenuContent.style.display = 'none';
        } else {
            mobileMenuContent.style.display = 'block';
        }

        mobileMenuContent.addEventListener('mouseleave', () => {
            mobileMenuContent.style.display = 'none';
        });
    }
}

function getCookie(name: string): string | null {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2) return parts.pop()?.split(";").shift() || null;
    return null;
}

document.getElementById('dashboard-link')?.addEventListener('click', function (e: Event) {
    const username = getCookie("username");
    if (!username) {
        e.preventDefault();
        window.location.href = './login.html';
    }
});

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}