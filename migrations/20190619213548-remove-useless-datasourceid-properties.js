const ObjectID = require('mongodb').ObjectID;

module.exports = {
    async up (db) {
        const Layers = db.collection('wst_Layers');
        const Reports = db.collection('wst_Reports');
        const Dashboards = db.collection('wst_Dashboardsv2');

        const layers = await Layers.find().toArray();
        for (const layer of layers) {
            if (layer.params && layer.params.schema && layer.params.schema.length > 0) {
                const datasourceID = layer.params.schema[0].datasourceID;
                layer.datasourceID = ObjectID(datasourceID);
                layer.params.schema.forEach(collection => {
                    delete collection.datasourceID;
                    if (collection.elements) {
                        collection.elements.forEach(function (element) {
                            delete element.datasourceID;
                        });
                    }
                });

                if (layer.objects) {
                    layer.objects.forEach(deleteDatasourceIdFromLayerObject);
                }

                await Layers.replaceOne({ _id: layer._id }, layer);
            } else {
                await Layers.deleteOne({ _id: layer._id });
            }
        }

        const reports = await Reports.find().toArray();
        for (const report of reports) {
            deleteDatasourceIdFromReport(report);

            await Reports.replaceOne({ _id: report._id }, report);
        }

        const dashboards = await Dashboards.find().toArray();
        for (const dashboard of dashboards) {
            if (dashboard.reports) {
                dashboard.reports.forEach(deleteDatasourceIdFromReport);
            }

            await Dashboards.replaceOne({ _id: dashboard._id }, dashboard);
        }
    },

    async down (db) {
        const Layers = db.collection('wst_Layers');
        const Reports = db.collection('wst_Reports');
        const Dashboards = db.collection('wst_Dashboardsv2');

        const datasourceIds = {};

        const layers = await Layers.find().toArray();
        for (const layer of layers) {
            const datasourceID = String(layer.datasourceID);

            datasourceIds[layer._id] = datasourceID;

            if (layer.params && layer.params.schema) {
                layer.params.schema.forEach(collection => {
                    collection.datasourceID = datasourceID;
                    if (collection.elements) {
                        collection.elements.forEach(function (element) {
                            element.datasourceID = datasourceID;
                        });
                    }
                });
            }

            if (layer.objects) {
                layer.objects.forEach(function (object) {
                    setDatasourceIdIntoLayerObject(object, datasourceID);
                });
            }

            delete layer.datasourceID;

            Layers.replaceOne({ _id: layer._id }, layer);
        }

        const reports = await Reports.find().toArray();
        for (const report of reports) {
            setDatasourceIdIntoReport(report, datasourceIds[report.selectedLayerID]);

            await Reports.replaceOne({ _id: report._id }, report);
        }

        const dashboards = await Dashboards.find().toArray();
        for (const dashboard of dashboards) {
            if (dashboard.reports) {
                dashboard.reports.forEach(function (report) {
                    setDatasourceIdIntoReport(report, datasourceIds[report.selectedLayerID]);
                });
            }

            await Dashboards.replaceOne({ _id: dashboard._id }, dashboard);
        }
    }
};

function deleteDatasourceIdFromReport (report) {
    if (report.query) {
        deleteDatasourceID(report.query);
    }
    if (report.properties) {
        deleteDatasourceID(report.properties);

        if (report.properties.pivotKeys) {
            if (report.properties.pivotKeys.rows) {
                report.properties.pivotKeys.rows.forEach(deleteDatasourceID);
            }
            if (report.properties.pivotKeys.columns) {
                report.properties.pivotKeys.columns.forEach(deleteDatasourceID);
            }
        }

        if (report.properties.xkeys) {
            report.properties.xkeys.forEach(deleteDatasourceID);
        }
        if (report.properties.ykeys) {
            report.properties.ykeys.forEach(deleteDatasourceID);
        }

        if (report.properties.chart) {
            if (report.properties.chart.dataColumns) {
                report.properties.chart.dataColumns.forEach(deleteDatasourceID);
            }

            if (report.properties.chart.query) {
                deleteDatasourceID(report.properties.chart.query);
            }
        }
    }
}

function deleteDatasourceID (obj) {
    if ('datasourceID' in obj) {
        delete obj.datasourceID;
    }

    if ('columns' in obj) {
        obj.columns.forEach(deleteDatasourceID);
    }
    if ('filters' in obj) {
        obj.filters.forEach(deleteDatasourceID);
    }
    if ('order' in obj) {
        obj.order.forEach(deleteDatasourceID);
    }
}

function deleteDatasourceIdFromLayerObject (object) {
    if (object.elements) {
        object.elements.forEach(function (element) {
            deleteDatasourceIdFromLayerObject(element);
        });
    } else {
        delete object.datasourceID;
    }
}

function setDatasourceIdIntoReport (report, datasourceID) {
    function setDatasourceID (obj) {
        obj.datasourceID = datasourceID;
    }

    if (report.query) {
        if (report.query.columns) {
            report.query.columns.forEach(setDatasourceID);
        }
        if (report.query.filters) {
            report.query.filters.forEach(setDatasourceID);
        }
        if (report.query.order) {
            report.query.order.forEach(setDatasourceID);
        }
    }

    if (report.properties) {
        if (report.properties.columns) {
            report.properties.columns.forEach(setDatasourceID);
        }
        if (report.properties.filters) {
            report.properties.filters.forEach(setDatasourceID);
        }
        if (report.properties.order) {
            report.properties.order.forEach(setDatasourceID);
        }

        if (report.properties.pivotKeys) {
            if (report.properties.pivotKeys.rows) {
                report.properties.pivotKeys.rows.forEach(setDatasourceID);
            }
            if (report.properties.pivotKeys.columns) {
                report.properties.pivotKeys.columns.forEach(setDatasourceID);
            }
        }

        if (report.properties.xkeys) {
            report.properties.xkeys.forEach(setDatasourceID);
        }
        if (report.properties.ykeys) {
            report.properties.ykeys.forEach(setDatasourceID);
        }

        if (report.properties.chart) {
            if (report.properties.chart.dataColumns) {
                report.properties.chart.dataColumns.forEach(setDatasourceID);
            }

            if (report.properties.chart.query) {
                if (report.properties.chart.query.columns) {
                    report.properties.chart.query.columns.forEach(setDatasourceID);
                }
                if (report.properties.chart.query.filters) {
                    report.properties.chart.query.filters.forEach(setDatasourceID);
                }
                if (report.properties.chart.query.order) {
                    report.properties.chart.query.order.forEach(setDatasourceID);
                }
            }
        }
    }
}

function setDatasourceIdIntoLayerObject (object, datasourceID) {
    if (object.elements) {
        object.elements.forEach(function (element) {
            setDatasourceIdIntoLayerObject(element, datasourceID);
        });
    } else {
        object.datasourceID = datasourceID;
    }
}
