(function () {
    'use strict';

    angular.module('app.io').controller('ImportController', ImportController);

    ImportController.$inject = ['$scope', '$q', 'gettext', 'api'];

    function ImportController ($scope, $q, gettext, api) {
        const vm = this;

        vm.checkError = undefined;
        vm.checkingFile = false;
        vm.checkProgressValue = 0;
        vm.checkProgressMax = 100;
        vm.datasourceMatch = {};
        vm.doImport = doImport;
        vm.importBundle = undefined;
        vm.importProgressValue = 0;
        vm.importProgressMax = 100;
        vm.importStarted = false;
        vm.localDatasources = [];
        vm.messages = [];
        vm.step = 1;
        vm.upload = upload;

        activate();

        function activate () {
            api.getDataSources().then(data => {
                vm.localDatasources = data.items;
            });
        }

        function upload (file) {
            if (!file) {
                return;
            }

            vm.checkError = undefined;
            vm.checkingFile = true;
            vm.importBundle = undefined;
            vm.importStarted = false;
            vm.checkProgressMax = 100;
            vm.checkProgressValue = 0;

            return readFileAsText(file).then(result => {
                const importFile = JSON.parse(result);
                if (!(importFile.layers && importFile.reports &&
                    importFile.datasources && importFile.dashboards)) {
                    throw new Error(gettext('File must contain the following properties: datasources, layers, reports and dashboards'));
                }

                return checkImportFile(importFile).then(importBundle => {
                    vm.checkingFile = false;

                    for (const datasource of importBundle.datasources) {
                        vm.datasourceMatch[datasource.doc._id] = autoDetect(datasource.doc);
                    }

                    vm.importBundle = importBundle;
                    vm.step = 2;
                });
            }).catch(err => {
                vm.checkingFile = false;
                vm.checkError = err;
            });
        }

        function readFileAsText (file) {
            return $q(function (resolve, reject) {
                const fileReader = new FileReader();
                fileReader.onload = function () {
                    resolve(fileReader.result);
                };
                fileReader.onerror = function () {
                    fileReader.abort();
                    reject(fileReader.error);
                };
                fileReader.readAsText(file);
            });
        }

        function autoDetect (dts) {
            if (vm.localDatasources.length === 1) {
                return vm.localDatasources[0];
            }

            for (const localDts of vm.localDatasources) {
                if (localDts.name === dts.name) {
                    return localDts;
                }
            }
        }

        function checkImportFile (importFile) {
            const importBundle = {
                layers: [],
                reports: [],
                dashboards: [],
                datasources: [],
            };

            vm.checkProgressMax = importFile.datasources.length +
                importFile.layers.length +
                importFile.reports.length +
                importFile.dashboards.length;

            vm.checkProgressValue = 0;

            const datasourcesById = {};
            const layersById = {};

            for (const datasource of importFile.datasources) {
                vm.checkProgressValue++;
                if (!datasource || !datasource._id) {
                    continue;
                }

                const bundleDatasource = {
                    doc: datasource,
                };
                importBundle.datasources.push(bundleDatasource);
                datasourcesById[datasource._id] = bundleDatasource;
            }

            const promises = [];
            for (const layer of importFile.layers) {
                vm.checkProgressValue++;
                if (!layer || !layer._id) {
                    continue;
                }

                const bundleLayer = {
                    valid: true,
                    errors: [],
                    exists: false,
                    doc: layer,
                };
                importBundle.layers.push(bundleLayer);
                layersById[layer._id] = bundleLayer;

                const datasourceID = getLayerDatasourceID(layer);

                if (!datasourceID) {
                    bundleLayer.valid = false;
                    bundleLayer.errors.push(gettext('No datasourceID'));
                    continue;
                }

                if (!(datasourceID in datasourcesById)) {
                    bundleLayer.valid = false;
                    bundleLayer.errors.push(gettext('Related datasource is not in import file'));
                }

                promises.push(api.getLayer(layer._id).then(l => {
                    if (l) {
                        bundleLayer.exists = true;
                    }
                }, e => {
                    console.log(e.name + ': ' + e.message);
                }));
            }

            for (const report of importFile.reports) {
                vm.checkProgressValue++;
                if (!report || !report._id) {
                    continue;
                }

                const bundleReport = {
                    valid: true,
                    errors: [],
                    exists: false,
                    doc: report,
                };
                importBundle.reports.push(bundleReport);

                const layerID = report.selectedLayerID;
                if (!layerID) {
                    bundleReport.valid = false;
                    bundleReport.errors.push(gettext('No selectedLayerID'));
                    continue;
                }

                if (!(layerID in layersById)) {
                    bundleReport.valid = false;
                    bundleReport.errors.push(gettext('Related layer is not in import file'));
                    continue;
                }

                if (!layersById[layerID].valid) {
                    bundleReport.valid = false;
                    bundleReport.errors.push(gettext('Related layer is not valid'));
                    continue;
                }

                promises.push(api.getReport(report._id).then(r => {
                    if (r) {
                        bundleReport.exists = true;
                    }
                }, e => {
                    console.log(e.name + ': ' + e.message);
                }));
            }

            for (const dashboard of importFile.dashboards) {
                vm.checkProgressValue++;
                if (!dashboard || !dashboard._id) {
                    continue;
                }

                const bundleDashboard = {
                    valid: true,
                    errors: [],
                    exists: false,
                    doc: dashboard,
                };
                importBundle.dashboards.push(bundleDashboard);

                for (const report of dashboard.reports) {
                    const layerID = report.selectedLayerID;
                    if (!layerID) {
                        bundleDashboard.valid = false;
                        bundleDashboard.errors.push(gettext('At least one report has no selectedLayerID'));
                        continue;
                    }

                    if (!(layerID in layersById)) {
                        bundleDashboard.valid = false;
                        bundleDashboard.errors.push(gettext('At least one report is related to a layer that is not in import file'));
                        continue;
                    }

                    if (!layersById[layerID].valid) {
                        bundleDashboard.valid = false;
                        bundleDashboard.errors.push(gettext('At least one report is related to a layer that is not valid'));
                        continue;
                    }
                }

                promises.push(api.getDashboard(dashboard._id).then(d => {
                    if (d) {
                        bundleDashboard.exists = true;
                    }
                }, e => {
                    console.log(e.name + ': ' + e.message);
                }));
            }

            return $q.all(promises).then(() => importBundle);
        }

        function doImport () {
            if (vm.form.$valid) {
                vm.importStarted = true;
                vm.step = 3;
                vm.importProgressValue = 0;
                vm.importProgressMax = vm.importBundle.layers.length +
                    vm.importBundle.reports.length +
                    vm.importBundle.dashboards.length;

                const layerPromises = [];
                for (const bundleLayer of vm.importBundle.layers) {
                    const p = importLayer(bundleLayer).then(() => {
                        vm.importProgressValue++;
                    });
                    layerPromises.push(p);
                }

                return $q.all(layerPromises).then(() => {
                    const reportAndDashboardPromises = [];

                    for (const bundleReport of vm.importBundle.reports) {
                        const p = importReport(bundleReport).then(() => {
                            vm.importProgressValue++;
                        });
                        reportAndDashboardPromises.push(p);
                    }
                    for (const bundleDashboard of vm.importBundle.dashboards) {
                        const p = importDashboard(bundleDashboard).then(() => {
                            vm.importProgressValue++;
                        });
                        reportAndDashboardPromises.push(p);
                    }

                    return $q.all(reportAndDashboardPromises);
                }).then(() => {
                    vm.messages.push({
                        text: gettext('Import completed'),
                        type: 'info',
                    });
                });
            }
        }

        function importLayer (bundleLayer) {
            let p = $q.resolve(0);

            if (bundleLayer.valid) {
                const layer = bundleLayer.doc;
                const datasourceID = getLayerDatasourceID(layer);
                layer.datasourceID = vm.datasourceMatch[datasourceID]._id;

                // Remove properties that should not be added/updated
                delete layer.createdBy;
                delete layer.createdOn;

                if (bundleLayer.exists && bundleLayer.overwrite) {
                    p = api.updateLayer(bundleLayer.doc).then(() => {
                        bundleLayer.imported = true;
                        vm.messages.push({
                            text: gettext('Layer updated successfully:') + ' ' + layer.name,
                            type: 'success',
                        });
                    }, (err) => {
                        vm.messages.push({
                            text: gettext('Failed to update layer') + ' ' + layer.name + ': ' + err,
                            type: 'error',
                        });
                    });
                } else if (!bundleLayer.exists) {
                    p = api.createLayer(bundleLayer.doc).then(() => {
                        bundleLayer.imported = true;
                        vm.messages.push({
                            text: gettext('Layer created successfully:') + ' ' + layer.name,
                            type: 'success',
                        });
                    }, (err) => {
                        vm.messages.push({
                            text: gettext('Failed to create layer') + ' ' + layer.name + ': ' + err,
                            type: 'error',
                        });
                    });
                }
            }

            return p;
        }

        function importReport (bundleReport) {
            let p = $q.resolve(0);

            const layer = vm.importBundle.layers.find(l => l.doc._id === bundleReport.doc.selectedLayerID);

            if (bundleReport.valid && layer && (layer.imported || layer.exists)) {
                const report = bundleReport.doc;

                // Remove properties that should not be added/updated
                delete report.author;
                delete report.createdBy;
                delete report.createdOn;
                delete report.isPublic;
                delete report.isShared;
                delete report.owner;
                delete report.parentFolder;

                if (bundleReport.exists && bundleReport.overwrite) {
                    p = api.updateReport(report).then(() => {
                        vm.messages.push({
                            text: gettext('Report updated successfully:') + ' ' + report.reportName,
                            type: 'success',
                        });
                    }, (err) => {
                        vm.messages.push({
                            text: gettext('Failed to update report') + ' ' + report.reportName + ': ' + err,
                            type: 'error',
                        });
                    });
                } else if (!bundleReport.exists) {
                    p = api.createReport(report).then(() => {
                        vm.messages.push({
                            text: gettext('Report created successfully:') + ' ' + report.reportName,
                            type: 'success',
                        });
                    }, (err) => {
                        vm.messages.push({
                            text: gettext('Failed to create report') + ' ' + report.reportName + ': ' + err,
                            type: 'error',
                        });
                    });
                }
            }

            return p;
        }

        /**
         * Import a dashboard
         *
         * @param {Object} bundleDashboard
         * @param {boolean} bundleDashboard.exists - True if dashboard already exists in database
         * @param {boolean} bundleDashboard.overwrite - True if user wants to overwrite existing dashboard
         * @param {Object} bundleDashboard.doc - The dashboard object
         */
        function importDashboard (bundleDashboard) {
            let p = $q.resolve(0);

            if (bundleDashboard.valid) {
                const dashboard = bundleDashboard.doc;

                // Remove properties that should not be added/updated
                delete dashboard.author;
                delete dashboard.createdBy;
                delete dashboard.createdOn;
                delete dashboard.isPublic;
                delete dashboard.isShared;
                delete dashboard.owner;
                delete dashboard.parentFolder;

                let allReportsOk = true;
                for (const report of dashboard.reports) {
                    const layer = vm.importBundle.layers.find(l => l.doc._id === report.selectedLayerID);
                    if (!layer || !(layer.exists || layer.imported)) {
                        allReportsOk = false;
                    }
                }

                if (allReportsOk) {
                    if (bundleDashboard.exists && bundleDashboard.overwrite) {
                        p = api.updateDashboard(dashboard).then(() => {
                            vm.messages.push({
                                text: gettext('Dashboard updated successfully:') + ' ' + dashboard.dashboardName,
                                type: 'success',
                            });
                        }, (err) => {
                            vm.messages.push({
                                text: gettext('Failed to update dashboard') + ' ' + dashboard.dashboardName + ': ' + err,
                                type: 'error',
                            });
                        });
                    } else if (!bundleDashboard.exists) {
                        p = api.createDashboard(dashboard).then(() => {
                            vm.messages.push({
                                text: gettext('Dashboard created successfully') + ' ' + dashboard.dashboardName,
                                type: 'success',
                            });
                        }, (err) => {
                            vm.messages.push({
                                text: gettext('Failed to create dashboard') + ' ' + dashboard.dashboardName + ': ' + err,
                                type: 'error',
                            });
                        });
                    }
                }
            }

            return p;
        }

        /**
         * Get datasourceID of a layer.
         *
         * datasourceID can be at different locations depending on the version
         * of Urungi where export has been made
         *
         * @param {Object} layer - The layer object
         */
        function getLayerDatasourceID (layer) {
            let datasourceID = layer.datasourceID;
            if (!datasourceID && layer.params && layer.params.schema && layer.params.schema.length > 0) {
                datasourceID = layer.params.schema[0].datasourceID;
            }

            return datasourceID;
        }
    }
})();
