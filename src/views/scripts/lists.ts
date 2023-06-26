
let currentListId: number;
let listsInMemory: Record<number, Set<string>> = {};
let productsInMemory: any[] = [];

window.onload = async () => {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    const listsContainer = document.getElementById('listsContainer') as HTMLDivElement;
    if (!searchInput || !listsContainer) {
        console.error('Required elements not found');
        return;
    }

    searchInput.addEventListener('input', function (event) {
        let searchQuery = (event.target as HTMLInputElement).value;
        filterProducts(searchQuery);
    });

    const lists = await fetch('/lists').then(res => res.json());

    for (let list of lists) {
        listsInMemory[list.list_id] = new Set(list.items);
        const listDiv = document.createElement('div');
        listDiv.className = 'list';

        const listButton = document.createElement('button');
        listButton.textContent = list.name;
        listButton.addEventListener('click', async () => {
            currentListId = list.list_id;
            await loadProductsForList(currentListId);
        });
        listDiv.appendChild(listButton);

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.className = 'delete-list';
        deleteButton.addEventListener('click', async (event) => {
            event.stopPropagation();
            try {
                const response = await fetch(`/lists/${list.list_id}`, { method: 'DELETE' });
                if (!response.ok) {
                    const body = await response.text();
                    console.error(`Failed to delete list, status: ${response.status}, message: ${body}`);
                } else {
                    delete listsInMemory[list.list_id];
                    listDiv.remove();
                    productsInMemory = [];
                    renderProducts([]);
                }
            } catch (error) {
                console.error('Failed to delete list', error);
            }
        });
        listDiv.appendChild(deleteButton);

        listsContainer.appendChild(listDiv);
    }

    await loadFiltersLists();
};


async function loadFiltersLists() {
    const filters = await fetch('/filters').then(res => res.json()) as Record<string, string[]>;

    const filtersDiv = document.querySelector('#filtersContainer');

    const displayNames = {
        manufacturing_places: "Made in",
        allergens: "Allergens",
        brands: "Brands",
        categories: "Categories",
        grades: "Health Score",
        labels: "Labels",
        countries: "Country Specific"
    };

    for (const [category, options] of Object.entries(filters)) {
        const categoryDiv = document.createElement('div');
        categoryDiv.className = 'filter-category';

        const button = document.createElement('button');
        button.textContent = (displayNames as any)[category] || category;
        button.className = 'filter-category-button';
        button.onclick = function () {
            ul.style.display = ul.style.display === 'none' ? 'block' : 'none';
        };
        categoryDiv.appendChild(button);

        const ul = document.createElement('ul');
        ul.style.display = 'none';

        for (const option of options) {
            const li = document.createElement('li');

            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = input.name = `${category}-${option}`;

            const label = document.createElement('label');
            label.htmlFor = input.id;
            label.textContent = option;

            li.appendChild(input);
            li.appendChild(label);
            ul.appendChild(li);
        }

        categoryDiv.appendChild(ul);
        filtersDiv?.appendChild(categoryDiv);
    }
}

async function loadProductsForList(listId: number) {
    const productIds = Array.from(listsInMemory[listId]);
    if (!productIds || productIds.length === 0) {
        return;
    }
    // using post instead; storing them in the json to avoid the browser url character limit(2000)
    const response = await fetch('/products/multiple', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ ids: productIds })
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    const products = await response.json();
    productsInMemory = products;
    renderProducts(products);
}

function renderProducts(productsToRender: any[]) {
    const productsContainer = document.getElementById('productsContainer')!;
    productsContainer.innerHTML = '';

    for (let product of productsToRender) {
        let prodDiv = document.createElement('div');
        prodDiv.className = 'product';
        prodDiv.innerHTML = `
            <h2>${product.product_name}</h2>
            <img src="${product.image_url}" alt="${product.product_name}" />
            <button class="remove-product">Remove</button>
        `;

        prodDiv.addEventListener('click', () => {
            window.location.href = `/product.html?productId=${product.id}`;
        });

        const removeButton = prodDiv.querySelector('.remove-product');
        removeButton?.addEventListener('click', async (event) => {
            event.stopPropagation();
            console.log('Remove button clicked for product: ', product.code);
            if (currentListId !== null) {
                try {
                    const response = await fetch(`/lists/${currentListId}/products/${product.code}`, {
                        method: 'DELETE',
                    });
                    if (response.ok) {

                        listsInMemory[currentListId].delete(product.code);

                        prodDiv.remove();
                        productsInMemory = productsInMemory.filter(p => p.code !== product.code);
                    } else {
                        console.error('Failed to remove product');
                    }
                } catch (error) {
                    console.error('Failed to remove product', error);
                }
            }
        });


        productsContainer.appendChild(prodDiv);
    }
}

function filterProducts(query: string) {
    let filteredProducts = productsInMemory.filter((product) => {
        return product.product_name.toLowerCase().includes(query.toLowerCase());
    });
    renderProducts(filteredProducts);
}
