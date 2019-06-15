(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardsViewController', DashboardsViewController);

    DashboardsViewController.$inject = ['$scope', '$timeout', '$compile', 'dashboard'];

    function DashboardsViewController ($scope, $timeout, $compile, dashboard) {
        const vm = this;

        vm.mode = 'preview';
        vm.prompts = {};
        vm.dashboard = dashboard;
        vm.getReport = getReport;
        vm.promptChanged = promptChanged;
        vm.getQueryForFilter = getQueryForFilter;

        activate();

        function activate () {
            loadHTML();
        }

        function getReport (reportID) {
            return vm.dashboard.reports.find(r => r.id === reportID);
        }

        function promptChanged () {
            repaintReports();
        }

        function getQueryForFilter (filter) {
            const query = {
                layerID: filter.layerID,
                columns: [
                    {
                        id: 'f',
                        collectionID: filter.collectionID,
                        datasourceID: filter.datasourceID,
                        elementID: filter.elementID,
                        elementName: filter.elementName,
                        elementType: filter.elementType,
                        layerID: filter.layerID,
                    }
                ],
                order: [],
                filters: [],
            };

            return query;
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
                filterCriteria: filterCriteria
            });
        }

        function getPromptHTML (promptID) {
            const html = '<div id="PROMPT_' + promptID + '" class="ndContainer" ndType="ndPrompt">' +
                '<app-filter-prompt is-prompt="true" filter="vm.prompts[\'' + promptID + '\']" on-change="vm.promptChanged()" get-query="vm.getQueryForFilter"></app-filter-prompt>' +
                '</div>';

            return html;
        }
    }
})();
