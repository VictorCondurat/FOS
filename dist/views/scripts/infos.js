"use strict";
const dropdownIds = ['allergens', 'brands', 'categories', 'countries', 'grades', 'labels'];
// Object to hold selections for each dropdown
let selections = {};
for (const id of dropdownIds) {
    selections[id] = [];
}
window.onload = () => {
    // Fetch data 
    fetch('/filter')
        .then(response => {
        // Make sure the fetch was successful
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        // If it was successful, parse the response as JSON
        return response.json();
    })
        .then(data => {
        // Iterate over the IDs of the dropdowns
        for (const id of dropdownIds) {
            // Get the select dropdown you want to populate
            const dropdown = document.getElementById(id);
            // Make sure the dropdown exists in your HTML
            if (!dropdown) {
                console.error(`Dropdown with ID '${id}' not found`);
                continue;
            }
            // Get the data for this dropdown
            const items = data[id];
            // Iterate over each item in the data
            for (const item of items) {
                // Create a new option element
                const option = document.createElement('option');
                // Set the value and text of the option
                option.value = item;
                option.textContent = item;
                // Add the option to the dropdown
                dropdown.appendChild(option);
            }
        }
    })
        .catch(error => {
        console.error('Error:', error);
    });
    // Adding event listeners for each plus and minus button
    for (const id of dropdownIds) {
        const plusButton = document.getElementById(`${id}-plus`);
        const minusButton = document.getElementById(`${id}-minus`);
        const selectElement = document.getElementById(id);
        if (plusButton && minusButton && selectElement) {
            plusButton.addEventListener('click', function (event) {
                event.preventDefault();
                const selectedOption = selectElement.options[selectElement.selectedIndex].value;
                // Add the selected option to the corresponding array
                if (!selections[id].includes(selectedOption)) {
                    selections[id].push(selectedOption);
                }
            });
            minusButton.addEventListener('click', function (event) {
                event.preventDefault();
                const selectedOption = selectElement.options[selectElement.selectedIndex].value;
                // Remove the selected option from the corresponding array
                const index = selections[id].indexOf(selectedOption);
                if (index > -1) {
                    selections[id].splice(index, 1);
                }
            });
        }
    }
};
const saveButton = document.getElementById('save-btn');
if (saveButton) {
    saveButton.addEventListener('click', function (event) {
        event.preventDefault();
        // Send a POST request to the endpoint with the selected items
        fetch('/update-prefs', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(selections)
        })
            .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
            .then(data => {
            // Handle the response data if needed
            console.log(data);
        })
            .catch(error => {
            console.error('Error:', error);
        });
    });
}
