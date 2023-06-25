interface Product {
    id: string;
    product_name: string;
    image_url: string;
}

interface ProductsResponse {
    page_count: number;
    products: Product[];
}

let totalPages: number;
let currentPage: number = 1;

async function loadProducts(page: number = 1): Promise<void> {
    const response: ProductsResponse = await fetch(`/products?page=${page}`).then(res => res.json());
    totalPages = response.page_count;;
    document.querySelector('#currentPage')!.textContent = currentPage.toString();
    document.querySelector('#totalPages')!.textContent = isNaN(totalPages) ? '1' : totalPages.toString();

    const productContainer = document.querySelector('#productContainer') as HTMLElement;
    productContainer.innerHTML = '';


    response.products.forEach((product: Product) => {
        const productDiv: HTMLElement = document.createElement('div');
        productDiv.className = 'product';

        productDiv.addEventListener('click', () => {
            window.location.href = `/product.html?productId=${product.id}`;
        });

        const image: HTMLImageElement = document.createElement('img');
        image.src = product.image_url;
        image.className = 'product-img';

        const productName: HTMLAnchorElement = document.createElement('a');
        productName.href = '#';
        productName.textContent = product.product_name;
        productName.className = 'product-name';

        const addToFavoritesButton: HTMLButtonElement = document.createElement('button');
        addToFavoritesButton.textContent = 'Add to Favorites';
        addToFavoritesButton.className = 'add-to-favorites';
        addToFavoritesButton.addEventListener('click', async (event) => {
            event.stopPropagation(); // prevent the productDiv click event
            await fetch('/favorite', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    productId: product.id,
                }),
            });
        });

        const addToListButton: HTMLButtonElement = document.createElement('button');
        addToListButton.textContent = 'Add to List';
        addToListButton.className = 'add-to-list';
        addToListButton.addEventListener('click', (event) => {
            console.log('addToListButton clicked');
            event.stopPropagation();
            openDropdown(product.id, productDiv);
        });


        productDiv.appendChild(image);
        productDiv.appendChild(productName);
        productDiv.appendChild(addToFavoritesButton);
        productDiv.appendChild(addToListButton);
        productContainer.appendChild(productDiv);
    });

    generatePaginationButtons(totalPages, currentPage);
}
async function loadLists(): Promise<string[]> {
    const response = await fetch('/lists');
    const lists = await response.json();
    return lists;
}

let isDropdownOpenStore = false;

async function openDropdown(productId: string, parentElement: HTMLElement) {
    console.log('openDropdown called');

    if (isDropdownOpenStore) {
        const dropdownToRemove = document.querySelector('.dropdown');
        if (dropdownToRemove) dropdownToRemove.remove();
        isDropdownOpenStore = false;
        return;
    }

    const dropdown = document.createElement('div');
    dropdown.className = 'dropdown';
    dropdown.addEventListener('mouseleave', (event) => {
        dropdown.remove();
        isDropdownOpenStore = false;
    });
    console.log('Dropdown div created');

    // Fetch the lists
    const response = await fetch('/lists', { method: 'GET', credentials: 'same-origin' });
    const responseText = await response.text();
    console.log(responseText);
    const lists = JSON.parse(responseText);

    // If lists are returned, populate the dropdown with the list names
    if (lists && lists.length > 0) {
        lists.forEach((list: { list_id: string, name: string }) => {
            console.log('Creating button for list:', list);
            const listItem = document.createElement('button');
            listItem.textContent = list.name;
            listItem.addEventListener('click', async (event) => {
                console.log('List button clicked');
                event.stopPropagation();
                // When a list name is clicked, add the product to that list
                await fetch('/lists/addItem', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ listId: list.list_id, productId: productId }),
                    credentials: 'same-origin'
                });
                console.log('Product added to list');
                dropdown.remove();  // Add this line to remove dropdown after a list is clicked
                isDropdownOpenStore = false;
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
            event.stopPropagation(); // prevent event propagation for textBox keydown
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
                isDropdownOpenStore = false;
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

    isDropdownOpenStore = true;
}

function generatePaginationButtons(pageCount: number, currentPage: number) {
    const paginationContainer = document.querySelector('.pagination-container') as HTMLElement;
    paginationContainer.innerHTML = '';

    const startPage = currentPage - 2 > 0 ? currentPage - 2 : 1;
    const endPage = startPage + 4 <= pageCount ? startPage + 4 : pageCount;

    if (startPage !== 1) {
        const firstPageButton = createPaginationButton(1);
        paginationContainer.appendChild(firstPageButton);
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        paginationContainer.appendChild(ellipsis);
    }

    for (let i = startPage; i <= endPage; i++) {
        const button = createPaginationButton(i);
        paginationContainer.appendChild(button);
    }

    if (endPage !== pageCount) {
        const ellipsis = document.createElement('span');
        ellipsis.textContent = '...';
        paginationContainer.appendChild(ellipsis);
        const lastPageButton = createPaginationButton(pageCount);
        paginationContainer.appendChild(lastPageButton);
    }
}

function createPaginationButton(pageNumber: number): HTMLButtonElement {
    const button = document.createElement('button');
    button.className = `page-item ${pageNumber === currentPage ? 'active' : ''}`;
    button.textContent = pageNumber.toString();

    button.addEventListener('click', () => {
        currentPage = pageNumber
        loadProducts(currentPage);
    });

    return button;
}

window.addEventListener('DOMContentLoaded', async () => {

    await loadFilters();
    await loadProducts(currentPage);

    const nextPageButton = document.querySelector('#nextPage') as HTMLButtonElement;
    const prevPageButton = document.querySelector('#prevPage') as HTMLButtonElement;

    nextPageButton.addEventListener('click', () => {
        if (currentPage < totalPages) {
            currentPage++;
            loadProducts(currentPage);
        }
    });

    prevPageButton.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            loadProducts(currentPage);
        }
    });

    const sidebarButton = document.querySelector('#sidebarButton') as HTMLButtonElement;
    const filterSidebar = document.querySelector('#filterSidebar') as HTMLElement;

    sidebarButton.addEventListener('click', () => {
        filterSidebar.style.width = filterSidebar.style.width === '0px' || !filterSidebar.style.width ? '250px' : '0px';
    });

    const closeButton = document.querySelector('#closeButton') as HTMLButtonElement;
    closeButton.addEventListener('click', () => {
        filterSidebar.style.width = '0px';
    });
});

// loadFilters and loadProducts are moved here.
window.addEventListener('load', async () => {
    await loadFilters();
    await loadProducts(currentPage);
});


async function loadFilters() {
    const filters = await fetch('/filters').then(res => res.json()) as Record<string, string[]>;

    const filtersDiv = document.querySelector('#filterSidebar');
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

document.querySelector('#goToPage')!.addEventListener('click', () => {
    const pageInput: HTMLInputElement = document.querySelector('#pageInput')!;
    const goToPage = Number(pageInput.value);
    if (goToPage >= 1 && goToPage <= totalPages) {
        currentPage = goToPage;
        loadProducts();
    }
    pageInput.value = '';
});
