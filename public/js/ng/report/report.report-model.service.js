import * as uuid from '../../uuid.js';

angular.module('app.report').service('reportModel', reportModel);

reportModel.$inject = ['api', 'connection', 'reportsService'];

function reportModel (api, connection, reportsService) {
    this.getReportDefinition = function (id, isLinked) {
        const url = '/api/reports/get-report/' + id;
        const params = { id, mode: 'preview', linked: isLinked };

        return connection.get(url, params).then(function (data) {
            return data.item;
        });
    };

    this.getLayers = function () {
        const params = {
            fields: 'name,description,objects,params.joins',
            sort: 'name',
            filters: {
                status: 'active',
            },
        };

        return api.getLayers(params).then(function (res) {
            const layers = res.data;

            for (const layer of layers) {
                layer.rootItem = {
                    elementLabel: '',
                    elementRole: 'root',
                    elements: layer.objects
                };
            }

            return layers;
        });
    };

    this.initChart = function (report) {
        const chart = {
            id: 'Chart' + uuid.v4(),
            dataColumns: [],
            datax: {},
            height: report.properties.height,
            legendPosition: report.properties.legendPosition,
            range: report.properties.range
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
        case 'pyramid':
            chart.type = 'pyramid';
            break;
        }

        if (['chart-line', 'chart-donut', 'chart-pie', 'pyramid'].indexOf(report.reportType) >= 0 &&
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

        return chart;
    };

    this.changeColumnId = function (oldId, newAggregation) {
        return oldId.substring(0, oldId.length - 3) + newAggregation.substring(0, 3);
    };

    let selectedColumn;

    this.selectedColumn = function () {
        return selectedColumn;
    };

    let selectedColumnHashedID;

    this.selectedColumnHashedID = function () {
        return selectedColumnHashedID;
    };

    let selectedColumnIndex;

    this.selectedColumnIndex = function () {
        return selectedColumnIndex;
    };

    this.saveAsReport = function (report, mode) {
        let url;
        if (mode === 'add') {
            url = '/api/reports/create';
        } else {
            url = '/api/reports/update/' + report._id;
        }

        return connection.post(url, report);
    };

    // returns a container for the report, to be inserted in the dashboard html
    this.getReportContainerHTML = function (reportID) {
        const containerID = 'REPORT_CONTAINER_' + reportID;

        const html = '<div page-block class="container-fluid featurette ndContainer" ndType="container" style="height:100%;padding:0px;">' +
                        '<div class="col-md-12 ndContainer" style="height:100%;padding:0px;">' +
                            '<div class="container-fluid" id="' + containerID +
                             '" report-view report="getReport(\'' + reportID + '\')" style="padding:0px;position: relative;height: 100%;"></div>' +
                        '</div>' +
                    '</div>';

        return html;
    };
}
