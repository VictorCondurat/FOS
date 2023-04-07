import { toggleMobileMenu } from './toggleMobileMenu.js';

const mobileMenuToggle = document.getElementById('mobile-menu-toggle');

if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}
