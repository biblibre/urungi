angular.module('app').controller('reportCtrl', function ($scope, connection, $compile, reportService, $routeParams, $timeout, $rootScope, bsLoadingOverlayService, c3Charts,
    reportModel, widgetsCommon, $location, gettextCatalog, usersModel, $q) {
    usersModel.getUserObjects().then(userObjects => {
        $scope.userObjects = userObjects;
    });

    $scope.promptsBlock = 'partials/report/partials/promptsBlock.html';
    $scope.dateModal = 'partials/report/modals/dateModal.html';
    $scope.linkModal = 'partials/report/modals/linkModal.html';
    $scope.repeaterTemplate = 'partials/report/partials/repeater.html';
    $scope.publishModal = 'partials/report/modals/publishModal.html';
    $scope.dropArea = 'partials/report/partials/drop-area.html';
    $scope.reportNameModal = 'partials/report/modals/reportNameModal.html';
    $scope.dashListModal = 'partials/report/modals/dashboardListModal.html';
    $scope.filterPromptModal = 'partials/report/modals/filter-prompt-modal.html';
    $scope.tabs = {selected: 'elements'};

    $scope.selectedReport = {};

    $scope.duplicateOptions = {};
    $scope.duplicateOptions.freeze = false;
    $scope.duplicateOptions.header = 'Duplicate report';

    $scope.gettingData = false;
    $scope.showSQL = false;

    $scope.rows = [];
    $scope.selectedReport.selectedLayerID = undefined;
    $scope.layers = [];
    $scope.mode = 'preview';
    $scope.isForDash = false;

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

    $scope.initReportList = function () {
        $scope.navigation.page = 1;

        return $scope.getReports().then(function () {
            $scope.mode = 'list';
        });
    };

    $scope.initReportView = function () {
        return reportModel.getReportDefinition($routeParams.reportID, false).then(function (report) {
            $scope.selectedReport = report;
            return $scope.initLayers().then(function () {
                $scope.initForm();
                $scope.initPrompts();
                $scope.repaintWithPrompts();
                $scope.mode = 'view';
            });
        });
    };

    $scope.initReportEdit = function () {
        // FIXME There should be another way...
        if (/dashboards/.test($location.path())) {
            return;
        }

        $scope.showOverlay('OVERLAY_reportLayout');

        return $scope.initLayers().then(function () {
            if (/reports\/new/.test($location.path())) {
                $scope.mode = 'new';
                $scope.newForm();
            } else if (/explore/.test($location.path())) {
                $scope.mode = 'explore';
                $scope.newForm();
            } else {
                return reportModel.getReportDefinition($routeParams.reportID, false).then(function (report) {
                    $scope.selectedReport = report;
                    $scope.initForm();
                    $scope.mode = 'edit';
                    $scope.hideOverlay('OVERLAY_reportLayout');
                    return $scope.refresh();
                });
            }

            $scope.hideOverlay('OVERLAY_reportLayout');

            return $scope.refresh();
        });
    };

    $scope.$on('newReportForDash', function (event, args) {
        $scope.mode = 'add';
        $scope.isForDash = true;

        $scope.initLayers().then($scope.newForm);
    });

    $scope.$on('loadReportStrucutureForDash', function (event, args) {
        var report = args.report;

        $scope.selectedReport = report;
        $scope.mode = 'edit';
        $scope.isForDash = true;

        return $scope.initLayers().then(function () {
            $scope.initForm();
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

        $scope.selectedReport.properties.backgroundColor = '#FFFFFF';
        $scope.selectedReport.properties.height = 300;
        $scope.selectedReport.properties.headerHeight = 60;
        $scope.selectedReport.properties.rowHeight = 35;
        $scope.selectedReport.properties.headerBackgroundColor = '#FFFFFF';
        $scope.selectedReport.properties.headerBottomLineWidth = 4;
        $scope.selectedReport.properties.headerBottomLineColor = '#999999';
        $scope.selectedReport.properties.rowBorderColor = '#CCCCCC';
        $scope.selectedReport.properties.rowBottomLineWidth = 2;
        $scope.selectedReport.properties.columnLineWidht = 0;

        $scope.selectedReport.properties.legendPosition = 'bottom';

        $scope.selectedReport.reportType = 'grid';
        $scope.mode = 'add';
    };

    $scope.initForm = function () {
        $scope.mode = 'edit';
        $scope.cleanForm();
        var layer = $scope.layers.find(l => l._id === $scope.selectedReport.selectedLayerID);
        $scope.rootItem = layer.rootItem;
    };

    $scope.cleanForm = function () {
        const report = $scope.selectedReport;

        if (!report.properties) {
            noty({text: 'invalid report', timeout: 2000, type: 'error'});
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
    };

    $scope.initPrompts = function () {
        $scope.prompts = {};

        for (var filter of $scope.selectedReport.properties.filters) {
            if (filter.filterPrompt) {
                var prompt = {};
                for (const i in filter) {
                    prompt[i] = filter[i];
                }
                prompt.criterion = {};
                $scope.prompts[prompt.id + prompt.filterType] = prompt;
            }
        }
    };

    /*
    * Getters and setters
    */

    $scope.repaintWithPrompts = function () {
        var filterCriteria = {};
        for (const i in $scope.prompts) {
            filterCriteria[i] = $scope.prompts[i].criterion;
        }

        $scope.$broadcast('repaint', {
            fetchData: true,
            filterCriteria: filterCriteria
        });
    };

    $scope.getPrompts = function () {
        return $scope.prompts && Object.values($scope.prompts);
    };

    $scope.getSQLPanel = function () {
        $scope.showSQL = !$scope.showSQL;
    };

    $scope.removeItem = function (item, collection) {
        var id = collection.indexOf(item);
        collection.splice(id, 1);
    };

    $scope.showOverlay = function (referenceId) {
        bsLoadingOverlayService.start({
            referenceId: referenceId
        });
    };

    $scope.hideOverlay = function (referenceId) {
        bsLoadingOverlayService.stop({
            referenceId: referenceId
        });
    };

    $scope.saveReportStructure = function () {
        reportService.addReport($scope.selectedReport);
    };

    $scope.stringVariables = [
        {value: 'toUpper', label: 'To Upper'},
        {value: 'toLower', label: 'To Lower'}
    ];

    if ($routeParams.extra === 'intro') {
        $timeout(function () { $scope.showIntro(); }, 1000);
    }

    $scope.duplicateOptions.duplicate = $scope.duplicateReport;

    $scope.changeLayer = function (selectedLayerID) {
        $scope.selectedReport.selectedLayerID = selectedLayerID;
        if ($scope.selectedReport.query) {
            $scope.selectedReport.query.selectedLayerID = selectedLayerID;
        }
        var layer = $scope.layers.find(l => l._id === $scope.selectedReport.selectedLayerID);
        $scope.rootItem = layer.rootItem;
    };

    $scope.getQuery = function () {
        return $scope.selectedReport.query;
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

    $scope.reportName = function () {
        if ($scope.mode === 'add') {
            $('#theReportNameModal').modal('show');
        } else {
            $scope.reportNameSave();
        }
    };

    $scope.reportNameSave = function () {
        $scope.selectedReport.query = $scope.generateQuery();

        if (['chart-line', 'chart-donut', 'chart-pie', 'gauge'].indexOf($scope.selectedReport.reportType) >= 0) {
            reportModel.initChart($scope.selectedReport);
        }

        return reportModel.saveAsReport($scope.selectedReport, $scope.mode).then(function () {
            $('#theReportNameModal').modal('hide');
            $('.modal-backdrop').hide();
            $scope.goBack();
        });
    };

    $scope.pushToDash = function () {
        var params = {};

        return connection.get('/api/dashboardsv2/find-all', params).then(function (data) {
            $scope.dashboards = data;
            $('#dashListModal').modal('show');
        });
    };

    $scope.reportPushed2Dash = function (dashboardID) {
        $('modal-backdrop').visible = false;
        $('modal-backdrop').remove();
        $('#dashListModal').modal('hide');
        reportService.addReport($scope.selectedReport);

        console.log('/dashboards/push/' + dashboardID);

        $location.path('/dashboards/push/' + dashboardID);
    };

    $scope.publishReport = function () {
        $scope.objectToPublish = $scope.selectedReport;
        $('#publishModal').modal('show');
    };

    $scope.unPublish = function () {
        return connection.post('/api/reports/unpublish', {_id: $scope.selectedReport._id}).then(function () {
            $scope.selectedReport.isPublic = false;
            $('#publishModal').modal('hide');
        });
    };

    $scope.selectThisFolder = function (folderID) {
        const url = '/api/reports/publish-report';
        const params = {_id: $scope.selectedReport._id, parentFolder: folderID};

        return connection.post(url, params).then(function () {
            $scope.selectedReport.parentFolder = folderID;
            $scope.selectedReport.isPublic = true;
            $('#publishModal').modal('hide');
        });
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
        $scope.selectedReport.query = $scope.generateQuery();

        if (['chart-line', 'chart-donut', 'chart-pie', 'gauge'].indexOf($scope.selectedReport.reportType) >= 0) {
            reportModel.initChart($scope.selectedReport);
        }

        const params = {
            mode: $scope.mode,
            selectedRecordLimit: $scope.selectedRecordLimit.value
        };

        $scope.$broadcast('updateFilters');
        $scope.$broadcast('showLoadingMessage', 'Fetching data ...');

        return reportModel.fetchData($scope.selectedReport.query, params).then(function (result) {
            if (result.errorToken) {
                $scope.errorToken = result.errorToken;
            }

            $scope.sql = result.sql;
            $scope.time = result.time;

            $scope.$broadcast('repaint', { fetchData: false });
        });
    };

    $scope.generateQuery = function () {
        var query = {};

        query.columns = [];
        const prop = $scope.selectedReport.properties;
        for (const columnList of [
            prop.columns,
            prop.xkeys,
            prop.ykeys,
            prop.pivotKeys.columns,
            prop.pivotKeys.rows
        ]) {
            for (const c of columnList) {
                query.columns.push(c);
            }
        }

        query.order = [];
        for (const o of prop.order) {
            query.order.push(o);
        }

        query.filters = [];
        for (const f of prop.filters) {
            query.filters.push(f);
        }

        if ($scope.selectedReport.reportType === 'pivot') {
            for (const c of prop.ykeys) {
                query.columns.push(countColumn(c));
            }
        }

        function countColumn (col) {
            return {
                aggregation: 'count',
                collectionID: col.collectionID,
                datasourceID: col.datasourceID,
                elementID: col.elementID,
                elementLabel: col.elementLabel,
                elementName: col.elementName,
                elementType: col.elementType,
                filterPrompt: false,
                id: col.id + 'ptc',
                layerID: col.layerID,
                objectLabel: col.objectLabel + ' count'
            };
        }

        if (prop.recordLimit) {
            query.recordLimit = prop.recordLimit;
        }

        query.layerID = $scope.selectedReport.selectedLayerID;

        return query;
    };

    $scope.getQueryForFilter = function (filter) {
        const query = $scope.generateQuery();

        query.filters = query.filters.filter(f => f !== filter);

        var newColumn = {
            id: 'f',
            collectionID: filter.collectionID,
            datasourceID: filter.datasourceID,
            elementID: filter.elementID,
            elementName: filter.elementName,
            elementType: filter.elementType,
            layerID: filter.layerID
        };

        query.columns.push(newColumn);

        return query;
    };

    $scope.onDropOnFilter = function (data, event, type, group) {
        var item = data['json/custom-object'];
        event.stopPropagation();
        item.criterion = {
            text1: '',
            text2: '',
            textList: []
        };
        if ($scope.selectedReport.properties.filters.length > 0) {
            item.conditionType = 'and';
            item.conditionLabel = 'AND';
        }
        $scope.selectedReport.properties.filters.push(item);
        $scope.onDropField(item, 'filter');
    };

    $scope.onDropField = function (newItem, role, forbidAggregation) {
        $scope.sql = undefined;

        if (role === 'order') {
            newItem.sortType = 1;
        }

        if (newItem.aggregation && forbidAggregation) {
            if (typeof newItem.originalLabel === 'undefined') {
                newItem.originalLabel = newItem.elementLabel;
            }
            delete (newItem.aggregation);
            newItem.id = reportModel.changeColumnId(newItem.id, 'raw');
            newItem.elementLabel = newItem.originalLabel;
            newItem.objectLabel = newItem.originalLabel;
        }

        $scope.selectedReport.properties.connectedComponent = newItem.component;
    };

    $scope.onRemoveFilter = function (filterIndex) {
        var filter = $scope.selectedReport.properties.filters.splice(filterIndex, 1)[0];
        $scope.onRemoveField(filter, 'filter');
    };

    $scope.onRemoveField = function (item, role) {
        $scope.sql = undefined;

        var empty = true;

        for (const columnList of [
            $scope.selectedReport.properties.columns,
            $scope.selectedReport.properties.xkeys,
            $scope.selectedReport.properties.ykeys,
            $scope.selectedReport.properties.pivotKeys.columns,
            $scope.selectedReport.properties.pivotKeys.rows,
            $scope.selectedReport.properties.order,
            $scope.selectedReport.properties.filters
        ]) {
            if (columnList.length > 0) {
                empty = false;
                break;
            }
        }
        $scope.selectedReport.empty = empty;

        if ($scope.selectedReport.empty) {
            $scope.selectedReport.properties.connectedComponent = undefined;
        }
    };

    $scope.toReportItem = function (ngModelItem) {
        var agg;
        var aggLabel = '';

        if (ngModelItem.aggregation) {
            agg = ngModelItem.aggregation;
            aggLabel = ' (' + ngModelItem.aggregation + ')';
        }

        if (ngModelItem.defaultAggregation) {
            agg = ngModelItem.defaultAggregation;
            aggLabel = ' (' + ngModelItem.defaultAggregation + ')';
        }

        return {
            elementName: ngModelItem.elementName,
            objectLabel: ngModelItem.elementLabel + aggLabel,
            datasourceID: ngModelItem.datasourceID,
            id: ngModelItem.id,
            elementLabel: ngModelItem.elementLabel,
            collectionID: ngModelItem.collectionID,
            elementID: ngModelItem.elementID,
            elementType: ngModelItem.elementType,
            layerID: $scope.selectedReport.selectedLayerID,
            filterType: 'equal',
            filterPrompt: false,
            filterTypeLabel: 'equal',
            format: ngModelItem.format,
            values: ngModelItem.values,
            isCustom: ngModelItem.isCustom,
            expression: ngModelItem.expression,
            viewExpression: ngModelItem.viewExpression,
            component: ngModelItem.component,
            aggregation: agg
        };
    };

    $scope.autoChooseArea = function (item, chooseColumn) {
        var choice;

        switch ($scope.selectedReport.reportType) {
        case 'grid':
        case 'vertical-grid':
            choice = {
                propertyBind: $scope.selectedReport.properties.columns,
                zone: 'columns',
                role: 'column'
            };
            break;

        case 'pivot':
            if ($scope.selectedReport.properties.pivotKeys.rows.length === 0) {
                choice = {
                    propertyBind: $scope.selectedReport.properties.pivotKeys.rows,
                    zone: 'prow',
                    role: 'column',
                    forbidAggregation: true
                };
            } else {
                if ($scope.selectedReport.properties.pivotKeys.columns.length === 0) {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.pivotKeys.columns,
                        zone: 'pcol',
                        role: 'column',
                        forbidAggregation: true
                    };
                } else {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.ykeys,
                        zone: 'ykeys',
                        role: 'column'
                    };
                }
            }
            break;

        case 'chart-bar':
        case 'chart-line':
        case 'chart-area':
        case 'chart-pie':
        case 'chart-donut':
            if ($scope.selectedReport.properties.xkeys.length === 0) {
                choice = {
                    propertyBind: $scope.selectedReport.properties.xkeys,
                    zone: 'xkeys',
                    role: 'column'
                };
            } else {
                if ($scope.selectedReport.properties.ykeys.length === 0 || $scope.selectedReport.properties.order.length > 0 || chooseColumn) {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.ykeys,
                        zone: 'ykeys',
                        role: 'column'
                    };
                } else {
                    choice = {
                        propertyBind: $scope.selectedReport.properties.order,
                        zone: 'order',
                        role: 'order'
                    };
                }
            }
            break;

        case 'indicator':
        case 'gauge':
            choice = {
                propertyBind: $scope.selectedReport.properties.ykeys,
                zone: 'ykeys',
                role: 'column'
            };
            break;
        }

        return choice;
    };

    $scope.autoFill = function (ngModelItem) {
        const newItem = $scope.toReportItem(ngModelItem);
        var choice = $scope.autoChooseArea(newItem);
        newItem.zone = choice.zone;

        if (newItem.aggregation && (newItem.zone === 'pcol' || newItem.zone === 'prow')) {
            if (typeof newItem.originalLabel === 'undefined') {
                newItem.originalLabel = newItem.elementLabel;
            }
            delete (newItem.aggregation);
            newItem.elementLabel = newItem.originalLabel;
            newItem.objectLabel = newItem.originalLabel;
        }

        var found = false;
        for (const item of choice.propertyBind) {
            if (item.elementID === newItem.elementID) { found = true; }
        }
        if (!found) {
            choice.propertyBind.push(newItem);
        }

        $scope.onDropField(newItem, choice.role, choice.forbidAggregation);
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

    $scope.getButtonFilterPromptMessage = function (filter) {
        if (filter.filterPrompt) { return 'Select to deactivate the runtime'; } else { return 'Make this filter appear in the report interface.'; }
    };

    $scope.changeReportType = function (newReportType) {
        const report = $scope.selectedReport;
        if (report.query) {
            report.query.countYKeys = false;
        }

        $scope.$broadcast('clearReport');

        var movedColumns = [];

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
            if (report.query) {
                report.query.countYKeys = true;
            }
            report.reportType = 'pivot';
            break;

        case 'chart-bar':
            moveContent(report.properties.columns, movedColumns);
            moveContent(report.properties.pivotKeys.columns, movedColumns);
            moveContent(report.properties.pivotKeys.rows, movedColumns);
            report.reportType = 'chart-bar';
            break;

        case 'chart-line':
            moveContent(report.properties.columns, movedColumns);
            moveContent(report.properties.pivotKeys.columns, movedColumns);
            moveContent(report.properties.pivotKeys.rows, movedColumns);
            report.reportType = 'chart-line';
            break;

        case 'chart-area':
            moveContent(report.properties.columns, movedColumns);
            moveContent(report.properties.pivotKeys.columns, movedColumns);
            moveContent(report.properties.pivotKeys.rows, movedColumns);
            report.reportType = 'chart-area';
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
            if (!report.properties.style) { report.properties.style = 'style1'; }
            if (!report.properties.backgroundColor) { report.properties.backgroundColor = 'transparent'; }
            if (!report.properties.mainFontColor) { report.properties.mainFontColor = '#000000'; }
            if (!report.properties.descFontColor) { report.properties.descFontColor = '#CCCCCC'; }
            break;

        case 'gauge':
            moveContent(report.properties.columns, movedColumns);
            moveContent(report.properties.xkeys, movedColumns);
            moveContent(report.properties.pivotKeys.columns, movedColumns);
            moveContent(report.properties.pivotKeys.rows, movedColumns);
            report.reportType = 'gauge';

            if (!report.properties.lines) { report.properties.lines = 20; } // The number of lines to draw    12
            if (!report.properties.angle) { report.properties.angle = 15; } // The length of each line
            if (!report.properties.lineWidth) { report.properties.lineWidth = 44; } // The line thickness
            if (!report.properties.pointerLength) { report.properties.pointerLength = 70; }
            if (!report.properties.pointerStrokeWidth) { report.properties.pointerStrokeWidth = 35; }
            if (!report.properties.pointerColor) { report.properties.pointerColor = '#000000'; }
            if (!report.properties.limitMax) { report.properties.limitMax = 'false'; } // If true, the pointer will not go past the end of the gauge
            if (!report.properties.colorStart) { report.properties.colorStart = '#6FADCF'; } // Colors
            if (!report.properties.colorStop) { report.properties.colorStop = '#8FC0DA'; } // just experiment with them
            if (!report.properties.strokeColor) { report.properties.strokeColor = '#E0E0E0'; } // to see which ones work best for you
            if (!report.properties.generateGradient) { report.properties.generateGradient = true; }
            if (!report.properties.minValue) { report.properties.minValue = 0; }
            if (!report.properties.maxValue) { report.properties.maxValue = 100; }
            if (!report.properties.animationSpeed) { report.properties.animationSpeed = 32; }
            break;

        default:
            noty({ msg: 'report type does not exist', timeout: 2000, type: 'error' });
            break;
        }

        // The columns in dropzones which become hidden are moved to new dropzones
        // This ensures that there are no hidden columns in the query, which results in strange behaviour
        for (const col of movedColumns) {
            const choice = $scope.autoChooseArea(col, true);
            col.zone = choice.zone;
            // queryModel.updateColumnField(col, 'zone', choice.zone);
            choice.propertyBind.push(col);
            if (choice.forbidAggregation) {
                $scope.aggregationChoosed(col, {name: 'Raw', value: 'raw'});
            }
        }
    };

    $scope.isUsable = function (item) {
        return $scope.selectedReport.properties &&
            item.component !== -1 &&
            ($scope.selectedReport.properties.connectedComponent === undefined || // connectedComponent can be 0, which is why we can't just test it's truthyness
            item.component === undefined ||
            item.component === $scope.selectedReport.properties.connectedComponent);
    };

    $scope.chartColumnTypeOptions = c3Charts.chartColumnTypeOptions;

    $scope.chartSectorTypeOptions = c3Charts.chartSectorTypeOptions;

    $scope.changeChartColumnType = function (column, type) {
        column.type = type;
        c3Charts.changeChartColumnType($scope.selectedReport.properties.chart, column);
    };

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

    $scope.orderColumn = function (columnIndex, desc, hashedID) {
        reportModel.orderColumn($scope.selectedReport, columnIndex, desc, hashedID);
    };

    $scope.aggregationChoosed = function (column, option) {
        if (typeof column.originalLabel === 'undefined') {
            column.originalLabel = column.elementLabel;
        }

        if (option.value === 'raw') {
            delete (column.aggregation);
            column.elementLabel = column.originalLabel;
            column.objectLabel = column.originalLabel;
            column.id = reportModel.changeColumnId(column.id, 'raw');
        } else {
            column.aggregation = option.value;
            column.elementLabel = column.originalLabel + ' (' + option.name + ')';
            column.objectLabel = column.originalLabel + ' (' + option.name + ')';
            column.id = reportModel.changeColumnId(column.id, option.value);
        }
    };

    $scope.hideColumn = function (column, hidden) {
        column['hidden'] = hidden;
    };

    $scope.stackBars = function (column, stacked) {
        column.doNotStack = !stacked;
        c3Charts.changeStack($scope.selectedReport.properties.chart);
    };

    $scope.saveToExcel = function (reportHash) {
        reportModel.saveToExcel($scope, reportHash);
    };

    $scope.setDatePatternFilterType = function (filter, option) {
        filter.searchValue = option.value;
        filter.filterText1 = option.value;
        filter.filterLabel1 = option.label;
    };

    $scope.getElementProperties = function (element, elementID) {
        $scope.selectedElement = element;
        $scope.tabs.selected = 'settings';
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
        }

        return available;
    };

    $scope.gridGetMoreData = function (reportID) {
        $scope.navigation.page += 1;
        reportModel.getReportDataNextPage($scope.selectedReport, $scope.navigation.page);
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

    /*
    *   Other
    */

    $scope.fieldsAggregations = {
        'number': [
            {name: gettextCatalog.getString('Sum'), value: 'sum'},
            {name: gettextCatalog.getString('Avg'), value: 'avg'},
            {name: gettextCatalog.getString('Min'), value: 'min'},
            {name: gettextCatalog.getString('Max'), value: 'max'},
            {name: gettextCatalog.getString('Count'), value: 'count'},
            {name: gettextCatalog.getString('Count distinct'), value: 'countDistinct'},
            {name: gettextCatalog.getString('Raw'), value: 'raw'}
        ],
        'date': [
            {name: gettextCatalog.getString('Year'), value: 'year'},
            {name: gettextCatalog.getString('Month'), value: 'month'},
            {name: gettextCatalog.getString('Day'), value: 'day'},
            {name: gettextCatalog.getString('Count'), value: 'count'},
            {name: gettextCatalog.getString('Count distinct'), value: 'countDistinct'},
            {name: gettextCatalog.getString('Raw'), value: 'raw'}
            /* {name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'} */
        ],
        'string': [
            {name: gettextCatalog.getString('Count'), value: 'count'},
            {name: gettextCatalog.getString('Count distinct'), value: 'countDistinct'},
            {name: gettextCatalog.getString('Raw'), value: 'raw'}

        ]
    };

    $scope.IntroOptions = {
        // IF width > 300 then you will face problems with mobile devices in responsive mode
        steps: [
            {
                element: '#dataObjectsIntroBlock',
                html: '<div><h3>' +
                gettextCatalog.getString('The layer catalog') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Access here the different data elements of every layer that you have access on') +
                '</span><br/><span>' +
                gettextCatalog.getString('Select elements and drag and drop them over the query design zone, depending if the element is going to be used as a column result (columns area), as a filter (filters area) or as an element to order by the results of the query (order by area)') +
                '</span></div>',
                width: '300px',
                height: '250px'
            },
            {
                element: '#selectLayer',
                html: '<div><h3>' +
                gettextCatalog.getString('The layer selector') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Select here the layer where your query will be based on.') +
                '</span><br/><span>' +
                gettextCatalog.getString('One query can only be baes in just one layer, you can not mix elements from different layers in the same query') +
                '</span></div>',
                width: '300px',
                height: '250px',
                areaColor: 'transparent',
                areaLineColor: '#8DC63F'

            },
            {
                element: '#reportType',
                html: '<div><h3>' +
                gettextCatalog.getString('Report Type selector') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Click over one of the different report types to change the visualization of the data you choose') +
                '</span><br/><span></span></div>',
                width: '300px',
                areaColor: 'transparent',
                height: '180px'
            },
            {
                element: '#dropArea',
                html: '<div><h3>' +
                gettextCatalog.getString('Results area') +
                '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                gettextCatalog.getString('As you define the query draging and droping in the areas above, the results of the query will appear here') +
                '</span><br/><span></span></div>',
                width: '300px',
                height: '150px',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            },
            {
                element: '#queryRefresh',
                html: '<div><h3>' +
                gettextCatalog.getString('Query refresh') +
                '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                gettextCatalog.getString('Use this button to refresh the results') +
                '</span><br/><span>' +
                gettextCatalog.getString('After building your query, refresh to view the report.') +
                '</span></div>',
                width: '300px',
                height: '150px',
                areaColor: 'transparent',
                areaLineColor: '#fff',
                horizontalAlign: 'right'
            },
            {
                element: '#columnsDropzone',
                html: '<div><h3>' +
                gettextCatalog.getString('Columns / results drop zone') +
                '</h3><span style="font-weight:bold;">' +
                gettextCatalog.getString('Drop here the elements you want to have in the results of the query') +
                '</span><br/><span>' +
                gettextCatalog.getString('A query must hold at least one element here to be executed') +
                '</span></div>',
                width: '300px',
                height: '180px'
            },
            {
                element: '#orderByDropzone',
                html: '<div><h3>' +
                gettextCatalog.getString('Order By drop zone') +
                '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                gettextCatalog.getString('Drop here the elements that you want to use to order the results of the query') +
                '</span><br/><span>' +
                gettextCatalog.getString('The elements you drop in here do not necessarily have to be in the columns/results area, a query can be ordered by elements that do not appear in the results') +
                '</span></div>',
                width: '300px',
                height: '250px'
            },
            {
                element: '#filtersDropzone',
                html: '<div><h3>' +
                gettextCatalog.getString('Filters drop zone') +
                '</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">' +
                'Drop here the elements that you want to use to filter the results of the query' +
                '</span><br/><span>' +
                'The elements you drop in here do not necessarily have to be in the columns/results area, a query can be filtered by elements that do not appear in the results' +
                '</span></div>',
                width: '300px',
                height: '250px',
                areaColor: 'transparent',
                areaLineColor: '#fff'
            }

        ]
    };
});
