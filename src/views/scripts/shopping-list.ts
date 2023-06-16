document.addEventListener('DOMContentLoaded', () => {
    const myShoppingLists = document.getElementById('my-shopping-lists');
    const shoppingListsSection = document.getElementById('shopping-lists');

    if (!shoppingListsSection) return;

    if (myShoppingLists) {
        myShoppingLists.addEventListener('click', () => {
            const shoppingLists = [
                { id: 1, name: 'Groceries', type: 'Private', tags: ['Fruits', 'Vegetables', 'Dairy'] },
                { id: 2, name: 'Party Supplies', type: 'Public', tags: ['Snacks', 'Drinks', 'Desserts'] },
                { id: 3, name: 'Weekly', type: 'Private', tags: ['Bread', 'Eggs', 'Milk'] },
            ];

            displayShoppingLists(shoppingLists, shoppingListsSection);
        });
    }

    const navLinks = document.querySelectorAll('.left-menu a:not(#my-shopping-lists)');
    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            shoppingListsSection.innerHTML = '';

        });
    });
});

function displayShoppingLists(
    shoppingLists: { id: number; name: string; type: string; tags: string[] }[],
    container: HTMLElement | null,
) {
    if (!container) return;

    container.innerHTML = '';
    container.classList.add('list-container');

    shoppingLists.forEach((list) => {
        const div = document.createElement('div');
        div.classList.add('list-block');

        const listName = document.createElement('h3');
        listName.classList.add('list-name');
        listName.textContent = list.name;

        const listType = document.createElement('span');
        listType.classList.add('list-type');
        listType.textContent = list.type;

        const ul = document.createElement('ul');
        ul.classList.add('tag-list');
        list.tags.forEach((tag) => {
            const li = document.createElement('li');
            li.classList.add('tag-item');
            li.textContent = tag;
            ul.appendChild(li);
        });

        div.appendChild(listName);
        div.appendChild(listType);
        div.appendChild(ul);
        container.appendChild(div);
    });
}

