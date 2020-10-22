import '../scss/detail.scss';

import { elements } from './views/base';

import Axios from 'axios';

{
    const fetchDetail = async (id) => {
        let resp;

        try {
            resp = await Axios('/api/message?id='+id);
        } catch {
            alert('Nebylo možné načíst detail');
            return;
        }

        return resp.data;
    }
    const getQueryParam = param => {
        const query = location.search.slice(1);
        const queryParts = query.split("&");
        const queryPartsSeparated = queryParts.map(part => part.split("="));

        const wantedPart = queryPartsSeparated.find(part => part[0] == param);

        if (wantedPart) {
            return wantedPart[1];
        }

        return null;
    }

    const renderDetail = detail => {
        elements.detailTitle.textContent = detail.title;
        elements.detailCategory.textContent = detail.category;

        let detailsMarkup = '';
        
        const detailsItems = [
            {
                name: 'Název',
                key: 'title',
            },
            {
                name: 'Autor',
                key: 'source',
            },
            {
                name: 'Kategorie',
                key: 'category',
            },
            {
                name: 'Zveřejněno od',
                key: 'published_datetime_txt',
            },
            {
                name: 'Má být vyvěšeno do',
                key: 'expired_datetime_txt',
            },
            {
                name: 'Příloha',
                key: 'instances',
            },
        ];

        detailsItems.forEach(item => {
            if (item.key === 'instances') {
                const instances = detail[item.key];

                if (instances !== null & instances.length > 0) {
                    instances.forEach((instance, i) => {
                        if (instance.title && instance.attachment_url && instance.attachment_filename) {
                            const ext = instance.attachment_filename.split(".").pop().toUpperCase();

                            detailsMarkup += `
                                <div class="row">
                                    <div class="col">${item.name} č.${i + 1}</div>
                                    <div class="col"><a href="${instance.attachment_url}" target="_blank">${instance.title} (${ext})</a></div>
                                </div>
                            `;
                        }
                    })
                }
            } else {
                if (detail[item.key] !== null) {
                    detailsMarkup += `
                        <div class="row">
                            <div class="col">${item.name}</div>
                            <div class="col">${detail[item.key]}</div>
                        </div>
                    `;
                }
            }
        })

        elements.detailDetailsTable.insertAdjacentHTML('beforeend', detailsMarkup);
    }
    
    (async function() {
        const messageId = getQueryParam('id');
        
        if (messageId === null) {
            alert('Unable to find id');
            return;
        }

        const detail = await fetchDetail(messageId);

        renderDetail(detail);
    })()
}