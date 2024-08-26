(function () {
    'use strict';

    angular.module('app.report-edit')
        .controller('ReportEditController', ReportEditController)
        .component('appReportEdit', {
            templateUrl: 'partials/report-edit/report-edit.component.html',
            controller: ReportEditController,
            controllerAs: 'vm',
            bindings: {
                reportId: '@',
            },
        });

    ReportEditController.$inject = ['$scope', 'connection', 'reportsService', '$timeout', 'c3Charts', '$uibModal', 'reportModel', 'widgetsCommon', 'i18n', 'notify', 'api', 'base', 'userService', '$window'];
    function ReportEditController ($scope, connection, reportsService, $timeout, c3Charts, $uibModal, reportModel, widgetsCommon, i18n, notify, api, base, userService, $window) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.goBack = goBack;

        $scope.promptsBlock = 'partials/report-edit/report-edit.prompts-block.html';
        $scope.dropArea = 'partials/report-edit/report-edit.drop-area.html';
        $scope.reportNameModal = 'partials/report-edit/report-edit.report-name-modal.html';
        $scope.dashListModal = 'partials/report-edit/report-edit.dashboard-list-modal.html';
        $scope.filterPromptModal = 'partials/report-edit/report-edit.filter-prompt-modal.html';
        $scope.tabs = { selected: 'elements' };

        $scope.selectedReport = null;

        $scope.showSQL = false;

        $scope.rows = [];
        $scope.layers = [];
        $scope.mode = 'preview';
        $scope.isForDash = false;
        $scope.results = [];
        $scope.quitAfterSave = false;
        $scope.previewAfterSave = false;

        $scope.selectedRecordLimit = { value: 500 };

        $scope.rootItem = {};

        $scope.textAlign = widgetsCommon.textAlign;
        $scope.fontSizes = widgetsCommon.fontSizes;
        $scope.fontWeights = widgetsCommon.fontWeights;
        $scope.fontStyles = widgetsCommon.fontStyles;
        $scope.colors = widgetsCommon.colors;
        $scope.signalOptions = widgetsCommon.signalOptions;

        /*
        *   Initialisation
        */
        function $onInit () {
            userService.getCurrentUser().then(user => {
                $scope.user = user;
            });

            // FIXME There should be another way...
            if (/dashboards/.test(location.pathname)) {
                return;
            }
            return $scope.initLayers().then(function () {
                if (vm.reportId) {
                    return reportModel.getReportDefinition(vm.reportId, false).then(function (report) {
                        $scope.selectedReport = report;
                        $scope.initForm();
                        $scope.mode = 'edit';
                        return $scope.refresh();
                    });
                } else {
                    $scope.mode = 'new';
                    $scope.newForm();
                }
            });
        }

        function goBack () {
            $window.history.back();
        }

        $scope.$on('newReportForDash', function (event, args) {
            $scope.mode = 'add';
            $scope.isForDash = true;
            $scope.$broadcast('clearReport');

            $scope.initLayers().then(function () {
                $scope.newForm();
            });
        });

        $scope.$on('loadReportStrucutureForDash', function (event, args) {
            const report = args.report;

            $scope.selectedReport = report;
            $scope.mode = 'edit';
            $scope.isForDash = true;

            return $scope.initLayers().then(function () {
                $scope.initForm();
                $scope.$broadcast('repaint', {
                    fetchData: true,
                });
            });
        });

        $scope.initLayers = function () {
            return reportModel.getLayers().then(function (layers) {
                layers.sort(function (a, b) { return a.name.localeCompare(b.name); });

                $scope.rootItem = layers[0].rootItem;
                $scope.layers = layers;
            });
        };

        $scope.newForm = function () {
            $scope.selectedReport = {};

            $scope.selectedReport.draft = true;
            $scope.selectedReport.badgeStatus = 0;
            $scope.selectedReport.exportable = true;
            $scope.selectedReport.badgeMode = 1;

            $scope.selectedReport.selectedLayerID = $scope.layers[0]._id;

            $scope.selectedReport.properties = {};
            $scope.selectedReport.properties.xkeys = [];
            $scope.selectedReport.properties.ykeys = [];
            $scope.selectedReport.properties.columns = [];
            $scope.selectedReport.properties.order = [];
            $scope.selectedReport.properties.pivotKeys = {};
            $scope.selectedReport.properties.pivotKeys.columns = [];
            $scope.selectedReport.properties.pivotKeys.rows = [];
            $scope.selectedReport.properties.order = [];
            $scope.selectedReport.properties.filters = [];
            $scope.selectedReport.reportType = 'grid';

            $scope.selectedReport.properties.maxValue = 100;

            $scope.selectedReport.properties.height = 300;
            $scope.selectedReport.properties.range = '';

            $scope.selectedReport.properties.legendPosition = 'bottom';

            $scope.mode = 'add';
        };

        $scope.initForm = function () {
            $scope.mode = 'edit';
            $scope.cleanForm();
            const layer = $scope.layers.find(l => l._id === $scope.selectedReport.selectedLayerID);
            $scope.rootItem = layer.rootItem;
        };

        $scope.cleanForm = function () {
            const report = $scope.selectedReport;

            if (!report.properties) {
                notify.error(i18n.gettext('invalid report'));
                return;
            }

            if (!report.properties.xkeys) { report.properties.xkeys = []; }
            if (!report.properties.ykeys) { report.properties.ykeys = []; }
            if (!report.properties.columns) { report.properties.columns = []; }
            if (!report.properties.order) { report.properties.order = []; }
            if (!report.properties.filters) { report.properties.filters = []; }
            if (!report.properties.pivotKeys) { report.properties.pivotKeys = {}; }
            if (!report.properties.pivotKeys.columns) { report.properties.pivotKeys.columns = []; }
            if (!report.properties.pivotKeys.rows) { report.properties.pivotKeys.rows = []; }
            if (!report.properties.order) { report.properties.order = []; }
            if (!report.properties.range) { report.properties.range = ''; }
        };

        /*
        * Getters and setters
        */

        $scope.repaintWithPrompts = function () {
            const filterCriteria = {};
            for (const i in $scope.prompts) {
                filterCriteria[i] = $scope.prompts[i].criterion;
            }

            $scope.$broadcast('repaint', {
                fetchData: true,
                filters: filterCriteria
            });
        };

        $scope.getPrompts = function () {
            return $scope.prompts && Object.values($scope.prompts);
        };

        $scope.getSQLPanel = function () {
            $scope.showSQL = !$scope.showSQL;
        };

        $scope.removeItem = function (item, collection) {
            const id = collection.indexOf(item);
            collection.splice(id, 1);
        };

        $scope.saveReportStructure = function () {
            reportsService.storeReport($scope.selectedReport);
        };

        $scope.stringVariables = [
            { value: 'toUpper', label: i18n.gettext('To Upper') },
            { value: 'toLower', label: i18n.gettext('To Lower') }
        ];

        if (location.hash === 'intro') {
            $timeout(function () { $scope.showIntro(); }, 1000);
        }

        $scope.changeLayer = function (selectedLayerID) {
            $scope.selectedReport.selectedLayerID = selectedLayerID;
            const layer = $scope.layers.find(l => l._id === $scope.selectedReport.selectedLayerID);
            $scope.rootItem = layer.rootItem;
        };

        $scope.getReport = function (hashedID) {
            return $scope.selectedReport;
        };

        $scope.getReportColumnDefs = function (reportID) {
            return $scope.selectedReport.properties.columnDefs;
        };

        /*
        *   Modals and navigation buttons
        */

        $scope.saveReportAndStay = function () {
            $scope.quitAfterSave = false;
            if ($scope.mode === 'add') {
                $('#theReportNameModal').modal('show');
            } else {
                $scope.reportNameSave();
            }
        };

        $scope.saveReportAndQuit = function () {
            $scope.quitAfterSave = true;
            if ($scope.mode === 'add') {
                $('#theReportNameModal').modal('show');
            } else {
                $scope.reportNameSave();
            }
        };

        $scope.saveReportAndPreview = function () {
            $scope.previewAfterSave = true;
            if ($scope.mode === 'add') {
                $('#theReportNameModal').modal('show');
            } else {
                $scope.reportNameSave();
            }
        };

        $scope.reportNameSave = function () {
            return reportModel.saveAsReport($scope.selectedReport, $scope.mode).then(function (data) {
                $('#theReportNameModal').modal('hide');
                $('.modal-backdrop').hide();
                const reportId = $scope.mode === 'add' ? data.item._id : $scope.selectedReport._id;

                if ($scope.previewAfterSave) {
                    document.location.href = base + '/reports/view/' + reportId;
                }
                if ($scope.quitAfterSave) {
                    location.href = base + '/reports';
                }
                if (!$scope.previewAfterSave & !$scope.quitAfterSave && $scope.mode === 'add') {
                    location.href = base + '/reports/edit/' + reportId;
                }
            });
        };

        $scope.pushToDash = function () {
            const params = {};

            return connection.get('/api/dashboards/find-all', params).then(function (data) {
                $scope.dashboards = data;
                $('#dashListModal').modal('show');
            });
        };

        $scope.reportPushed2Dash = function (dashboardID) {
            $('modal-backdrop').visible = false;
            $('modal-backdrop').remove();
            $('#dashListModal').modal('hide');
            reportsService.storeReport($scope.selectedReport);

            if (dashboardID) {
                location.href = base + '/dashboards/edit/' + dashboardID;
            } else {
                location.href = base + '/dashboards/new';
            }
        };

        $scope.showFilterModal = function (filter) {
            $scope.selectedFilter = filter;
            $('#filterPromptsModal').modal('show');
        };

        $scope.confirmFilterModal = function () {
            $('#filterPromptsModal').modal('hide');
            $scope.selectedFilter.filterPrompt = !$scope.selectedFilter.filterPrompt;
        };

        /*
        *   Report edition
        */

        $scope.refresh = function () {
            const params = {
                limit: $scope.selectedRecordLimit.value
            };

            $scope.$broadcast('showLoadingMessage', i18n.gettext('Fetching data ...'));

            return api.getReportData($scope.selectedReport, params).then(function (result) {
                if (result.errorToken) {
                    $scope.errorToken = result.errorToken;
                }

                $scope.sql = result.sql;
                $scope.time = result.time;
                $scope.results = result.data;
                $scope.$broadcast('repaint', { fetchData: false, data: result.data });
            }).catch(err => {
                $scope.$broadcast('stopLoading');
                notify.error('Something went wrong, check the server logs');
                console.error(err);
            });
        };

        $scope.onDropOnFilter = function (ev) {
            const type = 'application/vnd.urungi.layer-element+json';
            const filter = JSON.parse(ev.dataTransfer.getData(type));
            filter.criterion = {
                text1: '',
                text2: '',
                textList: []
            };

            filter.filterType = 'equal';
            filter.filterPrompt = false;
            filter.layerID = $scope.selectedReport.selectedLayerID;
            filter.suggestions = {
                show: true,
                limit: 15,
                unlimited: false
            };

            $scope.onDropField($scope.selectedReport.properties.filters, filter, 'filter');
        };

        $scope.onDropField = function (elements, layerObject, role) {
            const element = Object.assign({}, layerObject);
            element.layerObject = layerObject;
            if (layerObject.defaultAggregation) {
                element.aggregation = layerObject.defaultAggregation;
            }
            element.id = reportsService.getColumnId(element);
            elements.push(element);

            $scope.sql = undefined;

            if (role === 'order') {
                element.sortType = 1;
            }
        };

        $scope.onRemoveFilter = function (filter) {
            $scope.onRemoveField($scope.selectedReport.properties.filters, filter, 'filter');
        };

        $scope.onRemoveField = function (elements, item, role) {
            const index = elements.indexOf(item);
            elements.splice(index, 1);

            $scope.sql = undefined;
        };

        $scope.toReportItem = function (ngModelItem) {
            let agg;

            if (ngModelItem.aggregation) {
                agg = ngModelItem.aggregation;
            }

            if (ngModelItem.defaultAggregation) {
                agg = ngModelItem.defaultAggregation;
            }

            return {
                elementName: ngModelItem.elementName,
                id: ngModelItem.id,
                elementLabel: ngModelItem.elementLabel,
                collectionID: ngModelItem.collectionID,
                elementID: ngModelItem.elementID,
                elementType: ngModelItem.elementType,
                layerID: $scope.selectedReport.selectedLayerID,
                filterType: 'equal',
                filterPrompt: false,
                format: ngModelItem.format,
                values: ngModelItem.values,
                isCustom: ngModelItem.isCustom,
                expression: ngModelItem.expression,
                viewExpression: ngModelItem.viewExpression,
                aggregation: agg
            };
        };

        $scope.autoChooseArea = function (item, chooseColumn) {
            let choice;

            switch ($scope.selectedReport.reportType) {
            case 'grid':
            case 'vertical-grid':
                choice = {
                    propertyBind: $scope.selectedReport.properties.columns,
                    role: 'column'
                };
                break;

            case 'pivot':
                if ($scope.selectedReport.properties.pivotKeys.rows.length === 0) {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.pivotKeys.rows,
                        role: 'column',
                        forbidAggregation: true
                    };
                } else {
                    if ($scope.selectedReport.properties.pivotKeys.columns.length === 0) {
                        choice = {
                            propertyBind: $scope.selectedReport.properties.pivotKeys.columns,
                            role: 'column',
                            forbidAggregation: true
                        };
                    } else {
                        choice = {
                            propertyBind: $scope.selectedReport.properties.ykeys,
                            role: 'column'
                        };
                    }
                }
                break;

            case 'chart-line':
            case 'chart-pie':
            case 'chart-donut':
                if ($scope.selectedReport.properties.xkeys.length === 0) {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.xkeys,
                        role: 'column'
                    };
                } else {
                    if ($scope.selectedReport.properties.ykeys.length === 0 || $scope.selectedReport.properties.order.length > 0 || chooseColumn) {
                        choice = {
                            propertyBind: $scope.selectedReport.properties.ykeys,
                            role: 'column'
                        };
                    } else {
                        choice = {
                            propertyBind: $scope.selectedReport.properties.order,
                            role: 'order'
                        };
                    }
                }
                break;

            case 'indicator':
            case 'gauge':
                choice = {
                    propertyBind: $scope.selectedReport.properties.ykeys,
                    role: 'column'
                };
                break;
            }

            return choice;
        };

        $scope.autoFill = function (layerObject) {
            const choice = $scope.autoChooseArea(layerObject);

            const found = choice.propertyBind.find(item => item.elementID === layerObject.elementID);
            if (!found) {
                $scope.onDropField(choice.propertyBind, layerObject, choice.role);
            }
        };

        $scope.onDragOver = function (event) {
            // ...
        };

        $scope.filterChanged = function (elementID, values) {
        };

        $scope.setHeight = function (element, height, correction) {
            height = (height === 'full') ? $(document).height() : height;

            if (correction) height = height + correction;

            $('#' + element).css('height', height);
        };

        $scope.changeReportType = function (newReportType) {
            const report = $scope.selectedReport;

            $scope.$broadcast('clearReport');

            const movedColumns = [];

            function moveContent (a, b) {
                b.push.apply(b, a.splice(0));
            }

            switch (newReportType) {
            case 'grid':
                report.reportType = 'grid';
                moveContent(report.properties.xkeys, movedColumns);
                moveContent(report.properties.ykeys, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                break;

            case 'vertical-grid':
                report.reportType = 'vertical-grid';
                moveContent(report.properties.xkeys, movedColumns);
                moveContent(report.properties.ykeys, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                break;

            case 'pivot':
                moveContent(report.properties.xkeys, movedColumns);
                moveContent(report.properties.columns, movedColumns);
                report.reportType = 'pivot';
                break;

            case 'chart-line':
                moveContent(report.properties.columns, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                report.reportType = 'chart-line';
                break;

            case 'chart-donut':
                moveContent(report.properties.columns, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                report.reportType = 'chart-donut';
                break;

            case 'indicator':
                moveContent(report.properties.columns, movedColumns);
                moveContent(report.properties.xkeys, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                report.reportType = 'indicator';
                break;

            case 'gauge':
                moveContent(report.properties.columns, movedColumns);
                moveContent(report.properties.xkeys, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                report.reportType = 'gauge';
                break;

            case 'pyramid':
                moveContent(report.properties.columns, movedColumns);
                moveContent(report.properties.xkeys, movedColumns);
                moveContent(report.properties.pivotKeys.columns, movedColumns);
                moveContent(report.properties.pivotKeys.rows, movedColumns);
                report.reportType = 'pyramid';
                break;

            default:
                notify.error(i18n.gettext('report type does not exist'));
                break;
            }

            // The columns in dropzones which become hidden are moved to new dropzones
            // This ensures that there are no hidden columns in the query, which results in strange behaviour
            for (const col of movedColumns) {
                const choice = $scope.autoChooseArea(col, true);
                choice.propertyBind.push(col);
                if (choice.forbidAggregation) {
                    delete col.aggregation;
                    col.id = reportsService.getColumnId(col);
                }
            }
        };

        $scope.isUsable = function (item) {
            const properties = $scope.selectedReport ? $scope.selectedReport.properties : null;
            if (properties) {
                const elementsInUse = properties.columns.concat(
                    properties.pivotKeys ? properties.pivotKeys.columns : [],
                    properties.pivotKeys ? properties.pivotKeys.rows : [],
                    properties.xkeys,
                    properties.ykeys,
                    properties.filters,
                    properties.order,
                );

                if (elementsInUse.length > 0) {
                    const firstElement = elementsInUse[0];

                    const layer = $scope.layers.find(l => l._id === $scope.selectedReport.selectedLayerID);
                    if (layer) {
                        const elements = flattenObjects(layer.objects);
                        const firstObject = elements.find(e => e.elementID === firstElement.elementID);
                        const itemObject = elements.find(e => e.elementID === item.elementID);
                        if (itemObject && firstObject && itemObject.component !== firstObject.component) {
                            return false;
                        }
                    }
                }
            }

            return true;
        };

        function flattenObjects (objects) {
            return objects.reduce((acc, val) => {
                return Array.isArray(val.elements) ? acc.concat(flattenObjects(val.elements)) : acc.concat(val);
            }, []);
        }

        $scope.chartColumnTypeOptions = c3Charts.chartColumnTypeOptions;

        $scope.chartSectorTypeOptions = c3Charts.chartSectorTypeOptions;

        $scope.changeChartSectorType = function (column, type) {
            if (type === 'pie') { $scope.selectedReport.reportType = 'chart-pie'; }
            if (type === 'donut') { $scope.selectedReport.reportType = 'chart-donut'; }
            $scope.$broadcast('repaint');
        };

        $scope.changeColumnColor = function (color) {
            if ($scope.selectedColumn.columnStyle) { $scope.selectedColumn.columnStyle.color = color; }
        };

        $scope.changeColumnBackgroundColor = function (color) {
            if ($scope.selectedColumn.columnStyle) { $scope.selectedColumn.columnStyle['background-color'] = color; }
        };

        $scope.setColumnFormat = function () {
            $scope.$broadcast('repaint');
        };

        $scope.saveToExcel = function (reportHash) {
            reportModel.saveToExcel($scope, reportHash);
        };

        $scope.setDatePatternFilterType = function (filter, option) {
            filter.searchValue = option.value;
            filter.filterText1 = option.value;
            filter.filterLabel1 = option.label;
        };

        $scope.onChangeElementProperties = function () {

        };

        $scope.previewAvailable = function () {
            const report = $scope.selectedReport;
            if (!report || !report.properties) {
                return false;
            }

            let available = false;
            switch (report.reportType) {
            case 'grid':
            case 'vertical-grid':
                available = report.properties.columns.length > 0;
                break;

            case 'pivot':
                available = report.properties.ykeys.length > 0 &&
                    report.properties.pivotKeys.columns.length > 0 &&
                    report.properties.pivotKeys.rows.length > 0;
                break;

            case 'chart-line':
            case 'chart-donut':
            case 'chart-pie':
                available = report.properties.xkeys.length > 0 &&
                    report.properties.ykeys.length > 0;
                break;

            case 'indicator':
            case 'gauge':
                available = report.properties.ykeys.length > 0;
                break;
            case 'pyramid':
                available = report.properties.xkeys.length > 0 && report.properties.ykeys.length > 0;
                break;
            }

            return available;
        };

        $scope.setSortType = function (field, type) {
            field.sortType = type;
        };

        $scope.chooseRecordLimit = function () {
            if ($scope.selectedRecordLimit.value > 0) {
                $scope.selectedReport.properties.recordLimit = $scope.selectedRecordLimit.value;
            }
        };

        $scope.forgetRecordLimit = function () {
            $scope.selectedRecordLimit.value = $scope.selectedReport.properties.recordLimit;
            delete $scope.selectedReport.properties.recordLimit;
        };

        $scope.hideErrorMessage = function () {
            $scope.selectedReport.hideErrorMessage = true;
        };

        $scope.showIntro = function () {
            $window.introJs().setOptions($scope.IntroOptions).start();
        };

        $scope.IntroOptions = {
            nextLabel: i18n.gettext('Next'),
            prevLabel: i18n.gettext('Back'),
            doneLabel: i18n.gettext('Done'),
            steps: [
                {
                    element: '#elementsTab',
                    title: i18n.gettext('The layer catalog'),
                    intro: '<p><strong>' +
                        i18n.gettext('Access here the different data elements of every layer that you have access on') +
                        '</strong></p><p>' +
                        i18n.gettext('Select elements and drag and drop them over the query design zone, depending if the element is going to be used as a column result (columns area), as a filter (filters area) or as an element to order by the results of the query (order by area)') +
                        '</p>',
                },
                {
                    element: '#selectLayer',
                    title: i18n.gettext('The layer selector'),
                    intro: '<p><strong>' +
                        i18n.gettext('Select here the layer where your query will be based on.') +
                        '</strong></p><p>' +
                        i18n.gettext('One query can only be based on one layer, you can not mix elements from different layers in the same query') +
                        '</p>',
                },
                {
                    element: '#reportType',
                    title: i18n.gettext('Report Type selector'),
                    intro: i18n.gettext('Click over one of the different report types to change the visualization of the data you choose'),
                },
                {
                    element: '#dropArea',
                    title: i18n.gettext('Results area'),
                    intro: i18n.gettext('As you define the query dragging and dropping in the areas above, the results of the query will appear here'),
                },
                {
                    element: '#queryRefresh',
                    title: i18n.gettext('Query refresh'),
                    intro: '<p><strong>' +
                        i18n.gettext('Use this button to refresh the results') +
                        '</strong></p><p>' +
                        i18n.gettext('After building your query, refresh to view the report.') +
                        '</p>',
                },
                {
                    element: '#columnsDropzone',
                    title: i18n.gettext('Columns / results drop zone'),
                    intro: '<p><strong>' +
                        i18n.gettext('Drop here the elements you want to have in the results of the query') +
                        '</strong></p><p>' +
                        i18n.gettext('A query must hold at least one element here to be executed') +
                        '</p>',
                },
                {
                    element: '#orderByDropzone',
                    title: i18n.gettext('Order By drop zone'),
                    intro: '<p><strong>' +
                        i18n.gettext('Drop here the elements that you want to use to order the results of the query') +
                        '</strong></p><p>' +
                        i18n.gettext('The elements you drop in here do not necessarily have to be in the columns/results area, a query can be ordered by elements that do not appear in the results') +
                        '</p>',
                },
                {
                    element: '#filtersDropzone',
                    title: i18n.gettext('Filters drop zone'),
                    intro: '<p><strong>' +
                        i18n.gettext('Drop here the elements that you want to use to filter the results of the query') +
                        '</strong></p><p>' +
                        i18n.gettext('The elements you drop in here do not necessarily have to be in the columns/results area, a query can be filtered by elements that do not appear in the results') +
                        '</p>',
                }
            ]
        };

        $scope.openReportSettingsModal = openReportSettingsModal;

        function openReportSettingsModal () {
            const modal = $uibModal.open({
                component: 'appReportSettingsModal',
                resolve: {
                    report: () => $scope.selectedReport,
                    isForDash: () => $scope.isForDash,
                },
            });

            modal.result.then(settings => {
                $scope.selectedReport.reportType = settings.reportType;
                $scope.selectedReport.properties.legendPosition = settings.legendPosition;
                $scope.selectedReport.properties.height = settings.height;
                $scope.selectedReport.properties.maxValue = settings.maxValue;
                $scope.selectedReport.theme = settings.theme;
                $scope.selectedReport.properties.range = settings.range;
            }, () => {});
        }
        $scope.isReportSettingsModalAvailable = isReportSettingsModalAvailable;

        function isReportSettingsModalAvailable () {
            // If not for a dashboard, there is at least the theme setting
            if (!$scope.isForDash) {
                return true;
            }

            const report = $scope.selectedReport;
            if (['chart-line', 'chart-pie', 'chart-donut'].includes(report.reportType)) {
                return true;
            }

            return false;
        }

        $scope.onElementDragStart = onElementDragStart;
        function onElementDragStart (ev, element) {
            const json = angular.toJson(element);

            ev.dataTransfer.effectAllowed = 'copy';
            ev.dataTransfer.setData('application/vnd.urungi.layer-element+json', json);
        }
    }
})();
