app.service('ioModel', function (connection, $q) {
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

    function importLayer (layer, datasourceRef) {
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

        return connection.post('/api/layers/create', layer);
    }

    function importReport (report, datasourceRef) {
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

        return connection.post('/api/reports/create', report);
    }

    function importDashboard (dashboard, datasourceRef) {
        for (const report of dashboard.reports) {
            for (const object of report.properties.columns.concat(
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

        return connection.post('/api/dashboardsv2/create', dashboard);
    }

    this.importBundle = function (bundle, datasourceRef) {
        const additions = [];
        const messages = [];

        const layerPromises = [];
        for (const layer of bundle.layers) {
            const p = getLayer(layer._id).then(l => {
                if (l) {
                    messages.push('Layer was not imported because it already exists in database: ' + l.name);
                    return;
                }

                return importLayer(l, datasourceRef).then(l => {
                    additions.push(l);
                });
            });
            layerPromises.push(p);
        }

        return $q.all(layerPromises).then(() => {
            const promises = [];
            for (const report of bundle.reports) {
                const p = getReport(report._id).then(r => {
                    if (r) {
                        messages.push('Report was not imported because it already exists in database: ' + r.reportName);
                        return;
                    }

                    return importReport(r, datasourceRef).then(r => {
                        additions.push(r);
                    });
                });
                promises.push(p);
            }

            for (const dashboard of bundle.dashboards) {
                const p = getDashboard(dashboard._id).then(d => {
                    if (d) {
                        messages.push('Dashboard was not imported because it already exists in database: ' + d.dashboardName);
                        return;
                    }

                    return importDashboard(dashboard, datasourceRef).then(d => {
                        additions.push(d);
                    });
                });
                promises.push(p);
            }

            return $q.all(promises).then(() => {
                return {
                    additions: additions,
                    messages: messages,
                };
            });
        });
    };

    this.getDataSources = function () {
        const params = {
            fields: ['_id', 'name']
        };

        return connection.get('/api/data-sources/find-all', params).then(r => r.items);
    };

    function getLayer (id) {
        return connection.get('/api/layers/find-one', {id: id}).then(r => r.item);
    }

    this.getLayers = function () {
        var params = {
            fields: ['_id', 'name']
        };

        return connection.get('/api/layers/find-all', params).then(r => r.items);
    };

    function getReport (id) {
        return connection.get('/api/reports/find-one', {id: id}).then(r => r.item);
    }

    this.getReports = function () {
        var params = {
            fields: ['_id', 'reportName']
        };

        return connection.get('/api/reports/find-all', params).then(r => r.items);
    };

    function getDashboard (id) {
        return connection.get('/api/dashboardsv2/find-one', {id: id}).then(r => r.item);
    }

    this.getDashboards = function () {
        var params = {
            fields: ['_id', 'dashboardName']
        };

        return connection.get('/api/dashboardsv2/find-all', params).then(r => r.items);
    };
});
