import '../scss/main.scss'

import Axios from 'axios'

// Search component
import * as searchView from './views/searchView';
import Search from './models/Search';

class Desk {
    constructor() {
        this.state = {};
    }
    async getAllRecords() {
        let resp;

        try {
            resp = await Axios('/api/api.json?records');
        } catch {
            alert('Nebylo možné načíst data');
            return false;
        }

        const records = resp.data.allRecords;

        return records;
    }
    async getAllCategories() {
        let resp;

        try {
            resp = await Axios('/api/api.json?categories');
        } catch {
            alert('Nebylo možné kategorie data');
            return false;
        }

        const categories = resp.data.allCategories;

        return categories;
    }
    async getAllFields() {
        let resp;

        try {
            resp = await Axios('/api/api.json?fields');
        } catch {
            alert('Nebylo možné načíst oblasti');
            return false;
        }

        const fields = resp.data.allFields;

        return fields;
    }
    async init() {
        const records = await this.getAllRecords();
        if (records === false) return;

        const categories = await this.getAllCategories();
        if (categories === false) return;

        const fields = await this.getAllFields();
        if (fields === false) return;

        this.state.records = records;
        this.state.categories = categories;
        this.state.fields = fields;
    }
}

const desk = new Desk;
desk.init();
console.log(desk);