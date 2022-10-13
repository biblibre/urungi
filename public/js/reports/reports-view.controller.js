(function () {
    'use strict';

    angular.module('app.reports').controller('ReportsViewController', ReportsViewController);

    ReportsViewController.$inject = ['$scope', '$timeout', '$uibModal', '$location', 'notify', 'gettextCatalog', 'api', 'xlsxService', 'userService', 'report', 'reportsService'];

    function ReportsViewController ($scope, $timeout, $uibModal, $location, notify, gettextCatalog, api, xlsxService, userService, report, reportsService) {
        const vm = this;

        vm.downloadAsPDF = downloadAsPDF;
        vm.downloadAsPNG = downloadAsPNG;
        vm.exportAsPNGAvailable = false;
        vm.exportAsPDFAvailable = false;
        vm.report = report;
        vm.prompts = {};
        vm.getPrompts = getPrompts;
        vm.repaintWithPrompts = repaintWithPrompts;
        vm.saveAsXLSX = saveAsXLSX;
        vm.isAdmin = false;
        vm.exportIsLoading = false;
        vm.promptsFilters = {};
        vm.mandatoryPrompts = [];

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
                vm.creationAuthorised = user.reportsCreate;
            }, () => {});
            api.isReportAsPNGAvailable(report._id).then(available => {
                vm.exportAsPNGAvailable = available;
            });
            api.isReportAsPDFAvailable(report._id).then(available => {
                vm.exportAsPDFAvailable = available;
            });

            vm.prompts = initPrompts();

            vm.mandatoryPrompts = Object.values(vm.prompts).filter(p => p.promptMandatory);

            if (!vm.mandatoryPrompts.length || reportsService.checkPrompts(vm.mandatoryPrompts)) {
                $timeout(function () {
                    repaintWithPrompts();
                }, 0);
            }
        }

        function initPrompts () {
            const prompts = {};
            const search = $location.search();
            const filters = JSON.parse(search.filters || '{}');
            for (const filter of vm.report.properties.filters) {
                if (filter.filterPrompt) {
                    const p = {};
                    for (const key in filter) {
                        p[key] = filter[key];
                    }
                    const ident = p.id + p.filterType;
                    if (ident in filters) {
                        p.criterion = filters[ident];
                    } else {
                        p.criterion = {};
                    }
                    prompts[ident] = p;
                }
            }

            return prompts;
        }

        function getPrompts () {
            return Object.values(vm.prompts);
        }

        function repaintWithPrompts () {
            const filterCriteria = {};
            for (const i in vm.prompts) {
                filterCriteria[i] = vm.prompts[i].criterion;
            }
            vm.promptsFilters = JSON.parse(JSON.stringify(filterCriteria));

            if (!vm.mandatoryPrompts.length || reportsService.checkPrompts(vm.mandatoryPrompts)) {
                $scope.$broadcast('repaint', {
                    fetchData: true,
                    filters: filterCriteria
                });
            }
        }

        function saveAsXLSX () {
            vm.exportIsLoading = true;
            const filterCriteria = {};
            for (const i in vm.prompts) {
                const criterion = vm.prompts[i].criterion;
                if (Object.keys(criterion).length !== 0) {
                    filterCriteria[i] = criterion;
                }
            }
            api.getReportData(vm.report, { filters: filterCriteria }).then(function (res) {
                xlsxService.saveReportAsXLSX(vm.report, res.data);
                vm.exportIsLoading = false;
            });
        }

        function downloadAsPDF () {
            const modal = $uibModal.open({
                component: 'appPdfExportSettingsModal',
            });
            vm.exportIsLoading = true;

            return modal.result.then(function (settings) {
                settings.filters = vm.promptsFilters;
                return api.getReportAsPDF(vm.report._id, settings).then(res => {
                    download(res.data, 'application/pdf', vm.report.reportName + '.pdf');
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
            api.getReportAsPNG(vm.report._id, settings).then(res => {
                download(res.data, 'image/png', vm.report.reportName + '.png');
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
