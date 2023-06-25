"use strict";
async function loadFavorites() {
    const favorites = await fetch('/favorites').then(res => res.json());
    const favoritesContainer = document.getElementById('favoritesContainer');
    for (let favorite of favorites) {
        let favDiv = document.createElement('div');
        favDiv.className = 'favorite-product';
        favDiv.innerHTML = `
            <h2>${favorite.name}</h2>
            <img src="${favorite.image_url}" alt="${favorite.name}" />
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
                }
                else {
                    console.error('Failed to remove favorite');
                }
            }
            catch (error) {
                console.error('Failed to remove favorite', error);
            }
        });
        favoritesContainer?.appendChild(favDiv);
    }
}
window.onload = async () => {
    await loadFilters();
    await loadFavorites();
};
