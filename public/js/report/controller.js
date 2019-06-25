angular.module('app').controller('reportCtrl', function ($scope, connection, $compile, reportsService, $routeParams, $timeout, c3Charts,
    reportModel, widgetsCommon, $location, gettextCatalog, $q) {
    $scope.promptsBlock = 'partials/report/partials/promptsBlock.html';
    $scope.dateModal = 'partials/report/modals/dateModal.html';
    $scope.linkModal = 'partials/report/modals/linkModal.html';
    $scope.repeaterTemplate = 'partials/report/partials/repeater.html';
    $scope.dropArea = 'partials/report/partials/drop-area.html';
    $scope.reportNameModal = 'partials/report/modals/reportNameModal.html';
    $scope.dashListModal = 'partials/report/modals/dashboardListModal.html';
    $scope.filterPromptModal = 'partials/report/modals/filter-prompt-modal.html';
    $scope.tabs = { selected: 'elements' };

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

    $scope.initReportEdit = function () {
        // FIXME There should be another way...
        if (/dashboards/.test($location.path())) {
            return;
        }

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
                    return $scope.refresh();
                });
            }

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

        $scope.selectedReport.properties.height = 300;

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
            noty({ text: 'invalid report', timeout: 2000, type: 'error' });
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

    $scope.saveReportStructure = function () {
        reportsService.storeReport($scope.selectedReport);
    };

    $scope.stringVariables = [
        { value: 'toUpper', label: 'To Upper' },
        { value: 'toLower', label: 'To Lower' }
    ];

    if ($location.hash() === 'intro') {
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
        reportsService.storeReport($scope.selectedReport);

        $location.path('/dashboards/push/' + dashboardID);
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

    $scope.onRemoveFilter = function (filter) {
        const filterIndex = $scope.selectedReport.properties.filters.indexOf(filter);
        $scope.selectedReport.properties.filters.splice(filterIndex, 1);
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
            break;

        case 'gauge':
            moveContent(report.properties.columns, movedColumns);
            moveContent(report.properties.xkeys, movedColumns);
            moveContent(report.properties.pivotKeys.columns, movedColumns);
            moveContent(report.properties.pivotKeys.rows, movedColumns);
            report.reportType = 'gauge';

            if (!report.properties.maxValue) { report.properties.maxValue = 100; }
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
                $scope.aggregationChoosed(col, { name: 'Raw', value: 'raw' });
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
            { name: gettextCatalog.getString('Sum'), value: 'sum' },
            { name: gettextCatalog.getString('Avg'), value: 'avg' },
            { name: gettextCatalog.getString('Min'), value: 'min' },
            { name: gettextCatalog.getString('Max'), value: 'max' },
            { name: gettextCatalog.getString('Count'), value: 'count' },
            { name: gettextCatalog.getString('Count distinct'), value: 'countDistinct' },
            { name: gettextCatalog.getString('Raw'), value: 'raw' }
        ],
        'date': [
            { name: gettextCatalog.getString('Year'), value: 'year' },
            { name: gettextCatalog.getString('Month'), value: 'month' },
            { name: gettextCatalog.getString('Day'), value: 'day' },
            { name: gettextCatalog.getString('Count'), value: 'count' },
            { name: gettextCatalog.getString('Count distinct'), value: 'countDistinct' },
            { name: gettextCatalog.getString('Raw'), value: 'raw' }
            /* {name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'} */
        ],
        'string': [
            { name: gettextCatalog.getString('Count'), value: 'count' },
            { name: gettextCatalog.getString('Count distinct'), value: 'countDistinct' },
            { name: gettextCatalog.getString('Raw'), value: 'raw' }

        ]
    };

    $scope.IntroOptions = {
        nextLabel: gettextCatalog.getString('Next'),
        prevLabel: gettextCatalog.getString('Back'),
        skipLabel: gettextCatalog.getString('Skip'),
        doneLabel: gettextCatalog.getString('Done'),
        tooltipPosition: 'auto',
        showStepNumbers: false,
        steps: [
            {
                element: '#elementsTab',
                intro: '<h4>' +
                    gettextCatalog.getString('The layer catalog') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Access here the different data elements of every layer that you have access on') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('Select elements and drag and drop them over the query design zone, depending if the element is going to be used as a column result (columns area), as a filter (filters area) or as an element to order by the results of the query (order by area)') +
                    '</p>',
            },
            {
                element: '#selectLayer',
                intro: '<h4>' +
                    gettextCatalog.getString('The layer selector') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Select here the layer where your query will be based on.') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('One query can only be based on one layer, you can not mix elements from different layers in the same query') +
                    '</p>',
            },
            {
                element: '#reportType',
                intro: '<h4>' +
                    gettextCatalog.getString('Report Type selector') +
                    '</h4><p>' +
                    gettextCatalog.getString('Click over one of the different report types to change the visualization of the data you choose') +
                    '</p>',
            },
            {
                element: '#dropArea',
                intro: '<h4>' +
                    gettextCatalog.getString('Results area') +
                    '</h4><p>' +
                    gettextCatalog.getString('As you define the query dragging and dropping in the areas above, the results of the query will appear here') +
                    '</p>',
            },
            {
                element: '#queryRefresh',
                intro: '<h4>' +
                    gettextCatalog.getString('Query refresh') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Use this button to refresh the results') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('After building your query, refresh to view the report.') +
                    '</p>',
            },
            {
                element: '#columnsDropzone',
                intro: '<h4>' +
                    gettextCatalog.getString('Columns / results drop zone') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Drop here the elements you want to have in the results of the query') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('A query must hold at least one element here to be executed') +
                    '</p>',
            },
            {
                element: '#orderByDropzone',
                intro: '<h4>' +
                    gettextCatalog.getString('Order By drop zone') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Drop here the elements that you want to use to order the results of the query') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('The elements you drop in here do not necessarily have to be in the columns/results area, a query can be ordered by elements that do not appear in the results') +
                    '</p>',
            },
            {
                element: '#filtersDropzone',
                intro: '<h4>' +
                    gettextCatalog.getString('Filters drop zone') +
                    '</h4><p><strong>' +
                    gettextCatalog.getString('Drop here the elements that you want to use to filter the results of the query') +
                    '</strong></p><p>' +
                    gettextCatalog.getString('The elements you drop in here do not necessarily have to be in the columns/results area, a query can be filtered by elements that do not appear in the results') +
                    '</p>',
            }

        ]
    };
});
