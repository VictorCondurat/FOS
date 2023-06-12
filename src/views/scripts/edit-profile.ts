document.addEventListener('DOMContentLoaded', () => {
    const profileForm = document.getElementById('profile-form');
    if (profileForm) {
        profileForm.addEventListener('submit', handleFormSubmit);
    }

    function handleFormSubmit(event: Event) {
        event.preventDefault();

        // Get the input values from the form
        const preferredFoodsInput = document.getElementById('preferred-foods') as HTMLInputElement;
        const allergenInput = document.getElementById('allergen') as HTMLInputElement;
        const dietInput = document.getElementById('diet') as HTMLInputElement;


        if (preferredFoodsInput && allergenInput && dietInput) {
            const preferredFoods = preferredFoodsInput.value;
            const allergen = allergenInput.value;
            const diet = dietInput.value;

            // Create an empty object to store the user data
            const user = {
                preferred_foods: preferredFoods,
                allergen: allergen,
                diet: diet
            };

            // Perform validation or any additional logic as needed

            // Check if the user object has any data fields
            if (Object.keys(user).length === 0) {
                alert('No data input. Please enter some information.');
                return;
            }

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
                    } else {
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
