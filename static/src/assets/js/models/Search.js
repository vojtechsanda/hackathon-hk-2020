export default class Search {
    constructor(records) {
        this.state = {
            records: records,
        };
    }
    search(searchedTxt, selectedCategory, selectedSource) {
        let filteredRecords = Array.from(this.state.records);

        if (searchedTxt) {
            this.fullTextSearch(filteredRecords, searchedTxt);
        }
        if (selectedCategory) {
            filteredRecords = filteredRecords.filter(record => record.category === selectedCategory);
        }
        if (selectedSource) {
            filteredRecords = filteredRecords.filter(record => record.source === selectedSource);
        }

        return filteredRecords;
    }
    fullTextSearch(records, searchTxt) {
        // TODO
    }
}