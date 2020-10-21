export default class Search {
    constructor(records) {
        this.state = {
            records: records,
        };
    }
    search(searchedTxt, selectedCategory, selectedSource) {
        let filteredRecords = Array.from(this.state.records);

        if (selectedCategory) {
            filteredRecords = filteredRecords.filter(record => record.category_id == selectedCategory);
        }
        if (selectedSource) {
            filteredRecords = filteredRecords.filter(record => record.source_id == selectedSource);
        }
        if (searchedTxt) {
            filteredRecords = this.fullTextSearch(filteredRecords, searchedTxt);
        }

        return filteredRecords;
    }
    fullTextSearch(records, searchedTxt) {
        // TODO: č = c, c != č
        const searchedTerms = searchedTxt.split(' ');
        
        const searchedRecords = records.filter(record => {
            for (const term of searchedTerms) {
                if (
                    record.title.toLowerCase().includes(term) ||
                    record.source.toLowerCase().includes(term) ||
                    record.category.toLowerCase().includes(term) ||
                    record.published_datetime_txt.toLowerCase().includes(term)
                ) {
                    return true;
                }
            }
        });

        return searchedRecords;
    }
}