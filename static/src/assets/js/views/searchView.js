import { elements } from './base';

// TODO: Should by DRY
export const renderCategoriesSelectOptions = (categories, selectId) => {
    let categoriesMarkup = '';

    Array.from(elements.searchCategorySelect.children).forEach(child => {
        if (child.value !== '') {
            child.parentElement.removeChild(child)
        }
    });

    categories.forEach(category => {
        const optionMarkup = `
            <option value="${category.id}"${category.id == selectId ? ' selected' : ''}>${category.name}</option>
        `;
        
        categoriesMarkup += optionMarkup;
    });

    elements.searchCategorySelect.insertAdjacentHTML('beforeend', categoriesMarkup);
}
export const renderSourcesSelectOptions = (sources, selectId) => {
    let sourcesMarkup = '';

    Array.from(elements.searchSourceSelect.children).forEach(child => {
        if (child.value !== '') {
            child.parentElement.removeChild(child);
        }
    });

    sources.forEach((source) => {
        const optionMarkup = `
        <option value="${source.id}"${source.id == selectId ? ' selected' : ''}>${source.name}</option>
    `;

        sourcesMarkup += optionMarkup;
    });

    elements.searchSourceSelect.insertAdjacentHTML('beforeend', sourcesMarkup);
};

export const updateInput = (txt) => {
    elements.searchInput.value = txt;
};

export const resetFilters = () => {
    elements.searchInput.value = '';
    elements.searchCategorySelect.value = '';
    elements.searchSourceSelect.value = '';
}
export const updateFilter = (filterType, filterOptionId) => {
    const filterTypeFirstUpper = filterType.split("")[0].toUpperCase() + filterType.slice(1);
    elements[`search${filterTypeFirstUpper}Select`].value = filterOptionId;
}
export const renderCategoriesSide = categories => {
    let categoriesMarkup = '';

    Array.from(elements.searchCategorySide.children).forEach(child => child.parentElement.removeChild(child));

    categories.forEach((category) => {
        const optionMarkup = `
            <li class="filter-item-list__item" title="${category.name}" data-option-id="${category.id}">${cutTxt(category.name, 20)} <span>${category.count}</span></li>
        `;

        categoriesMarkup += optionMarkup;
    });

    elements.searchCategorySide.insertAdjacentHTML('beforeend', categoriesMarkup);
};
export const renderSourcesSide = sources => {
    let sourcesMarkup = '';

    Array.from(elements.searchSourcesSide.children).forEach(child => child.parentElement.removeChild(child));

    sources.forEach((source) => {
        const optionMarkup = `
            <li class="filter-item-list__item" title="${source.name}" data-option-id="${source.id}">${cutTxt(source.name, 20)} <span>${source.count}</span></li>
        `;

        sourcesMarkup += optionMarkup;
    });

    elements.searchSourcesSide.insertAdjacentHTML('beforeend', sourcesMarkup);
};
function cutTxt(txt, charCount) {
    if (txt.length <= charCount) {
        return txt;
    }

    const cutTxt = `${txt.slice(0, charCount)}...`;
    return cutTxt;
}
export const getSearchedTxt = () => {
    const searchedTxt = elements.searchInput.value;
    return searchedTxt.length === 0 ? false : searchedTxt;
}
export const getCategory = () => {
    const selectedCategory = elements.searchCategorySelect.value;
    return selectedCategory.length === 0 ? false : selectedCategory;
};
export const getSource = () => {
    const selectedSource = elements.searchSourceSelect.value;
    return selectedSource.length === 0 ? false : selectedSource;
};