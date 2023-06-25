const profileForm = document.getElementById('profile-form');
const unameInput = document.getElementById('uname');
const emailInput = document.getElementById('email');


let initialUserData = {
  username: '',
  email: ''
};

fetch('/user-info', {
  method: 'GET',
  credentials: 'same-origin', // Include cookies in the request
})
  .then(response => response.json())
  .then(userData => {
    if (unameInput) {
      (unameInput as HTMLInputElement).value = userData.username;
    }
    if (emailInput) {
      (emailInput as HTMLInputElement).value = userData.email;
    }

    // Save the initial user data
    initialUserData = {
      username: userData.username,
      email: userData.email,
    };
  })
  .catch(error => {
    console.error('Error retrieving user data:', error);
  });


if (profileForm && unameInput && emailInput) {
  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();

    const username = (unameInput as HTMLInputElement).value;
    const email = (emailInput as HTMLInputElement).value;

    const updatedUserData: { newUsername?: string; email?: string } = {};

    // Only include fields that have changed
    if (username !== initialUserData.username) {
      updatedUserData.newUsername = username;
    }
    if (email !== initialUserData.email) {
      updatedUserData.email = email;
    }

    fetch('/update-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(updatedUserData),
    })
      .then(response => response.json())
      .then(data => {
        if (data.message === 'User updated successfully') {
          console.log("User profile updated");
        } else {
          alert(data.error || 'Username or Email already Used');
        }
      })
      .catch(error => {
        console.error('Error updating user:', error);
      });
  });
}
