(function () {
    'use strict';

    angular.module('app.data-sources').controller('DataSourcesListController', DataSourcesListController);

    DataSourcesListController.$inject = ['$location', '$timeout', 'connection', 'api', 'pager', 'gettextCatalog'];

    function DataSourcesListController ($location, $timeout, connection, api, pager, gettextCatalog) {
        const vm = this;
        vm.pager = {};
        vm.IntroOptions = {};

        activate();

        function activate () {
            vm.IntroOptions = getIntroOptions();

            if ($location.hash() === 'intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }
        }

        function getIntroOptions () {
            return {
                steps: [
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Data sources') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                            gettextCatalog.getString('Data sources are connections to the databases you are going to generate reports for.') +
                            '</span><br/><span>' +
                            gettextCatalog.getString('Create and manage here the connections to databases that holds the data you want to be able to create reports using Urungi.') +
                            '</span><br/><span>' +
                            gettextCatalog.getString('At least one data source must be defined, unless you do not define some data source you and your users will not be able to create reports.') +
                            '</span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '250px'
                    },
                    {
                        element: '#newDataSourceBtn',
                        html: '<div><h3>' +
                            gettextCatalog.getString('New datasource') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to create a new datasource.') +
                            '</span><br/><span></span></div>',
                        width: '300px',
                        height: '150px',
                        areaColor: 'transparent',
                        horizontalAlign: 'right',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#datasourceList',
                        html: '<div><h3>' +
                            gettextCatalog.getString('List of data sources') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Here all the data sources (database connections) will be listed.') +
                            '</span><br/><span>' +
                            gettextCatalog.getString('You can edit the connection details for every data source, delete a data source or activate/deactivate a datasource.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: 'top',
                        height: '180px'

                    },
                    {
                        element: '#datasourceListItem',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Data source') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('This is one data source.') +
                            '</span><br/><span></span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#72A230',
                        height: '180px'

                    },
                    {
                        element: '#datasourceListItemName',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Data source name & type') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('The name for the data source and the type of connection (end database).') +
                            '</span><br/><span>' +
                            gettextCatalog.getString('You can setup the name you want for data sources.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: '180px'

                    },
                    {
                        element: '#datasourceListItemDetails',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Data source connection details') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('The main connection details for the data source.') +
                            '</span><br/><span></span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: '180px'

                    },
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Next Step') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                            gettextCatalog.getString('Layers') +
                            '</span><br/><br/><br/>' +
                            gettextCatalog.getString('Layers') +
                            '(<a href="https://en.wikipedia.org/wiki/Semantic_layer" target="_blank">semantic layers</a>)' +
                            gettextCatalog.getString(' allow your users to access and understand your data without any knowledge of SQL or how the database is structured in tables and fields...') +
                            '<br/><br/><span> <a class="btn btn-info pull-right" href="/#/layer/intro">' +
                            gettextCatalog.getString('Go to layers and continue tour') +
                            '</a></span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '250px'
                    }
                ]
            };
        }

        vm.getDataSources = function (page, search, fields) {
            var params = {};

            params.page = (page) || 1;

            if (search) {
                vm.search = search;
            } else if (page === 1) {
                vm.search = '';
            }
            if (vm.search) {
                params.search = vm.search;
            }

            if (fields) params.fields = fields;

            return api.getDataSources(params).then(function (data) {
                vm.items = data.items;
                vm.page = data.page;
                vm.pages = data.pages;
                vm.pager = pager.getPager(data.page, data.pages);
            });
        };
    };
})();
