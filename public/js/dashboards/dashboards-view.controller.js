(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsViewController', DashboardsViewController);

    DashboardsViewController.$inject = ['$scope', '$timeout', '$compile', 'Noty', 'gettextCatalog', 'api', 'userService', 'dashboard'];

    function DashboardsViewController ($scope, $timeout, $compile, Noty, gettextCatalog, api, userService, dashboard) {
        const vm = this;

        vm.downloadAsPDF = downloadAsPDF;
        vm.downloadAsPNG = downloadAsPNG;
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
                var mandatoryCount = 0;
                for (var report of vm.dashboard.reports) {
                    if (report.properties.filters.length !== 0) {
                        for (var filter of report.properties.filters) {
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
            for (var report of vm.dashboard.reports) {
                for (var filter of report.properties.filters) {
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
            api.getDashboardAsPDF(vm.dashboard._id).then(res => {
                download(res.data, 'application/pdf', vm.dashboard.dashboardName + '.pdf');
            }, () => {
                new Noty({ text: gettextCatalog.getString('The export failed. Please contact the system administrator.'), type: 'error' }).show();
            });
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
