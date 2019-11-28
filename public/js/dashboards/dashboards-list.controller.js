(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsListController', DashboardsListController);

    DashboardsListController.$inject = ['$location', '$timeout', 'api', 'gettextCatalog', 'userService'];

    function DashboardsListController ($location, $timeout, api, gettextCatalog, userService) {
        const vm = this;

        vm.creationAuthorised = false;
        vm.currentPage = 1;
        vm.dashboards = [];
        vm.filters = {};
        vm.goToPage = goToPage;
        vm.introOptions = {};
        vm.onFilter = onFilter;
        vm.onSort = onSort;
        vm.page = 1;
        vm.pages = 1;
        vm.refresh = refresh;
        vm.sortDir = {};

        activate();

        function activate () {
            vm.introOptions = getIntroOptions();
            vm.sortDir.dashboardName = 1;

            userService.getCurrentUser().then(user => {
                vm.creationAuthorised = user.dashboardsCreate;
            });

            refresh();

            if ($location.hash() === 'intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }
        }

        function goToPage (page) {
            vm.page = page;
            refresh();
        }

        function onFilter (name, value) {
            vm.filters[name] = value;
            vm.page = 1;
            refresh();
        }

        function onSort (name, dir) {
            for (const key in vm.sortDir) {
                vm.sortDir[key] = 0;
            }
            vm.sortDir[name] = dir;
            refresh();
        }

        function refresh () {
            const params = {};
            params.fields = ['dashboardName', 'isPublic', 'isShared', 'parentFolder', 'owner', 'author', 'createdOn'];
            params.filters = vm.filters;
            params.sort = Object.keys(vm.sortDir).find(k => vm.sortDir[k]);
            params.sortType = vm.sortDir[params.sort];
            params.page = vm.page;

            return api.getDashboards(params).then(result => {
                vm.dashboards = result.items;
                vm.currentPage = result.page;
                vm.pages = result.pages;
            });
        }

        function getIntroOptions () {
            const introOptions = {
                nextLabel: gettextCatalog.getString('Next'),
                prevLabel: gettextCatalog.getString('Back'),
                skipLabel: gettextCatalog.getString('Skip'),
                doneLabel: gettextCatalog.getString('Done'),
                tooltipPosition: 'auto',
                showStepNumbers: false,
                steps: [
                    {
                        intro: '<h4>' +
                            gettextCatalog.getString('Dashboards') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('In here you can create and execute dashboards like web pages.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('Define several reports using filters and dragging and dropping from different layers.') +
                            '</p><p>' +
                            gettextCatalog.getString('After you define the reports to get and visualize your data, you can drag and drop different html layout elements, and put your report in, using different formats to show it.') +
                            '</p>',
                    },
                    {
                        element: '#newDashboardButton',
                        intro: '<h4>' +
                            gettextCatalog.getString('New Dashboard') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to create a new dashboard.') +
                            '</p>',
                    },
                    {
                        element: '#dashboardList',
                        intro: '<h4>' +
                            gettextCatalog.getString('Dashboards list') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('Here all your dashboards are listed.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('Click over a dashboard\'s name to execute it.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can also modify or drop the dashboard, clicking into the modify or delete buttons.') +
                            '</p>',
                    },
                    {
                        element: '.btn-edit',
                        intro: '<h4>' +
                            gettextCatalog.getString('Dashboard edit') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to modify the dashboard.') +
                            '</p>',
                    },
                    {
                        element: '.btn-delete',
                        intro: '<h4>' +
                            gettextCatalog.getString('Dashboard delete') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('Click here to delete the dashboard.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('Once deleted the dashboard will not be recoverable again.') +
                            '</p><p>' +
                            gettextCatalog.getString('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        element: '.published-tag',
                        intro: '<h4>' +
                            gettextCatalog.getString('Dashboard published') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('This label indicates that this dashboard is public.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('If you drop or modify a published dashboard, it will have and impact on other users, think about it before making any updates on the dashboard.') +
                            '</p>',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
