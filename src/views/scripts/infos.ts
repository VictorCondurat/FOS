const dropdownIds = ['allergens', 'brands', 'categories', 'countries', 'grades', 'labels'];

let selections: { [key: string]: string[] } = {};
for (const id of dropdownIds) {
    selections[id] = [];
}

window.onload = () => {
    fetch('/filter')
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            for (const id of dropdownIds) {
                const dropdown = document.getElementById(id);

                if (!dropdown) {
                    console.error(`Dropdown with ID '${id}' not found`);
                    continue;
                }

                const items = data[id];

                for (const item of items) {
                    const option = document.createElement('option');

                    option.value = item;
                    option.textContent = item;

                    dropdown.appendChild(option);
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });


    for (const id of dropdownIds) {
        const plusButton = document.getElementById(`${id}-plus`);
        const minusButton = document.getElementById(`${id}-minus`);
        const selectElement = document.getElementById(id) as HTMLSelectElement | null;

        if (plusButton && minusButton && selectElement) {
            plusButton.addEventListener('click', function (event) {
                event.preventDefault();
                const selectedOption = selectElement.options[selectElement.selectedIndex].value;

                if (!selections[id].includes(selectedOption)) {
                    selections[id].push(selectedOption);
                }
            });

            minusButton.addEventListener('click', function (event) {
                event.preventDefault();
                const selectedOption = selectElement.options[selectElement.selectedIndex].value;

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
                console.log(data);
            })
            .catch(error => {
                console.error('Error:', error);
            });
    });
}