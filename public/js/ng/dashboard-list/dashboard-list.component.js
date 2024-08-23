(function () {
    'use strict';

    angular.module('app.dashboard-list').component('appDashboardList', {
        templateUrl: 'partials/dashboard-list/dashboard-list.component.html',
        controller: DashboardListController,
        controllerAs: 'vm',
    });

    DashboardListController.$inject = ['$window', '$timeout', 'api', 'i18n', 'userService'];

    function DashboardListController ($window, $timeout, api, i18n, userService) {
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
        vm.showIntro = showIntro;
        vm.sortDir = {};
        vm.isAdmin = false;

        activate();

        function activate () {
            vm.sortDir.dashboardName = 1;

            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
                vm.creationAuthorised = user.dashboardsCreate;
            });

            refresh();

            if ($window.location.hash === '#intro') {
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

        function showIntro () {
            $window.introJs().setOptions(getIntroOptions()).start();
        }

        function getIntroOptions () {
            const introOptions = {
                nextLabel: i18n.gettext('Next'),
                prevLabel: i18n.gettext('Back'),
                doneLabel: i18n.gettext('Done'),
                steps: [
                    {
                        title: i18n.gettext('Dashboards'),
                        intro: '<p><strong>' +
                            i18n.gettext('In here you can create and execute dashboards like web pages.') +
                            '</strong></p><p>' +
                            i18n.gettext('Define several reports using filters and dragging and dropping from different layers.') +
                            '</p><p>' +
                            i18n.gettext('After you define the reports to get and visualize your data, you can drag and drop different html layout elements, and put your report in, using different formats to show it.') +
                            '</p>',
                    },
                    {
                        element: '#newDashboardButton',
                        title: i18n.gettext('New Dashboard'),
                        intro: i18n.gettext('Click here to create a new dashboard.'),
                    },
                    {
                        element: '#dashboardList',
                        title: i18n.gettext('Dashboards list'),
                        intro: '<p><strong>' +
                            i18n.gettext('Here all your dashboards are listed.') +
                            '</strong></p><p>' +
                            i18n.gettext('Click over a dashboard\'s name to execute it.') +
                            '</p><p>' +
                            i18n.gettext('You can also modify or drop the dashboard, clicking into the modify or delete buttons.') +
                            '</p>',
                    },
                    {
                        element: '.btn-edit',
                        title: i18n.gettext('Dashboard edit'),
                        intro: i18n.gettext('Click here to modify the dashboard.'),
                    },
                    {
                        element: '.btn-delete',
                        title: i18n.gettext('Dashboard delete'),
                        intro: '<p><strong>' +
                            i18n.gettext('Click here to delete the dashboard.') +
                            '</strong></p><p>' +
                            i18n.gettext('Once deleted the dashboard will not be recoverable again.') +
                            '</p><p>' +
                            i18n.gettext('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        element: '.published-tag',
                        title: i18n.gettext('Dashboard published'),
                        intro: '<p><strong>' +
                            i18n.gettext('This label indicates that this dashboard is public.') +
                            '</strong></p><p>' +
                            i18n.gettext('If you drop or modify a published dashboard, it will have and impact on other users, think about it before making any updates on the dashboard.') +
                            '</p>',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
