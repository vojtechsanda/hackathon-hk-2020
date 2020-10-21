import '../scss/main.scss'

import Axios from 'axios'

import {elements} from './views/base';

// Search component
import * as searchView from './views/searchView';
import Search from './models/Search';

// Results component
import * as resultsView from './views/resultsView';
// import Search from './models/Search';

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
    render(categories, fields) {
        searchView.renderCategoriesSelectOptions(categories);
        searchView.renderFieldsSelectOptions(fields);
    }
    getSearchedRecords() {
        const searchedTxt = searchView.getSearchedTxt();
        const selectedCategory = searchView.getCategory();
        const selectedField = searchView.getField();

        const searchedRecords = this.state.search.search(searchedTxt, selectedCategory, selectedField);

        return searchedRecords;
    }
    init(categories, fields) {
        this.render(categories, fields);
    }
}

/**
 * RESULTS controller
 */

class ResultsController {
    constructor(records) {
        this.state = {
            records: records
        }
    }
    updateRecords(records) {
        this.state.records = Array.from(records);
        this.render();
    }
    render() {
        resultsView.render(this.state.records);
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
            resp = await Axios('/api/api.json?records');
        } catch {
            console.error('Nebylo možné načíst data');
            return false;
        }

        const records = resp.data.allRecords;

        return records;
    }
    async fetchAllCategories() {
        let resp;

        try {
            resp = await Axios('/api/api.json?categories');
        } catch {
            console.error('Nebylo možné kategorie data');
            return false;
        }

        const categories = resp.data.allCategories;

        return categories;
    }
    async fetchAllFields() {
        let resp;

        try {
            resp = await Axios('/api/api.json?fields');
        } catch {
            console.error('Nebylo možné načíst oblasti');
            return false;
        }

        const fields = resp.data.allFields;

        return fields;
    }
    async getAllData() {
        const records = await this.fetchAllRecords();
        if (records === false) return;

        const categories = await this.fetchAllCategories();
        if (categories === false) return;

        const fields = await this.fetchAllFields();
        if (fields === false) return;

        this.state.records = records;
        this.state.categories = categories;
        this.state.fields = fields;

        return true;
    }

    setupEvents() {
        elements.searchForm.addEventListener('submit', e => {
            e.preventDefault();

            const searchedRecords = this.controllers.search.getSearchedRecords(this.state.records);
            this.state.searchedRecords = searchedRecords;

            this.controllers.results.updateRecords(searchedRecords);
        });
    }
    initControllers() {
        this.controllers.search = new SearchController(this.state.records);
        this.controllers.search.init(this.state.categories, this.state.fields);

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
console.log(desk);