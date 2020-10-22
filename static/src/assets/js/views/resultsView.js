import {elements} from './base';

export const render = records => {
    const resultsWrapper = elements.resultsWrapper;

    // Remove current results
    Array.from(resultsWrapper.children).forEach(result => result.parentElement.removeChild(result));

    records.forEach(record => {
        const markup = `
            <div class="result">
                <a href="/detail/?id=${record.id}" class="result__title mb-2">${record.title}</a>
                <div class="flex mb-2_5">
                    <div class="cont">
                        <img src="assets/imgs/result-user.svg" class="result__icon" alt="Ikona oblasti u výsledku">
                        <p class="text text--medium ml-1">${record.source}</p>
                    </div>
                    <div class="cont ml-3">
                        <img src="assets/imgs/result-calendar.svg" class="result__icon" alt="Ikona kalendáře u výsledku">
                        <p class="text text--medium ml-1">${formatDate(record.published_datetime)}</p>
                    </div>
                </div>
                <div class="result-category">${record.category}</div>
                <a href="/detail/?id=${record.id}" class="result__show">Zobrazit výsledek
                    <img src="assets/imgs/res-rec.svg" alt="">
                </a>
            </div>
        `;

        resultsWrapper.insertAdjacentHTML('beforeend', markup);
    });
}

export const getSorters = () => {
    const sortersElems = elements.resultSorters;
    let sorters = [];

    sortersElems.forEach((sorterEl) => {
        sorters.push({
            sortBy: sorterEl.dataset.sortBy,
            sortOrder: sorterEl.dataset.currentSort,
        });
    });

    return sorters;
}

export const handleSorters = changedSorter => {
    const otherSortersElems = elements.resultSorters.filter(sorter => sorter !== changedSorter);
    otherSortersElems.forEach(elem => {
        elem.dataset.currentSort = 'none';
    })

    if (changedSorter.dataset.currentSort === 'asc') {
        changedSorter.dataset.currentSort = 'desc';
    } else {
        changedSorter.dataset.currentSort = 'asc';
    }
}

export const getFifthResult = () => {
    return Array.from(elements.resultsWrapper.children).slice(-5, -4)[0];
}

export const updateResultsCount = count => {
    elements.resultsCount.textContent = count;
}

function formatDate(timestamp) {
    const d = new Date(timestamp);

    const formattedTxt = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    return formattedTxt;
}
