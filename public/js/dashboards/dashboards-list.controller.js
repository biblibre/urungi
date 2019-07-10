(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsListController', DashboardsListController);

    DashboardsListController.$inject = ['$location', '$timeout', 'api', 'gettextCatalog', 'userService'];

    function DashboardsListController ($location, $timeout, api, gettextCatalog, userService) {
        const vm = this;

        vm.dashboards = [];
        vm.introOptions = {};
        vm.columns = [];
        vm.creationAuthorised = false;
        vm.refresh = refresh;

        activate();

        function activate () {
            vm.columns = getColumns();
            vm.introOptions = getIntroOptions();

            userService.getCurrentUser().then(user => {
                vm.creationAuthorised = user.dashboardsCreate;
            });

            if ($location.hash() === 'intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }
        }

        function refresh (params) {
            params = params || vm.lastRefreshParams;
            vm.lastRefreshParams = params;

            params.fields = ['dashboardName', 'isPublic', 'isShared', 'parentFolder', 'owner', 'author', 'createdOn'];

            return api.getDashboards(params).then(result => {
                vm.dashboards = result.items;

                return { page: result.page, pages: result.pages };
            });
        }

        function getColumns () {
            return [
                {
                    name: 'dashboardName',
                    label: 'Name',
                    width: 4,
                    filter: true,
                },
                {
                    name: 'author',
                    label: 'Author',
                    width: 3,
                    filter: true,
                },
                {
                    name: 'createdOn',
                    label: 'Date of creation',
                    width: 3,
                },
            ];
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
