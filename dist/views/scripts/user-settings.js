"use strict";
const modifyButton = document.getElementById('modify-btn');
if (modifyButton) {
    modifyButton.addEventListener('click', handleModifyButtonClick);
}
const exportUserInfo = () => {
    fetch('/export-user-info', {
        method: 'GET',
        credentials: 'same-origin'
    })
        .then(response => {
        if (response.ok) {
            const contentDisposition = response.headers.get('Content-Disposition');
            const filenameMatch = contentDisposition?.match(/filename="(.+)"/);
            const filename = filenameMatch ? filenameMatch[1] : 'user_information.json';
            const downloadLink = document.createElement('a');
            response.blob().then(blob => {
                downloadLink.href = URL.createObjectURL(blob);
                downloadLink.download = filename;
                downloadLink.click();
            });
        }
        else {
            console.error('Error:', response.statusText);
        }
    })
        .catch(error => {
        console.error('Error:', error);
    });
};
const exportButton = document.getElementById('export-json-btn');
if (exportButton) {
    exportButton.addEventListener('click', exportUserInfo);
}
function handleModifyButtonClick() {
    window.location.href = 'edit-profile.html';
}
window.onload = async function () {
    try {
        const response = await fetch('/user-info', {
            method: 'GET',
            credentials: 'same-origin',
        });
        if (response.ok) {
            const userData = await response.json();
            populateUserInfo(userData);
        }
        else {
            throw new Error('Request failed');
        }
    }
    catch (error) {
        console.error('Error:', error);
    }
};
function populateUserInfo(userData) {
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
        }
        else if (Array.isArray(userData.allergens) && userData.allergens.length === 0) {
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
        }
        else if (Array.isArray(userData.countries) && userData.countries.length === 0) {
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
function parseArrayString(arrayString) {
    return arrayString.slice(0, 1000).split(',').map((item) => item.trim());
}
