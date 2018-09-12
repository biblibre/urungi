app.service('ioModel', function (connection) {
    function exportDatasource (datasourceID) {
        return connection.get('/api/data-sources/find-one', {id: datasourceID})
            .then(response => response.item);
    }

    function exportLayer (layerID) {
        return connection.get('/api/layers/find-one', {id: layerID})
            .then(response => response.item);
    }

    function exportReport (reportID) {
        return connection.get('/api/reports/find-one', {id: reportID})
            .then(response => {
                delete response.item.query.data;
                return response.item;
            });
    }

    function exportDashboard (dashboardID) {
        return connection.get('/api/dashboardsv2/find-one', {id: dashboardID})
            .then(response => {
                for (const report of response.item.reports) {
                    delete report.query.data;
                }
                return response.item;
            });
    }

    this.makeExportBundle = function (dashboardIDs, reportIDs, layerIDs) {
        const requiredLayers = new Set();
        const requiredDatasources = new Set();
        const bundle = {};

        for (const layerID of layerIDs) {
            requiredLayers.add(layerID);
        }

        const reportPromise = Promise.all(reportIDs.map(id => exportReport(id)))
            .then(reports => {
                bundle.reports = reports;
                for (const report of reports) {
                    requiredLayers.add(report.query.layerID);
                }
            });

        const dashboardPromise = Promise.all(dashboardIDs.map(id => exportDashboard(id)))
            .then(dashboards => {
                bundle.dashboards = dashboards;
                for (const dashboard of dashboards) {
                    for (const report of dashboard.reports) {
                        requiredLayers.add(report.query.layerID);
                    }
                }
            });

        return Promise.all([reportPromise, dashboardPromise])
            .then(() => {
                return Promise.all(Array.from(requiredLayers).map(layerID => exportLayer(layerID)));
            })
            .then(layers => {
                bundle.layers = layers;
                for (const layer of layers) {
                    for (const schema of layer.params.schema) {
                        requiredDatasources.add(schema.datasourceID);
                    }
                }
            })
            .then(() => {
                return Promise.all(Array.from(requiredDatasources).map(id => exportDatasource(id)));
            })
            .then(datasources => {
                bundle.datasources = datasources;
            })
            .then(() => {
                return bundle;
            });
    };

    async function importLayer (layer, datasourceRef, additions) {
        var params = {
            find: JSON.stringify([
                { _id: layer._id }
            ])
        };

        var existingLayer = await connection.get('/api/layers/find-all', params);

        if (existingLayer.items.length > 0) {
            return;
        }

        function exploreElements (elements) {
            for (const el of elements) {
                if (el.datasourceID) {
                    el.datasourceID = datasourceRef[el.datasourceID];
                }
                if (el.elements) {
                    exploreElements(el.elements);
                }
            }
        }

        exploreElements(layer.objects);

        for (const col of layer.params.schema) {
            col.datasourceID = datasourceRef[col.datasourceID];
        }

        var newLayer = await connection.post('/api/layers/create', layer);

        additions.push(newLayer);
    }

    async function importReport (report, datasourceRef, additions) {
        var params = {
            find: JSON.stringify([
                { _id: report._id }
            ])
        };

        var existingReport = await connection.get('/api/reports/find-all', params);

        if (existingReport.items.length > 0) {
            return;
        }

        for (const object of
            report.properties.columns.concat(
                report.properties.xkeys,
                report.properties.ykeys,
                report.properties.pivotKeys.rows,
                report.properties.pivotKeys.columns,
                report.query.columns,
                report.query.order,
                report.query.groupFilters
            )) {
            if (object && object.datasourceID) {
                object.datasourceID = datasourceRef[object.datasourceID];
            }
        }

        var newReport = await connection.post('/api/reports/create', report);

        additions.push(newReport);
    }

    async function importDashboard (dashboard, datasourceRef, additions) {
        var params = {
            find: JSON.stringify([
                { _id: dashboard._id }
            ])
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
                    report.properties.pivotKeys.rows,
                    report.properties.pivotKeys.columns,
                    report.query.columns,
                    report.query.order,
                    report.query.groupFilters
                )) {
                if (object && object.datasourceID) {
                    object.datasourceID = datasourceRef[object.datasourceID];
                }
            }
        }

        var newDashboard = await connection.post('/api/dashboardsv2/create', dashboard);

        additions.push(newDashboard);
    }

    this.importBundle = async function (bundle, datasourceRef) {
        var additions = [];

        for (const layer of bundle.layers) {
            await importLayer(layer, datasourceRef, additions);
        }

        for (const report of bundle.reports) {
            await importReport(report, datasourceRef, additions);
        }

        for (const dashboard of bundle.dashboards) {
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
