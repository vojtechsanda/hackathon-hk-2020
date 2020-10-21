import '../scss/main.scss'

import Axios from 'axios'

import {elements} from './views/base';

// Search component
import * as searchView from './views/searchView';
import Search from './models/Search';

// Results component
import * as resultsView from './views/resultsView';
import Results from './models/Results';

/**
 * SEARCH controller
 */

class SearchController {
    constructor(records) {
        this.state = {
            records: records,
            search: new Search(records),
        };
    }
    render(categories, sources) {
        searchView.renderCategoriesSelectOptions(categories);
        searchView.renderCategoriesSide(categories);
        searchView.renderSourcesSelectOptions(sources);
        searchView.renderSourcesSide(sources);
    }
    updateFilter(filterType, filterOptionId) {
        searchView.updateFilter(filterType, filterOptionId);
    }
    getSearchedRecords() {
        const searchedTxt = searchView.getSearchedTxt();
        const selectedCategory = searchView.getCategory();
        const selectedSource = searchView.getSource();

        const searchedRecords = this.state.search.search(
            searchedTxt,
            selectedCategory,
            selectedSource
        );

        return searchedRecords;
    }
    init(categories, sources) {
        this.render(categories, sources);
    }
}

/**
 * RESULTS controller
 */

class ResultsController {
    constructor(records) {
        this.state = {
            records: records,
            results: new Results
        }
    }
    updateRecords(records) {
        this.state.records = Array.from(records);
        this.render();
    }
    render() {
        const sorters = resultsView.getSorters();
        const sortedRecords = this.state.results.sortBy(this.state.records, sorters);

        resultsView.render(sortedRecords);
        resultsView.updateResultsCount(this.state.records.length);
    }
}

/**
 * GLOBAL controller
 */
class Desk {
    constructor() {
        this.state = {};
        this.controllers = {};
    }
    async fetchAllRecords() {
        let resp;

        try {
            resp = await Axios('/api/all/');
        } catch {
            console.error('Nebylo možné načíst data');
            return false;
        }

        const records = resp.data;

        return records;
    }
    async fetchAllCategories() {
        let resp;

        try {
            resp = await Axios('/api/categories/');
        } catch {
            console.error('Nebylo možné kategorie data');
            return false;
        }

        const categories = resp.data;

        return categories;
    }
    async fetchAllSources() {
        let resp;

        try {
            resp = await Axios('/api/sources/');
        } catch {
            console.error('Nebylo možné načíst oblasti');
            return false;
        }

        const sources = resp.data;

        return sources;
    }
    async getAllData() {
        const records = await this.fetchAllRecords();
        if (records === false) return;

        const categories = await this.fetchAllCategories();
        if (categories === false) return;

        const sources = await this.fetchAllSources();
        if (sources === false) return;

        this.state.records = records;
        this.state.categories = categories;
        this.state.sources = sources;

        return true;
    }

    setupEvents() {
        elements.searchForm.addEventListener('submit', e => {
            e.preventDefault();

            const searchedRecords = this.controllers.search.getSearchedRecords(this.state.records);
            this.state.searchedRecords = searchedRecords;

            this.controllers.results.updateRecords(searchedRecords);
        });

        elements.resultSorters.forEach((sorter) => {
            sorter.addEventListener('click', e => {
                const sorterWrapper = e.target.closest('[data-sort-by][data-current-sort]');
                resultsView.handleSorters(sorterWrapper);
                this.controllers.results.render();
            });
        });

        elements.searchCategorySide.addEventListener('click', e => {
            const categoryOption = e.target.closest('[data-option-id]');
            
            if (categoryOption) {
                const categoryId = categoryOption.dataset.optionId;
                searchView.resetFilters();
                searchView.updateFilter('category', categoryId);
            }
        })
        elements.searchSourcesSide.addEventListener('click', e => {
            const sourceOption = e.target.closest('[data-option-id]');

            if (sourceOption) {
                const sourceId = sourceOption.dataset.optionId;
                searchView.resetFilters();
                searchView.updateFilter('source', sourceId);
            }
        });
    }
    initControllers() {
        this.controllers.search = new SearchController(this.state.records);
        this.controllers.search.init(this.state.categories, this.state.sources);

        this.controllers.results = new ResultsController(this.state.records);
        this.controllers.results.render();
    }
    async init() {
        const fetchedDataStatus = await this.getAllData();
        if (!fetchedDataStatus) {
            alert('Nějaký zdroj se nenačtl');
            return;
        }

        this.initControllers();
        this.setupEvents();
    }
}

const desk = new Desk;
desk.init();