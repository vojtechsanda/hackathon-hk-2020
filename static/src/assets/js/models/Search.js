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
            let termsFoundInTypes = [];
            
            for (const term of searchedTerms) {
                let foundInType = [];
                
                if (record.title.toLowerCase().includes(term)) {
                    foundInType.push('title');
                }
                if (record.source.toLowerCase().includes(term)) {
                    foundInType.push('source');
                }
                if (record.category.toLowerCase().includes(term)) {
                    foundInType.push('category');
                }
                if (record.published_datetime_txt.toLowerCase().includes(term)) {
                    foundInType.push('published_datetime');
                }

                termsFoundInTypes.push(foundInType);
            }

            return this.foundInOne(termsFoundInTypes);
        });

        return searchedRecords;
    }

    foundInOne(termsFoundInTypes) {
        // TODO: Better name for the method
        if (termsFoundInTypes[0] && termsFoundInTypes[0].length > 0 && !termsFoundInTypes[1]) {
            return true;
        }

        const foundInBaseTypes = termsFoundInTypes[0];

        for (let i = 1; i < termsFoundInTypes.length; i++) {
            const foundInOtherTypes = termsFoundInTypes[i];
            
            if (haveItemInCommon(foundInBaseTypes, foundInOtherTypes)) {
                return true;
            }
        }

        return false;
    }
}

function haveItemInCommon(arr1, arr2) {
    for (const item of arr1) {
        if (arr2.indexOf(item) >= 0) {
            return true;
        }
    }

    return false;
}