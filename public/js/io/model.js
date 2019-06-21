angular.module('app').service('ioModel', function (connection, $q, gettextCatalog) {
    function exportDatasource (datasourceID) {
        return connection.get('/api/data-sources/find-one', { id: datasourceID })
            .then(response => response.item);
    }

    function exportLayer (layerID) {
        return connection.get('/api/layers/find-one', { id: layerID })
            .then(response => response.item);
    }

    function exportReport (reportID) {
        return connection.get('/api/reports/find-one', { id: reportID })
            .then(response => {
                delete response.item.query.data;
                return response.item;
            });
    }

    function exportDashboard (dashboardID) {
        return connection.get('/api/dashboardsv2/find-one', { id: dashboardID })
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
                    requiredDatasources.add(layer.datasourceID);
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
        let currentDatasourceID = layer.datasourceID;

        // If not defined, search in layer.params.schema
        // It might be an export from a previous version of Urungi
        if (!currentDatasourceID && layer.params && layer.params.schema && layer.params.schema.length > 0) {
            currentDatasourceID = layer.params.schema[0].datasourceID;
        }

        if (!currentDatasourceID) {
            return $q.reject(new Error('Cannot find datasourceID in layer ' + layer.name));
        }

        if (!(currentDatasourceID in datasourceRef)) {
            return $q.reject(new Error('Cannot find mapping for datasource ' + currentDatasourceID));
        }

        layer.datasourceID = datasourceRef[currentDatasourceID];

        return connection.post('/api/layers/create', layer);
    }

    function importReport (report) {
        return connection.post('/api/reports/create', report);
    }

    function importDashboard (dashboard, datasourceRef) {
        return connection.post('/api/dashboardsv2/create', dashboard);
    }

    this.importBundle = function (bundle, datasourceRef) {
        const additions = [];
        const messages = [];
        const replace = [];

        const layerPromises = [];
        for (const layer of bundle.layers) {
            const p = getLayer(layer._id).then(l => {
                if (l) {
                    if (layer.replace === true) {
                        var msg = gettextCatalog.getString('This layer was replaced:') + ' ';
                        messages.push(msg + l.name);
                        return this.replaceLayer(layer).then(function () {
                            replace.push(layer);
                        });
                    } else {
                        msg = gettextCatalog.getString('Layer was not imported because it already exists in database:') + ' ';
                        messages.push(msg + l.name);
                        return;
                    }
                }

                return importLayer(layer, datasourceRef).then(l => {
                    additions.push(l);
                }).catch(err => {
                    const msg = gettextCatalog.getString('Layer was not imported :');
                    messages.push(msg + ' ' + err);
                });
            });
            layerPromises.push(p);
        }

        return $q.all(layerPromises).then(() => {
            const promises = [];
            for (const report of bundle.reports) {
                const p = getReport(report._id).then(r => {
                    if (r) {
                        if (report.replace === true) {
                            var msg = gettextCatalog.getString('This report was replaced:') + ' ';
                            messages.push(msg + r.reportName);
                            return this.replaceReport(report).then(function () {
                                replace.push(report);
                            });
                        }
                        msg = gettextCatalog.getString('Report was not imported because it already exists in database:') + ' ';
                        messages.push(msg + r.reportName);
                        return;
                    }

                    return importReport(report).then(r => {
                        additions.push(r);
                    });
                });
                promises.push(p);
            }

            for (const dashboard of bundle.dashboards) {
                const p = getDashboard(dashboard._id).then(d => {
                    if (d) {
                        if (dashboard.replace === true) {
                            var msg = gettextCatalog.getString('This dashboard was replaced:') + ' ';
                            messages.push(msg + d.dashboardName);
                            return this.replaceDashboard(dashboard).then(function () {
                                replace.push(dashboard);
                            });
                        }
                        msg = gettextCatalog.getString('Dashboard was not imported because it already exists in database:') + ' ';
                        messages.push(msg + d.dashboardName);
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
                    replace: replace,
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
        return connection.get('/api/layers/find-one', { id: id }, { showMsg: false }).then(r => r.item);
    }

    this.getLayers = function () {
        var params = {
            fields: ['_id', 'name']
        };

        return connection.get('/api/layers/find-all', params).then(r => r.items);
    };

    function getReport (id) {
        return connection.get('/api/reports/find-one', { id: id }, { showMsg: false }).then(r => r.item);
    }

    this.getReports = function () {
        var params = {
            fields: ['_id', 'reportName']
        };

        return connection.get('/api/reports/find-all', params).then(r => r.items);
    };

    function getDashboard (id) {
        return connection.get('/api/dashboardsv2/find-one', { id: id }, { showMsg: false }).then(r => r.item);
    }

    this.getDashboards = function () {
        var params = {
            fields: ['_id', 'dashboardName']
        };

        return connection.get('/api/dashboardsv2/find-all', params).then(r => r.items);
    };

    this.replaceLayer = function (layer) {
        return connection.post('/api/layers/update/' + layer._id, layer).then(l => l.item);
    };

    this.replaceReport = function (report) {
        return connection.post('/api/reports/update/' + report._id, report).then(r => r.item);
    };

    this.replaceDashboard = function (dashboard) {
        return connection.post('/api/dashboardsv2/update/' + dashboard._id, dashboard).then(d => d.item);
    };
});
