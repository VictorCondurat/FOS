export function toggleMobileMenu() {
    const mobileMenuContent = document.querySelector('.header__navbar-dropdown-mobile');
    if (mobileMenuContent) {
        if (mobileMenuContent.style.display === 'block') {
            mobileMenuContent.style.display = 'none';
        }
        else {
            mobileMenuContent.style.display = 'block';
        }
        mobileMenuContent.addEventListener('mouseleave', () => {
            mobileMenuContent.style.display = 'none';
        });
    }
}
