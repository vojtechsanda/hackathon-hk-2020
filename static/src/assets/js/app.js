import '../scss/app.scss'

import Axios from 'axios'

import { elements, renderRegionsSelect } from './views/base';

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
    constructor() {
        this.state = {
            search: new Search(),
            offset: 0,
        };
    }
    render(categories, sources) {
        searchView.renderCategoriesSelectOptions(categories, getHashParam('category'));
        searchView.renderCategoriesSide(categories);
        searchView.renderSourcesSelectOptions(sources, getHashParam('source'));
        searchView.renderSourcesSide(sources);

        const presetTxt = getHashParam('txt');
        if (presetTxt) {
            searchView.updateInput(presetTxt);
        }

    }
    updateFilter(filterType, filterOptionId) {
        searchView.updateFilter(filterType, filterOptionId);
    }
    async getSearchedRecords(currentRegion, sorters, resetOffset = true) {
        if (resetOffset) {
            this.state.offset = 0;
        }

        const searchedTxt = searchView.getSearchedTxt();
        const selectedCategory = searchView.getCategory();
        const selectedSource = searchView.getSource();

        const searchedRecordsObj = await this.state.search.search(
            currentRegion,
            searchedTxt,
            selectedCategory,
            selectedSource,
            sorters,
            this.state.offset
        );

        this.state.offset++;

        return searchedRecordsObj;
    }
    async searchNext(currentRegion, sorters) {
        const newResults = this.getSearchedRecords(currentRegion, sorters, false);

        return newResults;
    }
    init(categories, sources) {
        this.render(categories, sources);
    }
}

/**
 * RESULTS controller
 */

class ResultsController {
    constructor() {
        this.state = {

        };
    }
    updateRecords(recordsObj) {
        console.log(recordsObj);
        this.state.recordsObj = recordsObj;
        this.state.recordsObj.messages = Array.from(this.state.recordsObj.messages);
        this.render(recordsObj);
    }
    render(recordsObj) {
        resultsView.render(recordsObj.messages);
        resultsView.updateResultsCount(recordsObj.count);
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
            resp = await Axios('/api/sources/?region=' + currentRegion);
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

        const categories = await this.fetchAllCategories(currentRegion);
        if (categories === false) return;

        const sources = await this.fetchAllSources(currentRegion);
        if (sources === false) return;

        this.state.regions = regions;
        this.state.categories = categories;
        this.state.sources = sources;

        return true;
    }

    setRegion(regionId = 1) {
        this.state.currentRegion = regionId;
    }

    async updateRegion() {
        const currentRegion = this.state.currentRegion;
        
        const sorters = resultsView.getSorters();
        const searchedRecordsObj = await this.controllers.search.getSearchedRecords(currentRegion, sorters);
        this.state.searchedRecords = searchedRecordsObj.messages;

        this.controllers.results.updateRecords(searchedRecordsObj);

        await this.getAllData(currentRegion);
        this.controllers.search.render(this.state.categories, this.state.sources);
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
        elements.regionSelect.addEventListener('change', e => {
            const newRegionId = e.target.value;
            this.state.currentRegion = newRegionId;
            searchView.resetFilters();
            this.updateRegion();
        });
        window.addEventListener('scroll', async e => {
            const fifthItem = resultsView.getFifthResult();
            
            const bottomOffset = (fifthItem.offsetBottom = window.innerHeight - (fifthItem.offsetTop + fifthItem.offsetHeight))*(-1);

            if ((!this.state.lockSearchNext && bottomOffset < window.scrollY)) {
                this.state.lockSearchNext = true;
                
                const sorters = resultsView.getSorters();
                const nextSearch = await this.controllers.search.searchNext(this.state.currentRegion, sorters);
    
                this.state.recordsObj.messages = [...this.state.recordsObj.messages, ...nextSearch.messages];
    
                this.controllers.results.updateRecords(this.state.recordsObj);

                this.state.lockSearchNext = false;
            }
        })
    }
    initControllers() {
        this.controllers.search = new SearchController;
        this.controllers.search.init(this.state.categories, this.state.sources);

        this.controllers.results = new ResultsController;
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

        const sorters = resultsView.getSorters();
        const searchedRecordsObj = await this.controllers.search.getSearchedRecords(this.state.currentRegion, sorters);

        this.state.recordsObj = searchedRecordsObj;

        this.controllers.results.updateRecords(searchedRecordsObj);

        renderRegionsSelect(this.state.regions, this.state.currentRegion);
        this.setupEvents();
    }
}

const desk = new Desk;
desk.init();
console.log(desk);

function getHashParam(param) {
    const query = location.hash.slice(1);
    const queryParts = query.split('&');
    const queryPartsSeparated = queryParts.map((part) => part.split('='));

    const wantedPart = queryPartsSeparated.find((part) => part[0] == param);

    if (wantedPart && wantedPart[1]) {
        return wantedPart[1];
    }

    return null;
}