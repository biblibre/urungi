(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsListController', DashboardsListController);

    DashboardsListController.$inject = ['$rootScope', '$location', '$timeout', 'api', 'gettextCatalog', 'userService'];

    function DashboardsListController ($rootScope, $location, $timeout, api, gettextCatalog, userService) {
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

            return api.dashboardsFindAll(params).then(result => {
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
                steps: [
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Dashboards') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                            gettextCatalog.getString('In here you can create and execute dashboards like web pages.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('Define several reports using filters and dragging and dropping from different layers.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('After you define the report/s to get and visualize your data, you can drag and drop different html layout elements, and put your report in, using different formats to show it.') +
                            '</span><br/><br/><span></span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '300px'
                    },
                    {
                        element: '#newDashboardButton',
                        html: '<div><h3>' +
                            gettextCatalog.getString('New Dashboard') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to create a new dashboard.') +
                            '</span><br/><span></span></div>',
                        width: '300px',
                        height: '150px',
                        areaColor: 'transparent',
                        horizontalAlign: 'right',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#dashboardList',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Dashboards list') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Here all your dashboards are listed.') +
                            '</span><br/><span>' +
                            gettextCatalog.getString('Click over a dashboard\'s name to execute it.') +
                            '<br/><br/>' +
                            gettextCatalog.getString('You can also modify or drop the dashboard, clicking into the modify or delete buttons.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: 'top',
                        height: '180px'

                    },
                    {
                        element: '.btn-edit',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Dashboard edit') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to modify the dashboard.') +
                            '</span><br/><br/><span></span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px'

                    },
                    {
                        element: '.btn-delete',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Dashboard delete') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to delete the dashboard.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('Once deleted the dashboard will not be recoverable again.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('Requires 2 step confirmation.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px'

                    },
                    {
                        element: '.published-tag',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Dashboard published') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('This label indicates that this dashboard is public.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('If you drop or modify a published dashboard, it will have and impact on other users, think about it before making any updates on the dashboard.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px'

                    }
                ]
            };

            return introOptions;
        }
    }
})();
