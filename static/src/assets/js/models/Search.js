import Axios from 'axios';

export default class Search {
    constructor(records) {
        this.state = {
            records: records,
        };
    }
    async search(currentRegion, searchedTxt, selectedCategory, selectedSource, sorters, offset = 0) {
        const limit = 10;
        
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

        const activeSorter = sorters.filter(sorter => sorter.sortOrder !== 'none')[0];
        query.push('orderby=' + activeSorter.sortBy);
        query.push('dir=' + activeSorter.sortOrder);

        query.push('limit=' + limit);
        query.push('offset=' + offset*limit);

        let resp;

        try {
            resp = await Axios(`/api/search/?${query.join('&')}`);
        } catch {
            alert('Nebylo možné vyhledat');
            return this.state.records;
        }

        const searchedRecordsObj = resp.data;

        return searchedRecordsObj;
    }
}