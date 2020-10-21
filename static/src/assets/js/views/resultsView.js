import { elements } from './base';

export const render = records => {
    const resultsWrapper = elements.resultsWrapper;

    // Remove current results
    Array.from(resultsWrapper.children).forEach(result => result.parentElement.removeChild(result));

    records.forEach(record => {
        const markup = `
            <div class="result">
                <h3 class="result__title mb-2">${record.title}</h3>
                <div class="flex mb-2_5">
                    <div class="cont">
                        <img src="assets/imgs/result-oblast.svg" class="result__icon" alt="Ikona oblasti u výsledku">
                        <p class="text text--medium ml-1">${record.source}</p>
                    </div>
                    <div class="cont ml-3">
                        <img src="assets/imgs/result-calendar.svg" class="result__icon" alt="Ikona kalendáře u výsledku">
                        <p class="text text--medium ml-1">${formatDate(record.published_datetime)}</p>
                    </div>
                </div>
                <div class="result-categories">
                    <div class="category">${record.category}</div>
                </div>
                <button class="result__show">Zobrazit výsledek</button>
            </div>
        `;

        resultsWrapper.insertAdjacentHTML('beforeend', markup);
    });
}

export const updateResultsCount = count => {
    elements.resultsCount.textContent = count;
}

function formatDate(timestamp) {
    const d = new Date(timestamp);

    const formattedTxt = `${d.getDate()}.${d.getMonth() + 1}.${d.getFullYear()}`;
    return formattedTxt;
}