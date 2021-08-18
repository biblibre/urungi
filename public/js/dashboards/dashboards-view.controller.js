(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsViewController', DashboardsViewController);

    DashboardsViewController.$inject = ['$scope', '$timeout', '$compile', '$uibModal', 'Noty', 'gettextCatalog', 'api', 'userService', 'dashboard'];

    function DashboardsViewController ($scope, $timeout, $compile, $uibModal, Noty, gettextCatalog, api, userService, dashboard) {
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

        activate();

        function activate () {
            userService.getCurrentUser().then(user => {
                vm.isAdmin = user.isAdmin();
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

            $timeout(function () {
                let mandatoryCount = 0;
                for (const report of vm.dashboard.reports) {
                    if (report.properties.filters.length !== 0) {
                        for (const filter of report.properties.filters) {
                            if (filter.promptMandatory === true) {
                                ++mandatoryCount;
                            }
                        }
                    }
                }
                if (mandatoryCount === 0) {
                    repaintReports();
                }
            }, 0);
        }

        function initPrompts () {
            for (const report of vm.dashboard.reports) {
                for (const filter of report.properties.filters) {
                    if (filter.filterPrompt) {
                        const p = {};
                        for (const i in filter) {
                            p[i] = filter[i];
                        }
                        p.criterion = {};
                        p.promptID = p.id + p.filterType;
                        vm.prompts[p.promptID] = p;
                    }
                }
            }

            getPromptsWidget();
        };

        function getPromptsWidget () {
            for (const promptID in vm.prompts) {
                const targetPrompt = document.getElementById('PROMPT_' + promptID);

                if (targetPrompt) {
                    targetPrompt.outerHTML = getPromptHTML(promptID);
                }
            }
        }

        function repaintReports () {
            const filterCriteria = {};
            for (const promptID in vm.prompts) {
                filterCriteria[promptID] = vm.prompts[promptID].criterion;
            }

            $scope.$broadcast('repaint', {
                fetchData: true,
                filters: filterCriteria
            });
        }

        function getPromptHTML (promptID) {
            const html = '<div id="PROMPT_' + promptID + '" class="ndContainer" ndType="ndPrompt">' +
                '<app-filter-prompt is-prompt="true" filter="vm.prompts[\'' + promptID + '\']" on-change="vm.promptChanged()"></app-filter-prompt>' +
                '</div>';

            return html;
        }

        function downloadAsPDF () {
            const modal = $uibModal.open({
                component: 'appPdfExportSettingsModal',
            });

            return modal.result.then(function (settings) {
                return api.getDashboardAsPDF(vm.dashboard._id, settings).then(res => {
                    download(res.data, 'application/pdf', vm.dashboard.dashboardName + '.pdf');
                }, () => {
                    new Noty({ text: gettextCatalog.getString('The export failed. Please contact the system administrator.'), type: 'error' }).show();
                });
            }, () => {});
        }

        function downloadAsPNG () {
            api.getDashboardAsPNG(vm.dashboard._id).then(res => {
                download(res.data, 'image/png', vm.dashboard.dashboardName + '.png');
            }, () => {
                new Noty({ text: gettextCatalog.getString('The export failed. Please contact the system administrator.'), type: 'error' }).show();
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
