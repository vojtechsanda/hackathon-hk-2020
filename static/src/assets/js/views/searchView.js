import { elements } from './base';

export const renderCategoriesSelectOptions = categories => {
    let categoriesMarkup = '';

    categories.forEach(category => {
        const optionMarkup = `
            <option value="${category}">${category}</option>
        `;
        
        categoriesMarkup += optionMarkup;
    });

    elements.searchCategorySelect.insertAdjacentHTML('beforeend', categoriesMarkup);
}
export const renderFieldsSelectOptions = fields => {
    let fieldsMarkup = '';

    fields.forEach((field) => {
        const optionMarkup = `
        <option value="${field}">${field}</option>
    `;

        fieldsMarkup += optionMarkup;
    });

    elements.searchFieldSelect.insertAdjacentHTML(
        'beforeend',
        fieldsMarkup
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
export const getField = () => {
    const selectedField = elements.searchFieldSelect.value;
    return selectedField.length === 0 ? false : selectedField;
};