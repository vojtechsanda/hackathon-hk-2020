import { elements } from './base';

export const renderCategoriesSelectOptions = categories => {
    let categoriesMarkup = '';

    categories.forEach(category => {
        const optionMarkup = `
            <option value="${category.id}">${category.name}</option>
        `;
        
        categoriesMarkup += optionMarkup;
    });

    elements.searchCategorySelect.insertAdjacentHTML('beforeend', categoriesMarkup);
}
export const renderSourcesSelectOptions = sources => {
    let sourcesMarkup = '';

    sources.forEach((source) => {
        const optionMarkup = `
        <option value="${source.id}">${source.name}</option>
    `;

        sourcesMarkup += optionMarkup;
    });

    elements.searchSourceSelect.insertAdjacentHTML(
        'beforeend',
        sourcesMarkup
    );
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