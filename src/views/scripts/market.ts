interface PublicList {
    id: number;
    name: string;
    type: string;
    tags: string[];
}

document.addEventListener('DOMContentLoaded', () => {
    const publicLists: PublicList[] = [
        { id: 1, name: 'Vegan Groceries', type: 'public', tags: ['Bread', 'Eggs', 'Milk'] },
        { id: 2, name: 'Party Supplies', type: 'public', tags: ['Decorations', 'Snacks'] },
        { id: 3, name: 'Gluten-free Shopping', type: 'public', tags: ['Gluten-free Bread', 'Pasta', 'Cereal'] },
    ];

    let currentIndex = 0;
    const itemsPerPage = 10;

    displayPublicLists(publicLists.slice(currentIndex, currentIndex + itemsPerPage));
    currentIndex += itemsPerPage;

    const searchList = document.getElementById('search-list') as HTMLInputElement;
    if (searchList) {
        searchList.addEventListener('input', (event: Event) => {
            const target = event.target as HTMLInputElement;
            const query = target && target.value ? target.value.toLowerCase() : '';
            const filteredLists = publicLists.filter(list => list.name.toLowerCase().includes(query));
            currentIndex = 0;
            displayPublicLists(filteredLists.slice(currentIndex, currentIndex + itemsPerPage));
            currentIndex += itemsPerPage;
        });
    }

    displayFilterTags(publicLists);

    window.addEventListener('scroll', () => {
        if (window.innerHeight + window.scrollY >= document.body.offsetHeight) {
            displayPublicLists(publicLists.slice(currentIndex, currentIndex + itemsPerPage));
            currentIndex += itemsPerPage;
        }
    });
});

function displayPublicLists(lists: PublicList[]) {
    const publicListsContainer = document.getElementById('public-lists');
    if (publicListsContainer) {
        lists.forEach(list => {
            const listItem = document.createElement('div');
            listItem.className = 'list-item';

            const listItemName = document.createElement('div');
            listItemName.className = 'list-item__name';
            listItemName.textContent = list.name;
            listItem.appendChild(listItemName);

            const listItemTags = document.createElement('div');
            listItemTags.className = 'list-item__tags';
            list.tags.forEach(tag => {
                const listItemTag = document.createElement('div');
                listItemTag.className = 'list-item__tag';
                listItemTag.textContent = tag;
                listItemTags.appendChild(listItemTag);
            });
            listItem.appendChild(listItemTags);

            publicListsContainer.appendChild(listItem);
        });
    }
}

function displayFilterTags(lists: PublicList[]) {
    const tags = new Set<string>();
    lists.forEach(list => list.tags.forEach(tag => tags.add(tag)));

    const filterTagsContainer = document.getElementById('filter-tags');
    if (filterTagsContainer) {
        Array.from(tags).forEach(tag => {
            const tagElement = document.createElement('input');
            tagElement.type = 'checkbox';
            tagElement.id = `tag-${tag}`;
            tagElement.name = 'filter-tag';
            tagElement.value = tag;

            const tagLabel = document.createElement('label');
            tagLabel.htmlFor = `tag-${tag}`;
            tagLabel.textContent = tag;

            filterTagsContainer.appendChild(tagElement);
            filterTagsContainer.appendChild(tagLabel);
        });
    }
}
document.addEventListener('DOMContentLoaded', () => {
    const backButton = document.querySelector('.header__back-button');
    if (backButton) {
        backButton.addEventListener('click', () => {
            window.location.href = 'index.html';
        });
    }
});


