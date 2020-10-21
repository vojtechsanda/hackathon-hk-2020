import Axios from 'axios';

export default class Search {
    constructor(records) {
        this.state = {
            records: records,
        };
    }
    async search(currentRegion, searchedTxt, selectedCategory, selectedSource) {
        let query = [];

        query.push('region=' + currentRegion);

        if (selectedCategory) {
            query.push('category=' + selectedCategory);
        }
        if (selectedSource) {
            query.push('source=' + selectedSource);
        }
        if (searchedTxt) {
            query.push('txt=' + searchedTxt);
        }

        let resp;

        try {
            resp = await Axios(`/api/search/?${query.join('&')}`);
        } catch {
            alert('Nebylo možné vyhledat');
            return this.state.records;
        }

        const searchedRecords = resp.data;

        return searchedRecords;
    }
}