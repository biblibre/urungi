/* global introJs: false */
import api from '../api.js';
import { t } from '../i18n.js';
import { el } from '../dom.js';
import Table from '../table.js';

const table = new Table({
    fetch: params => {
        const apiParams = {
            page: params.page || 1,
        };
        return api.getDatasources(apiParams).then(res => res.data);
    },
    columns: [
        {
            name: t('Name'),
            render: datasource => {
                return el('a', { href: `data-sources/${datasource._id}/edit` }, datasource.name);
            },
        },
        {
            name: t('Type'),
            render: datasource => {
                return el('span', datasource.type);
            },
        },
        {
            name: t('Host'),
            render: datasource => {
                return el('span', datasource.connection.host);
            },
        },
        {
            name: t('Port'),
            render: datasource => {
                return el('span', datasource.connection.port);
            },
        },
        {
            name: t('Database'),
            render: datasource => {
                return el('span', datasource.connection.database);
            },
        },
    ],
});

table.render(document.getElementById('datasource-list-table-wrapper'));

if (location.hash === '#intro') {
    showIntro();
}
$('#showIntroButton').on('click', function () {
    showIntro();
});

function showIntro () {
    introJs().setOptions({
        nextLabel: t('Next'),
        prevLabel: t('Back'),
        doneLabel: t('Done'),
        steps: [
            {
                title: t('Data sources'),
                intro: '<p>' +
                    t('Data sources are connections to the databases you are going to generate reports for.') +
                    '</p><p>' +
                    t('Create and manage here the connections to databases that holds the data you want to be able to create reports using Urungi.') +
                    '</p><p>' +
                    t('At least one data source must be defined, unless you do not define some data source you and your users will not be able to create reports.') +
                    '</p>',
            },
            {
                element: '#newDataSourceBtn',
                title: t('New datasource'),
                intro: t('Click here to create a new datasource.'),
            },
            {
                element: '#datasource-list-table-wrapper',
                title: t('List of data sources'),
                intro: '<p>' +
                    t('Here all the data sources (database connections) will be listed.') +
                    '</p><p>' +
                    t('You can edit the connection details for every data source, delete a data source or activate/deactivate a datasource.') +
                    '</p>',
            },
            {
                element: '#datasource-list-table-wrapper tbody tr',
                title: t('Data source'),
                intro: '<p>' +
                    t('This is one data source.') +
                    '</p><p>' +
                    t('Click on its name to edit its details and test the connection'),
            },
            {
                title: t('Next Step'),
                intro: t('Layers') +
                    ' (<a href="https://en.wikipedia.org/wiki/Semantic_layer" target="_blank">semantic layers</a>) ' +
                    t('allow your users to access and understand your data without any knowledge of SQL or how the database is structured in tables and fields...') +
                    '</p><a href="layers#intro" target="_self">' +
                    t('Go to layers and continue tour') +
                    '</a>',
            }
        ]
    }).start();
}
