export function toggleMobileMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) {
        if (mobileMenu.style.display === "inline-block") {
            mobileMenu.style.display = "none";
        } else {
            mobileMenu.style.display = "inline-block";
        }
    }
}
