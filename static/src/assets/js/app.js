import '../scss/main.scss'

import Axios from 'axios'

import {elements} from './views/base';

// Search component
import * as searchView from './views/searchView';
import Search from './models/Search';

// Results component
import * as resultsView from './views/resultsView';
// import Results from './models/Results';

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
    async getSearchedRecords(currentRegion, sorters) {
        const searchedTxt = searchView.getSearchedTxt();
        const selectedCategory = searchView.getCategory();
        const selectedSource = searchView.getSource();

        const searchedRecordsObj = await this.state.search.search(
            currentRegion,
            searchedTxt,
            selectedCategory,
            selectedSource,
            sorters
        );

        return searchedRecordsObj;
    }
    init(categories, sources) {
        this.render(categories, sources);
    }
}

/**
 * RESULTS controller
 */

class ResultsController {
    constructor(recordsObj) {
        this.state = {
            recordsObj: recordsObj,
        };
    }
    updateRecords(recordsObj) {
        this.state.recordsObj = recordsObj;
        this.state.recordsObj.messages = Array.from(this.state.recordsObj.messages);
        this.render();
    }
    render() {
        resultsView.render(this.state.recordsObj.messages);
        resultsView.updateResultsCount(this.state.recordsObj.count);
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
    async fetchAllRecords(currentRegion) {
        let resp;

        try {
            resp = await Axios('/api/search/?region=' + currentRegion);
        } catch {
            console.error('Nebylo možné načíst data');
            return false;
        }

        const recordsObj = resp.data;

        return recordsObj;
    }
    async fetchAllCategories(currentRegion) {
        let resp;

        try {
            resp = await Axios('/api/categories/?region=' + currentRegion);
        } catch {
            console.error('Nebylo možné kategorie data');
            return false;
        }

        const categories = resp.data;

        return categories;
    }
    async fetchAllSources(currentRegion) {
        let resp;

        try {
            resp = await Axios('/api/sources/?region=' + currentRegion);');
        } catch {
            console.error('Nebylo možné načíst oblasti');
            return false;
        }

        const sources = resp.data;

        return sources;
    }
    async fetchRegions() {
        let resp;

        try {
            resp = await Axios('/api/regions/');
        } catch {
            console.error('Nebylo možné načíst regiony');
            return false;
        }

        const regions = resp.data;

        return regions;
    }
    async getAllData(currentRegion) {
        const regions = await this.fetchRegions();
        if (regions === false) return;

        const recordsObj = await this.fetchAllRecords(currentRegion);
        if (recordsObj === false) return;

        const categories = await this.fetchAllCategories();
        if (categories === false) return;

        const sources = await this.fetchAllSources();
        if (sources === false) return;

        this.state.regions = regions;
        this.state.recordsObj = recordsObj;
        this.state.categories = categories;
        this.state.sources = sources;

        return true;
    }

    setRegion(regionId = 1) {
        this.state.currentRegion = regionId;
    }

    setupEvents() {
        elements.searchForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const sorters = resultsView.getSorters();
            const searchedRecordsObj = await this.controllers.search.getSearchedRecords(this.state.currentRegion, sorters);
            this.state.searchedRecords = searchedRecordsObj.messages;

            this.controllers.results.updateRecords(searchedRecordsObj);
        });

        elements.resultSorters.forEach(sorter => {
            sorter.addEventListener('click', async (e) => {
                const sorterWrapper = e.target.closest('[data-sort-by][data-current-sort]');
                resultsView.handleSorters(sorterWrapper);

                const sorters = resultsView.getSorters();
                const searchedRecordsObj = await this.controllers.search.getSearchedRecords(this.state.currentRegion, sorters);
                this.state.searchedRecords = searchedRecordsObj.messages;

                this.controllers.results.updateRecords(searchedRecordsObj);
            });
        });

        elements.searchCategorySide.addEventListener('click', async (e) => {
            const categoryOption = e.target.closest('[data-option-id]');

            if (categoryOption) {
                const categoryId = categoryOption.dataset.optionId;
                searchView.resetFilters();
                searchView.updateFilter('category', categoryId);

                const sorters = resultsView.getSorters();
                const searchedRecordsObj = await this.controllers.search.getSearchedRecords(this.state.currentRegion, sorters);
                this.state.searchedRecords = searchedRecordsObj.messages;

                this.controllers.results.updateRecords(searchedRecordsObj);
            }
        });
        elements.searchSourcesSide.addEventListener('click', async (e) => {
            const sourceOption = e.target.closest('[data-option-id]');

            if (sourceOption) {
                const sourceId = sourceOption.dataset.optionId;
                searchView.resetFilters();
                searchView.updateFilter('source', sourceId);

                const sorters = resultsView.getSorters();
                const searchedRecordsObj = await this.controllers.search.getSearchedRecords(this.state.currentRegion, sorters);
                this.state.searchedRecords = searchedRecordsObj.messages;

                this.controllers.results.updateRecords(searchedRecordsObj);
            }
        });
    }
    initControllers() {
        this.controllers.search = new SearchController(this.state.recordsObj);
        this.controllers.search.init(this.state.categories, this.state.sources);

        this.controllers.results = new ResultsController(this.state.recordsObj);
        this.controllers.results.render();
    }
    async init() {
        this.setRegion(1);

        const fetchedDataStatus = await this.getAllData(
            this.state.currentRegion
        );
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
console.log(desk);