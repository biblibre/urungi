(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsViewController', DashboardsViewController);

    DashboardsViewController.$inject = ['$scope', '$timeout', '$compile', '$uibModal', '$location', 'notify', 'gettextCatalog', 'api', 'userService', 'dashboard', 'reportsService'];

    function DashboardsViewController ($scope, $timeout, $compile, $uibModal, $location, notify, gettextCatalog, api, userService, dashboard, reportsService) {
        const vm = this;

        vm.downloadAsPDF = downloadAsPDF;
        vm.downloadAsPNG = downloadAsPNG;
        vm.exportAsPDFAvailable = false;
        vm.exportAsPNGAvailable = false;
        vm.mode = 'preview';
        vm.prompts = {};
        vm.dashboard = dashboard;
        vm.getReport = getReport;
        vm.promptChanged = promptChanged;
        vm.isAdmin = false;
        vm.exportIsLoading = false;
        vm.promptsFilters = {};
        vm.mandatoryPrompts = [];
        vm.creationAuthorised = false;

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
                vm.creationAuthorised = user.dashboardsCreate;
            }, () => {});
            api.isDashboardAsPDFAvailable(dashboard._id).then(available => {
                vm.exportAsPDFAvailable = available;
            });
            api.isDashboardAsPNGAvailable(dashboard._id).then(available => {
                vm.exportAsPNGAvailable = available;
            });
            loadHTML();
        }

        function getReport (reportID) {
            return vm.dashboard.reports.find(r => r.id === reportID);
        }

        function promptChanged () {
            repaintReports();
        }

        function loadHTML () {
            const pageViewer = document.getElementById('pageViewer');
            pageViewer.insertAdjacentHTML('beforeend', vm.dashboard.html);

            if (vm.dashboard.properties.rootStyle) {
                pageViewer.setAttribute('style', vm.dashboard.properties.rootStyle);
            }

            document.querySelectorAll('[report-view]').forEach(reportView => {
                const reportAttr = reportView.getAttribute('report');
                reportView.setAttribute('report', 'vm.' + reportAttr);
            });

            initPrompts();

            $compile(pageViewer)($scope);

            vm.mandatoryPrompts = Object.values(vm.prompts).filter(p => p.promptMandatory);

            if (!vm.mandatoryPrompts.length || reportsService.checkPrompts(vm.mandatoryPrompts)) {
                $timeout(function () {
                    repaintReports();
                }, 0);
            }
        }

        function initPrompts () {
            const search = $location.search();
            const filters = JSON.parse(search.filters || '{}');
            for (const report of vm.dashboard.reports) {
                for (const filter of report.properties.filters) {
                    if (filter.filterPrompt) {
                        const p = {};
                        for (const i in filter) {
                            p[i] = filter[i];
                        }
                        const ident = p.id + p.filterType;
                        if (ident in filters) {
                            p.criterion = filters[ident];
                        } else {
                            p.criterion = {};
                        }
                        vm.prompts[ident] = p;
                    }
                }
            }

            getPromptsWidget();
        };

        function getPromptsWidget () {
            for (const promptID in vm.prompts) {
                const targetPrompt = document.getElementById('PROMPT_' + promptID);

                if (targetPrompt) {
                    targetPrompt.innerHTML = '<app-filter-prompt is-prompt="true" filter="vm.prompts[\'' + promptID + '\']" on-change="vm.promptChanged()"></app-filter-prompt>';
                }
            }
        }

        function repaintReports () {
            const filterCriteria = {};
            for (const promptID in vm.prompts) {
                filterCriteria[promptID] = vm.prompts[promptID].criterion;
            }

            vm.promptsFilters = JSON.parse(JSON.stringify(filterCriteria));

            if (!vm.mandatoryPrompts.length || reportsService.checkPrompts(vm.mandatoryPrompts)) {
                $scope.$broadcast('repaint', {
                    fetchData: true,
                    filters: filterCriteria
                });
            }
        }

        function downloadAsPDF () {
            const modal = $uibModal.open({
                component: 'appPdfExportSettingsModal',
            });
            vm.exportIsLoading = true;

            return modal.result.then(function (settings) {
                settings.filters = vm.promptsFilters;

                return api.getDashboardAsPDF(vm.dashboard._id, settings).then(res => {
                    download(res.data, 'application/pdf', vm.dashboard.dashboardName + '.pdf');
                }, () => {
                    notify.error(gettextCatalog.getString('The export failed. Please contact the system administrator.'));
                });
            }, () => {
            }).finally(() => {
                vm.exportIsLoading = false;
            });
        }

        function downloadAsPNG () {
            vm.exportIsLoading = true;
            const settings = {
                filters: vm.promptsFilters
            };
            api.getDashboardAsPNG(vm.dashboard._id, settings).then(res => {
                download(res.data, 'image/png', vm.dashboard.dashboardName + '.png');
            }, () => {
                notify.error(gettextCatalog.getString('The export failed. Please contact the system administrator.'));
            }).finally(() => {
                vm.exportIsLoading = false;
            });
        }

        function download (data, type, filename) {
            const a = document.createElement('a');
            a.download = filename;
            a.href = 'data:' + type + ';base64,' + data;
            a.dispatchEvent(new MouseEvent('click'));
        }
    }
})();
