"use strict";
document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleFormSubmit);
    }
    function handleFormSubmit(event) {
        event.preventDefault();
        // Get the input values from the form
        const usernameInput = document.getElementById('uname');
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        const preferredFoodsInput = document.getElementById('preferred-foods');
        const allergenInput = document.getElementById('allergen');
        const dietInput = document.getElementById('diet');
        if (usernameInput && emailInput && passwordInput && preferredFoodsInput && allergenInput && dietInput) {
            const username = usernameInput.value;
            const email = emailInput.value;
            const password = passwordInput.value;
            const preferredFoods = preferredFoodsInput.value.split('\n').filter(food => food.trim() !== '');
            const allergen = allergenInput.value;
            const diet = dietInput.value;
            // Perform validation or any additional logic as needed
            // Example: Update the user information via an AJAX request
            const user = {
                uname: username,
                email: email,
                password: password,
                preferredFoods: preferredFoods,
                allergen: allergen,
                diet: diet
            };
            // Send the updated user information to the server
            fetch('/update-profile', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            })
                .then(response => {
                if (response.ok) {
                    // Successful update
                    alert('Profile updated successfully!');
                    // Redirect the user back to the profile page
                    window.location.href = 'my-profile.html';
                }
                else {
                    // Update failed
                    alert('Failed to update profile. Please try again.');
                }
            })
                .catch(error => {
                console.error('Error updating profile:', error);
                alert('An error occurred while updating the profile. Please try again later.');
            });
        }
    }
});
