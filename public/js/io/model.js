app.service('ioModel', function (connection) {
    async function exportDataSource (datasourceID) {
        var params = {
            id: datasourceID
        };

        const result = await connection.get('/api/data-sources/find-one', params);

        return result.item;
    }

    async function exportLayer (layerID, requiredDataSources) {
        var params = {
            id: layerID
        };

        var result = await connection.get('/api/layers/find-one', params);

        for (const object of result.item.objects) {
            if (object.datasourceID) {
                requiredDataSources.add(object.datasourceID);
            }
        }

        return result.item;
    }

    async function exportReport (reportID, requiredLayers, requiredDataSources) {
        var params = {
            id: reportID
        };

        var result = await connection.get('/api/reports/find-one', params);
        for (const layerID of result.item.query.layers) {
            requiredLayers.add(layerID);
        }

        for (const datasource of result.item.query.datasources) {
            requiredDataSources.add(datasource.datasourceID);
        }

        delete result.item.query.data;

        return result.item;
    }

    async function exportDashboard (dashboardID, requiredLayers, requiredDataSources) {
        var params = {
            id: dashboardID
        };

        var result = await connection.get('/api/dashboardsv2/find-one', params);

        for (const report of result.item.reports) {
            for (const layerID of report.query.layers) {
                requiredLayers.add(layerID);
            }
            for (const datasource of report.query.datasources) {
                requiredDataSources.add(datasource.datasourceID);
            }

            delete report.query.data;
        }

        return result.item;
    }

    this.makeExportBundle = async function (dashboardIDs, reportIDs, layerIDs) {
        var requiredLayers = new Set();
        var requiredDataSources = new Set();

        var dashboardExports = [];
        var reportExports = [];
        var layerExports = [];
        var datasourceExports = [];

        for (const layerID of layerIDs) {
            requiredLayers.add(layerID);
        }

        for (const reportID of reportIDs) {
            reportExports.push(await exportReport(reportID, requiredLayers, requiredDataSources));
        }

        for (const dashboardID of dashboardIDs) {
            dashboardExports.push(await exportDashboard(dashboardID, requiredLayers, requiredDataSources));
        }

        for (const layerID of requiredLayers.entries()) {
            layerExports.push(await exportLayer(layerID, requiredDataSources));
        }

        for (const datasourceID of requiredDataSources.entries()) {
            datasourceExports.push(await exportDataSource(datasourceID));
        }

        return {
            dashboardExports,
            reportExports,
            layerExports,
            datasourceExports
        };
    };

    async function importLayer (layer, datasourceRef, additions) {
        var params = {
            _id: layer._id
        };

        var existingLayer = await connection.get('/api/layers/find-all', params);

        if (existingLayer.items.length > 0) {
            return;
        }

        for (const object of layer.objects) {
            if (object.datasourceID) {
                object.datasourceID = datasourceRef[object.datasourceID];
            }
        }

        var newLayer = await connection.post('/api/layers/create', layer);

        additions.push(newLayer);
    }

    async function importReport (report, datasourceRef, additions) {
        var params = {
            _id: report._id
        };

        var existingReport = await connection.get('/api/reports/find-all', params);

        if (existingReport.items.length > 0) {
            return;
        }

        for (const object of
            report.properties.columns.concat(
                report.properties.xkeys,
                report.properties.ykeys,
                // report.properties.pivotTable.rows,
                // report.properties.pivotTable.columns,
                report.query.columns,
                report.query.order,
                report.query.groupFilters
            )) {
            // TODO : uncomment the lines above after the merge with pivot table changes
            if (object && object.datasourceID) {
                object.datasourceID = datasourceRef[object.datasourceID];
            }
        }

        for (const dts of report.query.datasources) {
            dts.datasourceID = datasourceRef[dts.datasourceID];
        }

        var newReport = await connection.post('/api/reports/create', report);

        additions.push(newReport);
    }

    async function importDashboard (dashboard, datasourceRef, additions) {
        var params = {
            _id: dashboard._id
        };

        var existingDashboard = await connection.get('/api/dashboardsv2/find-all', params);

        if (existingDashboard.items.length > 0) {
            return;
        }

        for (const report of dashboard.reports) {
            for (const object of
                report.properties.columns.concat(
                    report.properties.xkeys,
                    report.properties.ykeys,
                    // report.properties.pivotTable.rows,
                    // report.properties.pivotTable.columns,
                    report.query.columns,
                    report.query.order,
                    report.query.groupFilters
                )) {
                // TODO : uncomment the lines above after the merge with pivot table changes
                if (object && object.datasourceID) {
                    object.datasourceID = datasourceRef[object.datasourceID];
                }
            }

            for (const dts of report.query.datasources) {
                dts.datasourceID = datasourceRef[dts.datasourceID];
            }
        }

        var newDashboard = await connection.post('/api/dashboardsv2/create', dashboard);

        additions.push(newDashboard);
    }

    this.importBundle = async function (bundle, datasourceRef) {
        var additions = [];

        for (const layer of bundle.layerExports) {
            await importLayer(layer, datasourceRef, additions);
        }

        for (const report of bundle.reportExports) {
            await importReport(report, datasourceRef, additions);
        }

        for (const dashboard of bundle.dashboardExports) {
            await importDashboard(dashboard, datasourceRef, additions);
        }

        return additions;
    };

    this.getDataSources = async function () {
        const params = {
            fields: ['_id', 'name']
        };

        var result = await connection.get('/api/data-sources/find-all', params);

        return result.items;
    };

    this.getLayers = async function () {
        var params = {
            fields: ['_id', 'name']
        };

        var result = await connection.get('/api/layers/find-all', params);

        return result.items;
    };

    this.getReports = async function () {
        var params = {
            fields: ['_id', 'reportName']
        };

        var result = await connection.get('/api/reports/find-all', params);

        return result.items;
    };

    this.getDashboards = async function () {
        var params = {
            fields: ['_id', 'dashboardName']
        };

        var result = await connection.get('/api/dashboardsv2/find-all', params);

        return result.items;
    };
});
