(function () {
    'use strict';

    angular.module('app.data-sources').controller('DataSourcesListController', DataSourcesListController);

    DataSourcesListController.$inject = ['$location', '$timeout', 'connection', 'api', 'gettextCatalog'];

    function DataSourcesListController ($location, $timeout, connection, api, gettextCatalog) {
        const vm = this;
        vm.IntroOptions = {};
        vm.getDatasources = getDatasources;
        vm.goToPage = goToPage;
        vm.page = 1;
        vm.pages = 1;

        activate();

        function activate () {
            vm.IntroOptions = getIntroOptions();

            if ($location.hash() === 'intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }

            getDatasources();
        }

        function getIntroOptions () {
            return {
                nextLabel: gettextCatalog.getString('Next'),
                prevLabel: gettextCatalog.getString('Back'),
                skipLabel: gettextCatalog.getString('Skip'),
                doneLabel: gettextCatalog.getString('Done'),
                tooltipPosition: 'auto',
                showStepNumbers: false,
                steps: [
                    {
                        intro: '<h4>' +
                            gettextCatalog.getString('Data sources') +
                            '</h4><p>' +
                            gettextCatalog.getString('Data sources are connections to the databases you are going to generate reports for.') +
                            '</p><p>' +
                            gettextCatalog.getString('Create and manage here the connections to databases that holds the data you want to be able to create reports using Urungi.') +
                            '</p><p>' +
                            gettextCatalog.getString('At least one data source must be defined, unless you do not define some data source you and your users will not be able to create reports.') +
                            '</p>',
                    },
                    {
                        element: '#newDataSourceBtn',
                        intro: '<h4>' +
                            gettextCatalog.getString('New datasource') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to create a new datasource.') +
                            '</p>',
                    },
                    {
                        element: '#datasourceList',
                        intro: '<h4>' +
                            gettextCatalog.getString('List of data sources') +
                            '</h4><p>' +
                            gettextCatalog.getString('Here all the data sources (database connections) will be listed.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can edit the connection details for every data source, delete a data source or activate/deactivate a datasource.') +
                            '</p>',
                    },
                    {
                        element: '#datasourceListItem',
                        intro: '<h4>' +
                            gettextCatalog.getString('Data source') +
                            '</h4><p>' +
                            gettextCatalog.getString('This is one data source.') +
                            '</p>',

                    },
                    {
                        element: '#datasourceListItemName',
                        intro: '<h4>' +
                            gettextCatalog.getString('Data source name & type') +
                            '</h4><p>' +
                            gettextCatalog.getString('The name for the data source and the type of connection (end database).') +
                            '</p><p>' +
                            gettextCatalog.getString('You can setup the name you want for data sources.') +
                            '</p>',

                    },
                    {
                        element: '#datasourceListItemDetails',
                        intro: '<h4>' +
                            gettextCatalog.getString('Data source connection details') +
                            '</h4><p>' +
                            gettextCatalog.getString('The main connection details for the data source.') +
                            '</p>',
                    },
                    {
                        intro: '<div><h4>' +
                            gettextCatalog.getString('Next Step') +
                            '</h4><p>' +
                            gettextCatalog.getString('Layers') +
                            '</p>' +
                            gettextCatalog.getString('Layers') +
                            ' (<a href="https://en.wikipedia.org/wiki/Semantic_layer" target="_blank">semantic layers</a>) ' +
                            gettextCatalog.getString('allow your users to access and understand your data without any knowledge of SQL or how the database is structured in tables and fields...') +
                            '</p><a class="btn btn-info btn-xs" href="layers#intro">' +
                            gettextCatalog.getString('Go to layers and continue tour') +
                            '</a>',
                    }
                ]
            };
        }

        function getDatasources (page) {
            const params = {
                page: page || 1,
                fields: 'name,type,connection.host,connection.port,connection.database',
            };

            return api.getDatasources(params).then(function (res) {
                vm.items = res.data;
                vm.page = res.page;
                vm.pages = res.pages;
            });
        }

        function goToPage (page) {
            getDatasources(page);
        }
    }
})();
