/* global XLSX: false, saveAs: false, Blob: false, datenum: false */

app.service('reportModel', function (bsLoadingOverlayService, connection, uuid2) {
    this.getReportDefinition = async function (id, isLinked) {
        const data = await connection.get('/api/reports/get-report/' + id, {id: id, mode: 'preview', linked: isLinked});
        if (data.item) {
            // report = data.item;
            return data.item;
        } else {
            return null;
        }
    };

    this.getLayers = async function () {
        var data = await connection.get('/api/layers/get-layers', {});
        if (data.result !== 1) {
            throw new Error(data.msg);
        }

        var layers = data.items;

        for (var layer of layers) {
            layer.rootItem = {
                elementLabel: '',
                elementRole: 'root',
                elements: layer.objects
            };
            calculateIdForAllElements(layer.rootItem.elements);
        }

        return layers;
    };

    /*
    * Fetches all of the data associated to the report's query, and stores it in report.query.data
    */
    this.fetchData = async function (query, params) {
        if (query.columns.length === 0) {
            return {};
        }

        var request = {};

        if (!params) {
            params = {};
        }

        if (params.page !== undefined) {
            request.page = params.page;
        } else {
            request.page = 1;
        }

        request.query = clone(query);

        if (!query.recordLimit && params.selectedRecordLimit) {
            request.query.recordLimit = params.selectedRecordLimit;
        }

        var result = await connection.get('/api/reports/get-data', request);

        if (result.result === 0) {
            noty({text: result.msg, timeout: 2000, type: 'error'});
            return {
                data: []
            };
        }

        var data = result.data;

        processDates(data);

        query.data = result.data;

        return {
            data: data,
            sql: result.sql,
            time: result.time
        };
    };

    function processDates (data) {
        console.log(data);
        for (const item of data) {
            for (const key in item) {
                if (typeof item[key] === 'string') {
                    var a = /\/Date\((\d*)\)\//.exec(item[key]);
                    if (a) {
                        item[key] = new Date(+a[1]);
                    }
                }
            }
        }
    }

    this.initChart = function (report) {
        var chart = {
            id: 'Chart' + uuid2.newguid(),
            dataPoints: [],
            dataColumns: [],
            datax: {},
            height: 300,
            query: report.query,
            queryName: null
        };

        switch (report.reportType) {
        case 'chart-line':
            chart.type = 'line';
            break;
        case 'chart-donut':
            chart.type = 'donut';
            break;
        case 'chart-pie':
            chart.type = 'pie';
            break;
        case 'gauge':
            chart.type = 'gauge';
            break;
        }

        if (['chart-line', 'chart-donut', 'chart-pie'].indexOf(report.reportType) >= 0 &&
            report.properties.xkeys.length > 0 && report.properties.ykeys.length > 0) {
            chart.dataColumns = report.properties.ykeys;

            const dataAxisInfo = report.properties.xkeys[0];
            chart.dataAxis = {
                elementName: dataAxisInfo.elementName,
                queryName: 'query1',
                elementLabel: dataAxisInfo.objectLabel,
                id: dataAxisInfo.id,
                type: 'bar',
                color: '#000000'};

            if (report.properties.xkeys.length > 1) {
                const stackDimensionInfo = report.properties.xkeys[1];
                chart.stackDimension = {
                    elementName: stackDimensionInfo.elementName,
                    queryName: 'query1',
                    elementLabel: stackDimensionInfo.objectLabel,
                    id: stackDimensionInfo.id,
                    type: 'bar',
                    color: '#000000'};
            }
        }

        if (report.reportType === 'gauge') {
            chart.dataColumns = report.properties.ykeys;
        }

        report.properties.chart = chart;
    };

    this.getColumnId = function (element) {
        return getColumnId(element);
    };

    this.changeColumnId = function (oldId, newAggregation) {
        return oldId.substring(0, oldId.length - 3) + newAggregation.substring(0, 3);
    };

    function getColumnId (element) {
        /*
        * The id of a column (column.id) differs from the id of the element which that column uses (column.elementID)
        * this allows for multiple columns which use the same element, for example to use different aggregations
        */

        var columnId;

        var aggregation = element.aggregation || element.defaultAggregation;

        if (!aggregation) {
            columnId = 'wst' + element.elementID.toLowerCase() + 'raw';
        } else {
            columnId = 'wst' + element.elementID.toLowerCase() + aggregation.substring(0, 3);
        }

        columnId = columnId.replace(/[^a-zA-Z ]/g, '');
        // this threatens unicity in theory
        // Two elements with different ids could have the same transformed id after all numbers are removed
        // It's unlikely, but if it happens it will result in a bug which is nightmarish to understand

        return columnId;
    }

    function calculateIdForAllElements (elements) {
        for (var element of elements) {
            if (element.collectionID) {
                element.id = getColumnId(element);
            }

            if (element.elements) { calculateIdForAllElements(element.elements); }
        }
    };

    var selectedColumn;

    this.selectedColumn = function () {
        return selectedColumn;
    };

    var selectedColumnHashedID;

    this.selectedColumnHashedID = function () {
        return selectedColumnHashedID;
    };

    var selectedColumnIndex;

    this.selectedColumnIndex = function () {
        return selectedColumnIndex;
    };

    this.changeColumnStyle = function (report, columnIndex, hashedID) {
        selectedColumn = report.properties.columns[columnIndex];
        selectedColumnHashedID = hashedID;
        selectedColumnIndex = columnIndex;

        if (!selectedColumn.columnStyle) { selectedColumn.columnStyle = {color: '#000', 'background-color': '#EEEEEE', 'text-align': 'left', 'font-size': '12px', 'font-weight': 'normal', 'font-style': 'normal'}; }

        $('#columnFormatModal').modal('show');
    };

    this.changeColumnSignals = function (report, columnIndex, hashedID) {
        selectedColumn = report.properties.columns[columnIndex];
        selectedColumnHashedID = hashedID;
        selectedColumnIndex = columnIndex;

        if (!selectedColumn.signals) { selectedColumn.signals = []; }
        $('#columnSignalsModal').modal('show');
    };

    this.orderColumn = function (report, columnIndex, desc) {
        var theColumn = report.query.columns[columnIndex];
        if (desc) {
            theColumn.sortType = 1;
        } else {
            theColumn.sortType = -1;
        }
        report.query.order = [];
        report.query.order.push(theColumn);
    };

    function clone (obj) {
        if (obj == null || typeof obj !== 'object') return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }

    this.saveAsReport = async function (report, mode) {
        // Cleaning up the report object
        var clonedReport = clone(report);
        if (clonedReport.properties.chart) {
            clonedReport.properties.chart.chartCanvas = undefined;
            clonedReport.properties.chart.data = undefined;
            // clonedReport.properties.chart.query = undefined;
        }
        if (clonedReport.query.data) { clonedReport.query.data = undefined; }
        clonedReport.parentDiv = undefined;

        var result;

        if (mode === 'add') {
            result = await connection.post('/api/reports/create', clonedReport);
        } else {
            result = await connection.post('/api/reports/update/' + report._id, clonedReport);
        }

        if (result.result === 1) {
            await new Promise(resolve => setTimeout(resolve, 400));
        }
    };

    this.duplicateReport = async function (duplicateOptions) {
        const params = { id: duplicateOptions.report._id };
        var newReport = (await connection.get('/api/reports/find-one', params)).item;

        delete newReport._id;
        delete newReport.createdOn;
        newReport.reportName = duplicateOptions.newName;

        const data = await connection.post('/api/reports/create', newReport);
        if (data.result !== 1) {
            // TODO indicate error
        }
    };

    this.saveToExcel = function ($scope, reportHash) {
        var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
        var ws_name = $scope.selectedReport.reportName;

        var wb = new Workbook();
        var ws = sheet_from_array_of_arrays($scope, reportHash);

        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;

        var wbout = XLSX.write(wb, wopts);

        function s2ab (s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (let i = 0; i !== s.length; ++i) {
                view[i] = s.charCodeAt(i) & 0xFF;
            }

            return buf;
        }

        saveAs(new Blob([s2ab(wbout)], {type: ''}), ws_name + '.xlsx');
    };

    function Workbook () {
        if (!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }

    function sheet_from_array_of_arrays ($scope, reportHash) {
        var data = $scope.selectedReport.query.data;
        var report = $scope.selectedReport;
        var ws = {};
        var range = {s: {c: 10000000, r: 10000000}, e: { c: 0, r: 0 }};
        for (var i = 0; i < report.properties.columns.length; i++) {
            if (range.s.r > 0) range.s.r = 0;
            if (range.s.c > i) range.s.c = i;
            if (range.e.r < 0) range.e.r = 0;
            if (range.e.c < i) range.e.c = i;

            var cell = { v: report.properties.columns[i].objectLabel };
            var cell_ref = XLSX.utils.encode_cell({c: i, r: 0});
            if (typeof cell.v === 'number') cell.t = 'n';
            else if (typeof cell.v === 'boolean') cell.t = 'b';
            else if (cell.v instanceof Date) {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            } else cell.t = 's';

            ws[cell_ref] = cell;
        }

        for (let R = 0; R !== data.length; ++R) {
            for (let i = 0; i < report.properties.columns.length; i++) {
                // var elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName;
                var elementID = 'wst' + report.properties.columns[i].elementID.toLowerCase();
                var elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                if (report.properties.columns[i].aggregation) {
                    // elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName+report.properties.columns[i].aggregation;
                    elementID = 'wst' + report.properties.columns[i].elementID.toLowerCase() + report.properties.columns[i].aggregation;
                    elementName = elementID.replace(/[^a-zA-Z ]/g, '');
                }
                if (range.s.r > R + 1) range.s.r = R + 1;
                if (range.s.c > i) range.s.c = i;
                if (range.e.r < R + 1) range.e.r = R + 1;
                if (range.e.c < i) range.e.c = i;

                let cell;
                if (report.properties.columns[i].elementType === 'number' && data[R][elementName]) {
                    cell = { v: Number(data[R][elementName]) };
                } else {
                    cell = { v: data[R][elementName] };
                }
                cell_ref = XLSX.utils.encode_cell({c: i, r: R + 1});
                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                } else cell.t = 's';

                cell.s = { fill: { fgColor: { rgb: 'FFFF0000' } } };

                ws[cell_ref] = cell;
            }
        }
        if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);

        return ws;
    }

    this.getReportContainerHTML = function (reportID) {
        // returns a container for the report, to be inserted in the dashboard html

        var containerID = 'REPORT_CONTAINER_' + reportID;

        var html = '<div page-block  class="container-fluid featurette ndContainer"  ndType="container" style="height:100%;padding:0px;">' +
                        '<div page-block class="col-md-12 ndContainer" ndType="column" style="height:100%;padding:0px;">' +
                            '<div page-block class="container-fluid" id="' + containerID +
                             '" report-view report="getReport(\'' + reportID + '\')" style="padding:0px;position: relative;height: 100%;"></div>' +
                        '</div>' +
                    '</div>';

        return html;
    };

    this.getPromptHTML = function (prompt) {
        var html = '<div id="PROMPT_' + prompt.elementID + '" page-block class="ndContainer" ndType="ndPrompt"><nd-prompt  filter="getFilter(' + "'" + prompt.elementID + "'" + ')" element-id="' + prompt.elementID + '" label="' + prompt.objectLabel + '" value-field="' + prompt.name + '" show-field="' + prompt.name + '" prompts="prompts" after-get-values="afterPromptGetValues" on-change="promptChanged" ng-model="lastPromptSelectedValue"></nd-prompt></div>';

        return html;
    };
});
