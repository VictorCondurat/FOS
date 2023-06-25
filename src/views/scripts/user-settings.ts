const modifyButton = document.getElementById('modify-btn');
if (modifyButton) {
    modifyButton.addEventListener('click', handleModifyButtonClick);
}

function handleModifyButtonClick() {

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

/* function populateUserInfo(userData: {
    username: string;
    email: string;

}) {
    console.log('userData:', userData);

    const unameElement = document.getElementById('uname');
    if (unameElement) {
        unameElement.textContent = userData.username;
    }

    const emailElement = document.getElementById('email');
    if (emailElement) {
        emailElement.textContent = userData.email;
    }


} */

function populateUserInfo(userData: {
    username: string;
    email: string;
    allergens: string | string[];
    brands: string;
    categories: string;
    countries: string | string[];
    grades: string;
    labels: string;
}) {
    console.log('userData:', userData);

    const unameElement = document.getElementById('uname');
    if (unameElement) {
        unameElement.textContent = userData.username;
    }

    const emailElement = document.getElementById('email');
    if (emailElement) {
        emailElement.textContent = userData.email;
    }

    const allergenElement = document.getElementById('allergen');
    if (allergenElement) {
        if (typeof userData.allergens === 'string') {
            allergenElement.textContent = parseArrayString(userData.allergens).join(', ');
        } else if (Array.isArray(userData.allergens) && userData.allergens.length === 0) {
            allergenElement.textContent = "None";
        }
    }


    const brandElement = document.getElementById('brand');
    if (brandElement) {
        brandElement.textContent = parseArrayString(userData.brands).join(', ');
    }

    const categoryElement = document.getElementById('category');
    if (categoryElement) {
        categoryElement.textContent = parseArrayString(userData.categories).join(', ');
    }

    const countryElement = document.getElementById('country');
    if (countryElement) {
        if (typeof userData.countries === 'string') {
            countryElement.textContent = parseArrayString(userData.countries).join(', ');
        } else if (Array.isArray(userData.countries) && userData.countries.length === 0) {
            countryElement.textContent = "None";
        }
    }

    const gradeElement = document.getElementById('grade');
    if (gradeElement) {
        gradeElement.textContent = parseArrayString(userData.grades).join(', ');
    }

    const labelElement = document.getElementById('label');
    if (labelElement) {
        labelElement.textContent = parseArrayString(userData.labels).join(', ');
    }
}


function parseArrayString(arrayString: string): string[] {
    return arrayString.slice(0, 1000).split(',').map((item: string) => item.trim());
}

