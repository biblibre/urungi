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

            return api.getReports(params).then(result => {
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
                    label: 'Layer',
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
                nextLabel: gettextCatalog.getString('Next'),
                prevLabel: gettextCatalog.getString('Back'),
                skipLabel: gettextCatalog.getString('Skip'),
                doneLabel: gettextCatalog.getString('Done'),
                tooltipPosition: 'auto',
                showStepNumbers: false,
                steps: [
                    {
                        intro: '<h4>' +
                            gettextCatalog.getString('Reports') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('Here you can create and execute reports.') +
                            '</strong></p>',
                    },
                    {
                        intro: '<h4>' +
                            gettextCatalog.getString('Reports') +
                            '</h4><p>' +
                            gettextCatalog.getString('Choose a report type and drag and drop elements from the selected layer to compose your report.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can also add runtime filters to split your data in real time.') +
                            '</p>',
                    },
                    {
                        element: '#newReportButton',
                        intro: '<h4>' +
                            gettextCatalog.getString('New Report') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to create a new report.') +
                            '</p>',
                    },
                    {
                        element: '#reportList',
                        intro: '<h4>' +
                            gettextCatalog.getString('Reports list') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('Here all your reports are listed.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('Click over a report\'s name to execute it.') +
                            '</p><p>' +
                            gettextCatalog.getString('You can also modify or drop the report, clicking into the modify or delete buttons.') +
                            '</p>',
                    },
                    {
                        element: '.btn-edit',
                        intro: '<h4>' +
                            gettextCatalog.getString('Edit report') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to modify the report.') +
                            '</p>',
                    },
                    {
                        element: '.btn-delete',
                        intro: '<h4>' +
                            gettextCatalog.getString('Delete report') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('Click here to delete the report.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('Once deleted the report will not be recoverable again.') +
                            '</p><p>' +
                            gettextCatalog.getString('Requires 2 step confirmation.') +
                            '</p>',
                    },
                    {
                        element: '.btn-duplicate',
                        intro: '<h4>' +
                            gettextCatalog.getString('Duplicate report') +
                            '</h4><p>' +
                            gettextCatalog.getString('Click here to duplicate the report.') +
                            '</p>',
                    },
                    {
                        element: '.published-tag',
                        intro: '<h4>' +
                            gettextCatalog.getString('Report published') +
                            '</h4><p><strong>' +
                            gettextCatalog.getString('This label indicates that this report is public.') +
                            '</strong></p><p>' +
                            gettextCatalog.getString('If you drop or modify a published report, it will have and impact on other users, think about it before making any updates on the report.') +
                            '</p>',
                    }
                ]
            };

            return introOptions;
        }
    }
})();
