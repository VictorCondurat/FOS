let favorites: any[] = [];

async function loadFavorites() {
    favorites = await fetch('/get-favorites').then(res => res.json());

    console.log(favorites);

    renderFavorites(favorites);
}
function renderFavorites(favoritesToRender: any[]) {
    const favoritesContainer = document.getElementById('favoritesContainer')!;

    favoritesContainer.innerHTML = '';

    for (let favorite of favoritesToRender) {
        let favDiv = document.createElement('div');
        console.log(favorite.product_name);
        favDiv.className = 'favorite-product';
        favDiv.innerHTML = `
        <h2>${favorite.product_name}</h2>
        <img src="${favorite.image_url}" alt="${favorite.product_name}" />
        <button class="remove-favorite">Remove</button>
    `;

        favDiv.addEventListener('click', () => {
            window.location.href = `/product.html?productId=${favorite.id}`;
        });

        const removeButton = favDiv.querySelector('.remove-favorite');
        removeButton?.addEventListener('click', async (event) => {
            event.stopPropagation();
            try {
                const response = await fetch(`/favorites/remove/${favorite.id}`, {
                    method: 'DELETE',
                });
                if (response.ok) {
                    favDiv.remove();
                } else {
                    console.error('Failed to remove favorite');
                }
            } catch (error) {
                console.error('Failed to remove favorite', error);
            }
        });

        favoritesContainer.appendChild(favDiv);
    }
}

function filterFavorites(searchQuery: any) {
    console.log('filterFavorites function triggered');
    let filteredFavorites = favorites.filter((favorite) => {
        return favorite.product_name && favorite.product_name.toLowerCase().includes(searchQuery.toLowerCase());
    });
    renderFavorites(filteredFavorites);
}

async function loadFilters_favorites() {
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

window.onload = async () => {
    const searchInput = document.getElementById('searchInput') as HTMLInputElement;
    if (!searchInput) {
        console.error('searchInput element not found');
    } else {
        searchInput.addEventListener('input', function (event) {
            let searchQuery = (event.target as HTMLInputElement).value;
            filterFavorites(searchQuery);
        });
    }

    await loadFilters_favorites();
    await loadFavorites();
};