import { elements } from './base';

export const render = records => {
    const resultsWrapper = elements.resultsWrapper;

    // Remove current results
    Array.from(resultsWrapper.children).forEach(result => result.parentElement.removeChild(result));

    records.forEach(record => {
        const markup = `
            <div>
                <h2>${record.title}</h2>
                <div>${record.field}</div>
                <div>${formatDate(record.start_timestamp)}</div>
                <div>${record.category}</div>
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

    const formattedTxt = `${d.getMonth()+1}.${d.getDate()}.${d.getFullYear()}`;
    return formattedTxt;
}