(function () {
    'use strict';

    angular.module('app.dashboards').controller('DashboardEditController', DashboardEditController);

    DashboardEditController.$inject = ['$scope', '$location', '$q', '$compile', 'reportsService', 'connection', '$routeParams', 'reportModel', 'uuid', 'htmlWidgets', 'gettextCatalog', '$uibModal', 'Noty', '$rootScope'];

    function DashboardEditController ($scope, $location, $q, $compile, reportsService, connection, $routeParams, reportModel, uuid, htmlWidgets, gettextCatalog, $uibModal, Noty, $rootScope) {
        const vm = this;

        vm.onDrop = onDrop;
        vm.onFilterPromptDragStart = onFilterPromptDragStart;
        vm.onLayoutDragStart = onLayoutDragStart;
        vm.onReportDragStart = onReportDragStart;

        $scope.reportModal = 'partials/report/edit.html';
        $scope.settingsTemplate = 'partials/widgets/inspector.html';
        $scope.filterWidget = 'partials/report/filterWidget.html';
        $scope.promptModal = 'partials/widgets/promptModal.html';

        $scope.selectedDashboard = { reports: [], containers: [], prompts: [] };
        $scope.lastElementID = 0;
        $scope.dataPool = [];

        $scope.hiddenXS = false;
        $scope.hiddenSM = false;
        $scope.hiddenMD = false;
        $scope.hiddenLG = false;
        $scope.hiddenPrint = false;
        $scope.canMoveSelectedElement = false;
        // $scope.imageFilters = [];
        // $scope.imageFilters.opacity = 10;
        $scope.theData = [];
        $scope.mode = 'preview';

        $scope.textAlign = [
            { name: 'left', value: 'left' },
            { name: 'right', value: 'right' },
            { name: 'center', value: 'center' }
        ];

        $scope.fontSizes = [
            { name: '8px', value: '8px' },
            { name: '9px', value: '9px' },
            { name: '10px', value: '10px' },
            { name: '11px', value: '11px' },
            { name: '12px', value: '12px' },
            { name: '13px', value: '13px' },
            { name: '14px', value: '14px' },
            { name: '15px', value: '15px' },
            { name: '16px', value: '16px' },
            { name: '17px', value: '17px' },
            { name: '18px', value: '18px' },
            { name: '19px', value: '19px' },
            { name: '20px', value: '20px' }
        ];

        $scope.fontWeights = [
            { name: 'normal', value: 'normal' },
            { name: 'bold', value: 'bold' },
            { name: 'bolder', value: 'bolder' },
            { name: 'lighter', value: 'lighter' }
        ];

        $scope.fontStyles = [
            { name: 'normal', value: 'normal' },
            { name: 'italic', value: 'italic' },
            { name: 'oblique', value: 'oblique' }
        ];

        $scope.newReport = function () {
            $scope.reportInterface = true;
            $scope.editingReport = null;
            $scope.$broadcast('newReportForDash', {});
        };

        $scope.Redraw = function () {
            repaintReports();
        };

        $scope.importReport = function () {
            const modal = $uibModal.open({
                component: 'appReportsImportModal',
            });
            modal.result.then(reportID => {
                reportModel.getReportDefinition(reportID).then(function (report) {
                    if (report) {
                        report.id = report._id;
                        $scope.selectedDashboard.reports.push(report);
                    } else {
                        new Noty({ text: gettextCatalog.getString('Error : failed to import report'), type: 'error' }).show();
                    }
                });
            });
        };

        $scope.$on('cancelReport', function (event, args) {
            $scope.reportInterface = false;
        });

        $scope.initForm = function () {
            if (/new/.test($location.path())) {
                $scope.mode = 'add';
            }

            if (/edit/.test($location.path())) {
                $scope.dashboardID = $routeParams.dashboardID;
                $scope.mode = 'edit';
            }

            if (/push/.test($location.path())) {
                $scope.dashboardID = $routeParams.dashboardID;
                if ($scope.dashboardID === 'new') {
                    $scope.mode = 'add';
                } else {
                    $scope.mode = 'edit';
                }
            }

            if ($scope.mode === 'add') {
                $scope.dashboardID = uuid.v4();
                $scope.selectedDashboard = {
                    dashboardName: gettextCatalog.getString('New Dashboard'),
                    backgroundColor: '#999999',
                    reports: [],
                    items: [],
                    properties: {},
                    dashboardType: 'DEFAULT'
                };

                if (/push/.test($location.path())) {
                    const pushedReport = reportsService.getStoredReport();
                    pushedReport.reportName = 'report_' + ($scope.selectedDashboard.reports.length + 1);
                    pushedReport.id = uuid.v4();
                    $scope.selectedDashboard.reports.push(pushedReport);
                }
            };

            if ($scope.mode === 'edit') {
                $scope.selectedDashboardLimit = { value: 500 };

                if (!$scope.dashboardID) {
                    new Noty({ text: gettextCatalog.getString('Could not load dashboard : missing id'), type: 'error' }).show();
                }

                return connection.get('/api/dashboards/get/' + $scope.dashboardID, { id: $scope.dashboardID }).then(function (data) {
                    $scope.selectedDashboard = data.item;

                    if (/push/.test($location.path())) {
                        const pushedReport = reportsService.getStoredReport();
                        pushedReport.reportName = 'report_' + ($scope.selectedDashboard.reports.length + 1);
                        pushedReport.id = uuid.v4();
                        $scope.selectedDashboard.reports.push(pushedReport);
                    }

                    // getAllPageColumns();

                    const $div = $($scope.selectedDashboard.properties.designerHTML);
                    const designArea = document.getElementById('designArea');
                    const el = angular.element(designArea);
                    el.append($div);
                    if ($scope.selectedDashboard.properties.rootStyle) {
                        el.attr('style', $scope.selectedDashboard.properties.rootStyle);
                    }

                    $compile($div)($scope);

                    cleanAllSelected();

                    $scope.initPrompts();

                    repaintReports();
                });
            }
        };

        $scope.cancelReport = function (report) {
            $scope.reportInterface = false;
        };

        $scope.saveReport4Dashboard = function (isMode) {
            // first clean the results area for not to create a conflict with other elements with same ID
            const el = document.getElementById('reportLayout');
            angular.element(el).empty();

            const qstructure = reportsService.getStoredReport();

            if ($scope.editingReport == null) {
                qstructure.reportName = 'report_' + ($scope.selectedDashboard.reports.length + 1);
                qstructure.id = uuid.v4();
                $scope.selectedDashboard.reports.push(qstructure);
            } else {
                const updatedReport = angular.copy(qstructure);
                $scope.selectedDashboard.reports.splice($scope.editingReportIndex, 1, updatedReport);
                // reportModel.getReport(updatedReport, 'REPORT_' + qstructure.id, $scope.mode, function (sql) {});
            }
            $scope.reportInterface = false;
            // getAllPageColumns();
            $scope.initPrompts();
        };

        let reportBackup;
        $scope.loadReport = function (report) {
            $scope.reportInterface = true;
            $scope.editingReport = report.id;
            reportBackup = angular.copy(report);
            for (const i in $scope.selectedDashboard.reports) {
                if ($scope.selectedDashboard.reports[i].id === report.id) {
                    // $scope.selectedDashboard.reports.splice(i,1);
                    $scope.editingReportIndex = i;
                }
            }
            $scope.$broadcast('loadReportStrucutureForDash', { report: reportBackup });
        };

        function getLayoutHtml (type) {
            switch (type) {
            case 'jumbotron':
                return htmlWidgets.getJumbotronHTML();

            case '4colscta':
                return htmlWidgets.get4colsctaHTML();

            case '3colscta':
                return htmlWidgets.get3colsctaHTML();

            case '2colscta':
                return htmlWidgets.get2colsctaHTML();

            case 'divider':
                return htmlWidgets.getDivider();

            case 'imageTextLarge':
                return htmlWidgets.getImageTextLargeHTML();

            case 'textImageLarge':
                return htmlWidgets.getTextImageLargeHTML();

            case 'image':
                return '<app-dashboard-image size="700" page-block ndtype="image"></app-dashboard-image>';

            case 'video':
                return htmlWidgets.getVideo();

            case 'paragraph':
                return htmlWidgets.getParagraph();

            case 'heading':
                return htmlWidgets.getHeading();

            case 'pageHeader':
                return htmlWidgets.getPageHeader();
            }
        }

        function onReportDragStart (ev, report) {
            const html = reportModel.getReportContainerHTML(report.id);
            const json = angular.toJson(report);

            ev.dataTransfer.setData('text/html', html);
            ev.dataTransfer.setData('application/vnd.urungi.report+json', json);
        };

        function onFilterPromptDragStart (ev, filterPrompt) {
            const html = getPromptHTML(filterPrompt);
            const json = angular.toJson(filterPrompt);

            ev.dataTransfer.setData('text/html', html);
            ev.dataTransfer.setData('application/vnd.urungi.filter-prompt+json', json);
        };

        function onLayoutDragStart (ev, type) {
            const html = getLayoutHtml(type);

            ev.dataTransfer.setData('text/html', html);
        };

        $scope.promptChanged = function (elementID, values) {
            repaintReports();
        };

        function repaintReports () {
            const filterCriteria = {};
            for (const i in $scope.prompts) {
                filterCriteria[i] = $scope.prompts[i].criterion;
            }

            $scope.$broadcast('repaint', {
                fetchData: true,
                filters: filterCriteria,
                limit: $scope.selectedDashboardLimit.value
            });
        }

        $scope.onChangeElementProperties = function () {

        };

        $scope.overChartDragging = function () {

        };

        $scope.getRuntimeReport = function (reportID) {
            if ($scope.mode !== 'preview') {
                // for (var i in $scope.selectedDashboard.reports) {
                //     if ($scope.selectedDashboard.reports[i].id === reportID) {
                //         reportModel.getReport($scope.selectedDashboard.reports[i], 'REPORT_CONTAINER_' + reportID, $scope.mode, function (sql) {
                //         });
                //     }
                // }
                repaintReports();
            }
        };

        $scope.elementDblClick = function (theElement) {
        };

        $scope.dashboardName = function () {
            if ($scope.mode === 'add') {
                $('#dashboardNameModal').modal('show');
            } else {
                saveDashboard();
            }
        };

        $scope.dashboardNameSave = function () {
            $('#dashboardNameModal').modal('hide');
            $('.modal-backdrop').hide();
            saveDashboard().then(function () {
                $scope.goBack();
            });
        };

        function cleanAll (theContainer) {
            const root = document.getElementById(theContainer);

            if (typeof root !== 'undefined') {
                cleanElement(root);
            }
        }

        function cleanElement (theElement) {
            for (let i = 0, len = theElement.childNodes.length; i < len; ++i) {
                $(theElement.childNodes[i]).removeAttr('page-block');
                $(theElement.childNodes[i]).removeAttr('contenteditable');
                $(theElement.childNodes[i]).removeAttr('drop');
                $(theElement.childNodes[i]).removeAttr('drop-effect');
                $(theElement.childNodes[i]).removeAttr('drop-accept');
                $(theElement.childNodes[i]).removeClass('editable');
                $(theElement.childNodes[i]).removeClass('selected');

                if (theElement.childNodes[i].hasChildNodes()) { cleanElement(theElement.childNodes[i]); }
            }
        }

        function cleanAllSelected () {
            const root = document.getElementById('designArea');

            if (typeof root !== 'undefined') {
                cleanSelectedElement(root);
            }
        }

        function cleanSelectedElement (theElement) {
            for (let i = 0, len = theElement.childNodes.length; i < len; ++i) {
                $(theElement.childNodes[i]).removeClass('selected');
                if (theElement.childNodes[i].hasChildNodes()) { cleanSelectedElement(theElement.childNodes[i]); }
            }
        }

        function saveDashboard () {
            // Put all reports in loading mode...

            cleanAllSelected();

            const dashboard = $scope.selectedDashboard;

            const container = $('#designArea');

            clearPrompts();

            let theHTML = container.html();

            theHTML = theHTML.replace('vs-repeat', ' ');

            $scope.selectedDashboard.properties.designerHTML = theHTML;
            $scope.selectedDashboard.properties.rootStyle = container.attr('style');

            const previewContainer = $('#previewContainer');

            $('#previewContainer').children().remove();

            const $div = $(theHTML);
            previewContainer.append($div);
            $compile($div)($scope);

            cleanAll('previewContainer');

            $scope.selectedDashboard.html = previewContainer.html();

            if ($scope.mode === 'add') {
                return connection.post('/api/dashboards/create', dashboard).then(function () {
                    $rootScope.$broadcast('counts-changes');
                });
            } else {
                return connection.post('/api/dashboards/update/' + dashboard._id, dashboard);
            }
        }

        $scope.getReport = function (reportID) {
            return $scope.selectedDashboard.reports.find(r => (r.id === reportID));
        };

        $scope.deleteReport = function (reportID, reportName) {
            for (const i in $scope.selectedDashboard.reports) {
                if ($scope.selectedDashboard.reports[i].id === reportID) {
                    $scope.selectedDashboard.reports.splice(i, 1);

                    $('#REPORT_' + reportID).remove();
                }
            }
        };

        $scope.editReport = function (reportID, reportName) {

        };

        $scope.initPrompts = function () {
            $scope.prompts = {};

            for (const report of $scope.selectedDashboard.reports) {
                for (const filter of report.properties.filters) {
                    if (filter.filterPrompt) {
                        const prompt = {};
                        for (const i in filter) {
                            prompt[i] = filter[i];
                        }
                        prompt.criterion = {};
                        $scope.prompts[prompt.id + prompt.filterType] = prompt;
                    }
                }
            }

            getPromptsWidget();
        };

        function clearPrompts () {
            for (const i in $scope.prompts) {
                for (const c in $scope.prompts[i].criterion) {
                    $scope.prompts[i].criterion[c] = undefined;
                }
            }
        }

        $scope.getPrompts = function () {
            return $scope.prompts && Object.values($scope.prompts);
        };

        function getPromptsWidget () {
            for (const p in $scope.prompts) {
                const thePrompt = $scope.prompts[p];

                thePrompt.promptID = p;
                let targetPrompt = document.getElementById('PROMPT_' + thePrompt.promptID);

                if (targetPrompt) {
                    const html = getPromptHTML(thePrompt);
                    $(targetPrompt).replaceWith(html);
                    targetPrompt = document.getElementById('PROMPT_' + thePrompt.promptID);
                    if ($scope.mode === 'preview') {
                        targetPrompt.removeAttribute('page-block');
                    }

                    const el = angular.element(targetPrompt);
                    $compile(el)($scope);
                }
            }
        }

        $scope.getReportColumnDefs = function (reportID) {
            for (const i in $scope.selectedDashboard.reports) {
                if ($scope.selectedDashboard.reports[i].id === reportID) {
                    return $scope.selectedDashboard.reports[i].properties.columnDefs;
                }
            }
        };

        $scope.$on('element.reselected', function (e, node) {
            $scope.tabs.selected = 'settings';
        });

        function getPromptHTML (prompt) {
            const html = '<div id="PROMPT_' + prompt.promptID + '" page-block class="ndContainer" ndType="ndPrompt"><app-filter-prompt is-prompt="true" filter="prompts[\'' + prompt.promptID + '\']" on-change="promptChanged()"></app-filter-prompt></div>';

            return html;
        }

        $scope.getColumnDescription = getColumnDescription;
        function getColumnDescription (column) {
            return reportsService.getColumnDescription(column);
        }

        function onDrop (ev, dropTarget) {
            const html = ev.dataTransfer.getData('text/html');
            const element = $compile(html)($scope);
            dropTarget.appendChild(element[0]);

            // FIXME Repaint only the added report, either by creating a child
            // scope and broadcasting the 'repaint' event on it, or by
            // rewriting the reportView directive so that it can paint itself
            // immediately after insertion
            if (ev.dataTransfer.types.includes('application/vnd.urungi.report+json')) {
                repaintReports();
            }
        }
    }
})();
