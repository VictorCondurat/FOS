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

window.onload = async function () {
    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            credentials: 'same-origin', // Include cookies in the request
        });
        if (response.ok) {
            const userData = await response.json();
            populateUserInfo(userData);
        } else {
            throw new Error('Request failed');
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

function populateUserInfo(userData: {
    username: string;
    email: string;
    preferredFoods: string[];
    allergen: string[];
    diet: string;
}) {
    const unameElement = document.getElementById('uname');
    if (unameElement) {
        unameElement.textContent = userData.username;
    }
    const emailElement = document.getElementById('email');
    if (emailElement) {
        emailElement.textContent = userData.email;
    }

}
