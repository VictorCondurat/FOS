
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('productId');

const addToFavoritesButton = document.getElementById('addToFavorites');
if (addToFavoritesButton) {
    addToFavoritesButton.addEventListener('click', async (event) => {
        event.preventDefault();

        await fetch('/favorite', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                productId: productId,
            }),
        });
    });
}

const addToListButton = document.getElementById('addToList');
const productDiv = document.getElementById('addToList');
if (addToListButton) {
    addToListButton.addEventListener('click', (event) => {
        console.log('addToListButton clicked');
        event.stopPropagation();
        if (productId && productDiv)
            openDropdownProduct(productId, productDiv);
    });
}
let isDropdownOpen = false;

async function openDropdownProduct(productId: string, parentElement: HTMLElement) {
    console.log('openDropdown called');

    if (isDropdownOpen) {
        const dropdownToRemove = document.querySelector('.dropdown');
        if (dropdownToRemove) dropdownToRemove.remove();
        isDropdownOpen = false;
        return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.addEventListener('mouseleave', (event) => {
        dropdown.remove();
        isDropdownOpen = false;
    });
    console.log('Dropdown div created');

    const response = await fetch('/lists', { method: 'GET', credentials: 'same-origin' });
    const responseText = await response.text();
    console.log(responseText);
    const lists = JSON.parse(responseText);

    if (lists && lists.length > 0) {
        lists.forEach((list: { list_id: string, name: string }) => {
            console.log('Creating button for list:', list);
            const listItem = document.createElement('button');
            listItem.textContent = list.name;
            listItem.addEventListener('click', async (event) => {
                console.log('List button clicked');
                event.stopPropagation();
                await fetch('/lists/addItem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listId: list.list_id, productId: productId }),
                    credentials: 'same-origin'
                });
                console.log('Product added to list');
                dropdown.remove();
                isDropdownOpen = false;
            });
            dropdown.appendChild(listItem);
        });
    } else {
        console.log('No lists returned');
    }

    const addButton = document.createElement('button');
    addButton.textContent = '+';
    addButton.addEventListener('click', (event) => {
        console.log('Add button clicked');
        event.stopPropagation();
        const textBox = document.createElement('input');
        textBox.type = 'text';
        textBox.addEventListener('click', (event) => {
            event.stopPropagation();
        });
        textBox.addEventListener('keydown', (event) => {
            event.stopPropagation();
        });
        const createButton = document.createElement('button');
        createButton.textContent = 'Create';
        createButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            const listName = textBox.value;
            console.log("Numele listei :", listName);
            const createListResponse = await fetch('/lists', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: listName }),
                credentials: 'same-origin'
            });
            const createdList = await createListResponse.json();
            console.log('List created');

            if (createdList.list_id) {
                await fetch('/lists/addItem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listId: createdList.list_id, productId: productId }),
                    credentials: 'same-origin'
                });
                console.log('Product added to list');
                dropdown.remove();
                isDropdownOpen = false;
            }
        });
        dropdown.appendChild(textBox);
        dropdown.appendChild(createButton);
        dropdown.removeChild(addButton);
    });

    console.log('Adding addButton to dropdown');
    dropdown.appendChild(addButton);

    console.log('Adding dropdown to parentElement');
    parentElement.appendChild(dropdown);

    isDropdownOpen = true;
}