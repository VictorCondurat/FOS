const profileForm = document.getElementById('profile-form');
const unameInput = document.getElementById('uname');
const emailInput = document.getElementById('email');

if (profileForm && unameInput && emailInput) {
    profileForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const username = (unameInput as HTMLInputElement).value;
        const email = (emailInput as HTMLInputElement).value;

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
