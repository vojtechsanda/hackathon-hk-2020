export const elements = {
    searchForm: document.querySelector('.js-search-form'),
    searchInput: document.querySelector('.js-search-input'),
    searchCategorySelect: document.querySelector('.js-category-select'),
    searchCategorySide: document.querySelector('.js-category-side'),
    searchSourceSelect: document.querySelector('.js-source-select'),
    searchSourcesSide: document.querySelector('.js-sources-side'),
    resultsWrapper: document.querySelector('.js-results-wrapper'),
    resultsCount: document.querySelector('.js-results-count'),
    resultSorters: Array.from(document.querySelectorAll('.js-results-sort-by')),
    detailTitle: document.querySelector('.js-detail-title'),
    detailCategory: document.querySelector('.js-detail-category'),
    detailDetailsTable: document.querySelector('.js-detail-details-table'),
    regionSelect: document.querySelector('.js-region-select'),
};

export const renderRegionsSelect = (regions, selectedRegion) => {
    let markup = '';

    Array.from(elements.regionSelect.children).forEach(child => child.parentElement.removeChild(child));

    regions.forEach(region => {
        const optionMarkup = `
            <option value="${region.id}">${region.name}</option>
        `;

        markup += optionMarkup;
    });

    elements.regionSelect.insertAdjacentHTML('beforeend', markup);
}