export default class Search {
    constructor(records) {
        this.state = {
            records: records,
        };
    }
    search(searchedTxt, selectedCategory, selectedField) {
        let filteredRecords = Array.from(this.state.records);

        if (searchedTxt) {
            this.fullTextSearch(filteredRecords, searchedTxt);
        }
        if (selectedCategory) {
            filteredRecords = filteredRecords.filter(record => record.category === selectedCategory);
        }
        if (selectedField) {
            filteredRecords = filteredRecords.filter(record => record.field === selectedField);
        }

        return filteredRecords;
    }
    fullTextSearch(records, searchTxt) {
        // TODO
    }
}