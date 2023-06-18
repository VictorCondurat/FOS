import { toggleMobileMenu } from './toggleMobileMenu.js';
const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
if (mobileMenuToggle) {
    mobileMenuToggle.addEventListener('click', toggleMobileMenu);
}
// Function to get a cookie
function getCookie(name) {
    const value = "; " + document.cookie;
    const parts = value.split("; " + name + "=");
    if (parts.length == 2)
        return parts.pop()?.split(";").shift() || null;
    return null;
}
// Event listener for dashboard link
document.getElementById('dashboard-link')?.addEventListener('click', function (e) {
    const username = getCookie("username");
    if (!username) {
        e.preventDefault();
        window.location.href = './login.html';
    }
});
