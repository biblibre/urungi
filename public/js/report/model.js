angular.module('app').service('reportModel', function ($q, connection, uuid2, FileSaver) {
    this.getReportDefinition = function (id, isLinked) {
        const url = '/api/reports/get-report/' + id;
        const params = { id: id, mode: 'preview', linked: isLinked };

        return connection.get(url, params).then(function (data) {
            return data.item;
        });
    };

    this.getLayers = function () {
        return connection.get('/api/layers/get-layers', {}).then(function (data) {
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
        });
    };

    /*
    * Fetches all of the data associated to the report's query, and stores it in report.query.data
    */
    this.fetchData = function (query, params) {
        if (query.columns.length === 0) {
            return $q.resolve({});
        }

        var request = {};

        if (!params) {
            params = {};
        }

        if (params.page !== undefined) {
            request.page = params.page;
        }

        request.query = clone(query);

        if (!query.recordLimit && params.selectedRecordLimit) {
            request.query.quickResultLimit = params.selectedRecordLimit;
        }

        if (params.filterCriteria) {
            for (const filter of request.query.filters) {
                if (params.filterCriteria[filter.id + filter.filterType]) {
                    filter.criterion = params.filterCriteria[filter.id + filter.filterType];
                }
            }
        }

        return connection.post('/api/reports/get-data', request).then(function (result) {
            if (result.warnings) {
                for (const w of result.warnings) {
                    noty({ text: w.msg, timeout: 3000, type: 'warning' });
                }
            }

            if (result.result === 0) {
                noty({ text: result.msg, timeout: 3000, type: 'error' });
                return {
                    data: [],
                    sql: result.sql,
                    errorToken: result
                };
            }

            var data = result.data;

            processDates(data);

            query.data = result.data;

            return {
                data: data,
                sql: result.sql,
                time: result.time,
                warnings: result.warnings
            };
        });
    };

    function processDates (data) {
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
            dataColumns: [],
            datax: {},
            height: report.properties.height,
            legendPosition: report.properties.legendPosition,
            query: report.query,
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

            chart.dataAxis = {
                id: report.properties.xkeys[0].id,
            };

            if (report.properties.xkeys.length > 1) {
                chart.stackDimension = {
                    id: report.properties.xkeys[1].id,
                };
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
            columnId = 'e' + element.elementID.toLowerCase() + 'raw';
        } else {
            columnId = 'e' + element.elementID.toLowerCase() + aggregation.substring(0, 3);
        }

        return columnId;
    }

    function calculateIdForAllElements (elements) {
        for (var element of elements) {
            if (element.elementRole === 'dimension') {
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
        if (!obj) { return obj; }
        if (Object.getPrototypeOf(obj) === Date.prototype) { return new Date(obj); }
        if (typeof obj !== 'object') { return obj; }
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    this.saveAsReport = function (report, mode) {
        // Cleaning up the report object

        // var clonedReport = clone(report);
        // Is this necessary ? It causes c3 to crash, so I will remove it until I find a reason for it
        var clonedReport = report;
        if (clonedReport.properties.chart) {
            clonedReport.properties.chart.chartCanvas = undefined;
            clonedReport.properties.chart.data = undefined;
            // clonedReport.properties.chart.query = undefined;
        }
        if (clonedReport.query.data) { clonedReport.query.data = undefined; }
        clonedReport.parentDiv = undefined;

        let url;
        if (mode === 'add') {
            url = '/api/reports/create';
        } else {
            url = '/api/reports/update/' + report._id;
        }

        return connection.post(url, clonedReport);
    };

    this.duplicateReport = function (duplicateOptions) {
        const params = { id: duplicateOptions.report._id };
        return connection.get('/api/reports/find-one', params).then(function (result) {
            const newReport = result.item;

            delete newReport._id;
            delete newReport.createdOn;
            newReport.reportName = duplicateOptions.newName;

            return connection.post('/api/reports/create', newReport).then(function (data) {
                if (data.result !== 1) {
                    // TODO indicate error
                }
            });
        });
    };

    this.getReportContainerHTML = function (reportID) {
        // returns a container for the report, to be inserted in the dashboard html

        var containerID = 'REPORT_CONTAINER_' + reportID;

        var html = '<div page-block  class="container-fluid featurette ndContainer"  ndType="container" style="height:100%;padding:0px;">' +
                        '<div page-block class="col-md-12 ndContainer" ndType="column" style="height:100%;padding:0px;">' +
                            '<div page-block class="container-fluid" id="' + containerID +
                             '" report-view report="getReport(\'' + reportID + '\')" style="padding:0px;position: relative;height: 100%;font-size:30px;"></div>' +
                        '</div>' +
                    '</div>';

        return html;
    };
});
