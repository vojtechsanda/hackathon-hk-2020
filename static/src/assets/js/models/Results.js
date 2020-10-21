export default class Results {
    sortBy(results, sorters) {
        const sortableResults = Array.from(results);

        console.log(sortableResults, sorters);

        for (const sorter of sorters) {
            if (sorter.sortOrder === 'none') continue;
            if (typeof (sortableResults[0][sorter.sortBy]) === 'string') {
                if (sorter.sortOrder === 'asc') {
                    sortableResults.sort();
                    sortableResults.reverse();
                } else if (sorter.sortOrder === 'desc') {
                    sortableResults.sort();
                }
            } else if (typeof (sortableResults[0][sorter.sortBy]) === 'number') {
                if (sorter.sortOrder === 'asc') {
                    sortableResults.sort((result1, result2) => result1[sorter.sortBy] - result2[sorter.sortBy]);
                } else if (sorter.sortOrder === 'desc') {
                    sortableResults.sort((result1, result2) => result2[sorter.sortBy] - result1[sorter.sortBy]);
                }
            }

        }

        return sortableResults;
    }
}
