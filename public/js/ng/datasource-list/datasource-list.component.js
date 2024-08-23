(function () {
    'use strict';

    angular.module('app.datasource-list')
        .controller('DatasourceListController', DatasourceListController)
        .component('appDatasourceList', {
            templateUrl: 'partials/datasource-list/datasource-list.component.html',
            controller: 'DatasourceListController',
            controllerAs: 'vm',
        });

    DatasourceListController.$inject = ['$timeout', '$window', 'connection', 'api', 'i18n'];

    function DatasourceListController ($timeout, $window, connection, api, i18n) {
        const vm = this;
        vm.IntroOptions = {};
        vm.getDatasources = getDatasources;
        vm.goToPage = goToPage;
        vm.page = 1;
        vm.pages = 1;
        vm.showIntro = showIntro;

        activate();

        function activate () {
            vm.IntroOptions = getIntroOptions();

            if ($window.location.hash === '#intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }

            getDatasources();
        }

        function getIntroOptions () {
            return {
                nextLabel: i18n.gettext('Next'),
                prevLabel: i18n.gettext('Back'),
                doneLabel: i18n.gettext('Done'),
                steps: [
                    {
                        title: i18n.gettext('Data sources'),
                        intro: '<p>' +
                            i18n.gettext('Data sources are connections to the databases you are going to generate reports for.') +
                            '</p><p>' +
                            i18n.gettext('Create and manage here the connections to databases that holds the data you want to be able to create reports using Urungi.') +
                            '</p><p>' +
                            i18n.gettext('At least one data source must be defined, unless you do not define some data source you and your users will not be able to create reports.') +
                            '</p>',
                    },
                    {
                        element: '#newDataSourceBtn',
                        title: i18n.gettext('New datasource'),
                        intro: i18n.gettext('Click here to create a new datasource.'),
                    },
                    {
                        element: '#datasourceList',
                        title: i18n.gettext('List of data sources'),
                        intro: '<p>' +
                            i18n.gettext('Here all the data sources (database connections) will be listed.') +
                            '</p><p>' +
                            i18n.gettext('You can edit the connection details for every data source, delete a data source or activate/deactivate a datasource.') +
                            '</p>',
                    },
                    {
                        element: '#datasourceListItem',
                        title: i18n.gettext('Data source'),
                        intro: i18n.gettext('This is one data source.'),
                    },
                    {
                        element: '#datasourceListItemName',
                        title: i18n.gettext('Data source name & type'),
                        intro: '<p>' +
                            i18n.gettext('The name for the data source and the type of connection (end database).') +
                            '</p><p>' +
                            i18n.gettext('You can setup the name you want for data sources.') +
                            '</p>',

                    },
                    {
                        element: '#datasourceListItemDetails',
                        title: i18n.gettext('Data source connection details'),
                        intro: i18n.gettext('The main connection details for the data source.'),
                    },
                    {
                        title: i18n.gettext('Next Step'),
                        intro: i18n.gettext('Layers') +
                            ' (<a href="https://en.wikipedia.org/wiki/Semantic_layer" target="_blank">semantic layers</a>) ' +
                            i18n.gettext('allow your users to access and understand your data without any knowledge of SQL or how the database is structured in tables and fields...') +
                            '</p><a href="layers#intro" target="_self">' +
                            i18n.gettext('Go to layers and continue tour') +
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

        function showIntro () {
            $window.introJs().setOptions(vm.IntroOptions).start();
        }
    }
})();
