"use strict";
const profileForm = document.getElementById('profile-form');
const unameInput = document.getElementById('uname');
const emailInput = document.getElementById('email');
fetch('/user-info', {
    method: 'GET',
    credentials: 'same-origin', // Include cookies in the request
})
    .then(response => response.json())
    .then(userData => {
    if (unameInput) {
        unameInput.value = userData.username;
    }
    if (emailInput) {
        emailInput.value = userData.email;
    }
})
    .catch(error => {
    console.error('Error retrieving user data:', error);
});
if (profileForm && unameInput && emailInput) {
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();
        const username = unameInput.value;
        const email = emailInput.value;
        const updatedUserData = {
            newUsername: username,
            email: email,
        };
        fetch('/update-profile', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedUserData),
        })
            .then(response => response.json())
            .then(data => {
            console.log('User updated successfully:', data);
        })
            .catch(error => {
            console.error('Error updating user:', error);
        });
    });
}
