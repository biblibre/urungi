(function () {
    'use strict';

    angular.module('app.reports').controller('ReportsListController', ReportsListController);

    ReportsListController.$inject = ['$location', '$timeout', 'api', 'gettextCatalog', 'userService'];

    function ReportsListController ($location, $timeout, api, gettextCatalog, userService) {
        const vm = this;

        vm.reports = [];
        vm.introOptions = {};
        vm.columns = [];
        vm.creationAuthorised = false;
        vm.refresh = refresh;

        activate();

        function activate () {
            vm.columns = getColumns();
            vm.introOptions = getIntroOptions();

            userService.getCurrentUser().then(user => {
                vm.creationAuthorised = user.reportsCreate;
            });

            if ($location.hash() === 'intro') {
                $timeout(function () { vm.showIntro(); }, 1000);
            }
        }

        function refresh (params) {
            params = params || vm.lastRefreshParams;
            vm.lastRefreshParams = params;

            params.populate = 'layer';
            params.fields = ['reportName', 'isPublic', 'isShared', 'layerName', 'parentFolder', 'owner', 'author', 'createdOn'];

            return api.reportsFindAll(params).then(result => {
                vm.reports = result.items;

                return { page: result.page, pages: result.pages };
            });
        }

        function getColumns () {
            return [
                {
                    name: 'reportName',
                    label: 'Name',
                    width: 3,
                    filter: true,
                },
                {
                    name: 'layerName',
                    label: 'Name',
                    width: 3,
                    filter: true,
                    filterField: 'layer.name',
                },
                {
                    name: 'author',
                    label: 'Author',
                    width: 2,
                    filter: true,
                },
                {
                    name: 'createdOn',
                    label: 'Date of creation',
                    width: 2,
                },
            ];
        }

        function getIntroOptions () {
            const introOptions = {
                steps: [
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Reports') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                            gettextCatalog.getString('Here you can create and execute reports.') +
                            '</span><br/><br/><iframe width="350" height="225" src="https://www.youtube.com/embed/_g1NcBIgGQU" frameborder="0" allowfullscreen></iframe><br/><br/><span>' +
                            gettextCatalog.getString('Watch this short tutorial to see how to create a report.') +
                            '</span></div>',
                        width: '500px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '400px',
                    },
                    {
                        element: '#parentIntro',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Reports') +
                            '</h3><span style="font-weight:bold;color:#8DC63F"></span><br/><span>' +
                            gettextCatalog.getString('Choose a report type and drag and drop elements from the selected layer to compose your report.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('You can also add runtime filters to split your data in real time.') +
                            '</span><br/><br/><span></span></div>',
                        width: '350px',
                        objectArea: false,
                        verticalAlign: 'top',
                        height: '200px'
                    },
                    {
                        element: '#newReportButton',
                        html: '<div><h3>' +
                            gettextCatalog.getString('New Report') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to create a new report.') +
                            '</span><br/><span></span></div>',
                        width: '300px',
                        height: '150px',
                        areaColor: 'transparent',
                        horizontalAlign: 'right',
                        areaLineColor: '#fff',
                    },
                    {
                        element: '#reportList',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Reports list') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Here all your reports are listed.') +
                            '</span><br/><span>' +
                            gettextCatalog.getString('Click over a report\'s name to execute it.') +
                            '<br/><br/>' +
                            gettextCatalog.getString('You can also modify or drop the report, clicking into the modify or delete buttons.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: 'top',
                        height: '180px',
                    },
                    {
                        element: '.btn-edit',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Edit report') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to modify the report.') +
                            '</span><br/><br/><span></span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px',
                    },
                    {
                        element: '.btn-delete',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Delete report') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to delete the report.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('Once deleted the report will not be recoverable again.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('Requires 2 step confirmation.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px',
                    },
                    {
                        element: '.btn-duplicate',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Duplicate report') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('Click here to duplicate the report.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px',
                    },
                    {
                        element: '.published-tag',
                        html: '<div><h3>' +
                            gettextCatalog.getString('Report published') +
                            '</h3><span style="font-weight:bold;">' +
                            gettextCatalog.getString('This label indicates that this report is public.') +
                            '</span><br/><br/><span>' +
                            gettextCatalog.getString('If you drop or modify a published report, it will have and impact on other users, think about it before making any updates on the report.') +
                            '</span></div>',
                        width: '300px',
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: 'right',
                        height: '200px',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
