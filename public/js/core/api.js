(function () {
    'use strict';

    angular.module('app.core').factory('api', api);

    api.$inject = ['$http', 'connection'];

    function api ($http, connection) {
        const service = {
            getVersion: getVersion,

            getCounts: getCounts,
            getUserData: getUserData,
            getUserObjects: getUserObjects,
            changeUserStatus: changeUserStatus,

            getDatasource: getDatasource,
            getDataSources: getDataSources,
            getEntitiesSchema: getEntitiesSchema,
            getSqlQuerySchema: getSqlQuerySchema,

            getReports: getReports,
            deleteReport: deleteReport,
            publishReport: publishReport,
            unpublishReport: unpublishReport,
            shareReport: shareReport,
            unshareReport: unshareReport,
            getReport: getReport,
            createReport: createReport,
            updateReport: updateReport,
            getReportData: getReportData,
            getReportFilterValues: getReportFilterValues,
            getReportAsPDF: getReportAsPDF,
            getReportAsPNG: getReportAsPNG,

            getDashboards: getDashboards,
            deleteDashboard: deleteDashboard,
            getDashboard: getDashboard,
            publishDashboard: publishDashboard,
            unpublishDashboard: unpublishDashboard,
            shareDashboard: shareDashboard,
            unshareDashboard: unshareDashboard,
            createDashboard: createDashboard,
            updateDashboard: updateDashboard,
            getDashboardAsPDF: getDashboardAsPDF,
            getDashboardAsPNG: getDashboardAsPNG,

            getLayers: getLayers,
            changeLayerStatus: changeLayerStatus,
            createLayer: createLayer,
            deleteLayer: deleteLayer,
            getLayer: getLayer,
            updateLayer: updateLayer,

            getFiles: getFiles,
            uploadFile: uploadFile,

            getThemes: getThemes,
        };

        return service;

        function getVersion () {
            return $http.get('/api/version').then(res => res.data);
        }

        function getCounts () {
            return connection.get('/api/get-counts');
        }

        function getUserData () {
            return connection.get('/api/get-user-data');
        }

        function getUserObjects () {
            return connection.get('/api/get-user-objects').then(res => res.items);
        }

        function changeUserStatus (userID, newStatus) {
            const data = {
                userID: userID,
                status: newStatus,
            };

            return post('/api/admin/users/change-user-status', data);
        }

        function getDatasource (id) {
            return get('/api/data-sources/find-one', { id: id }).then(data => data.item);
        }

        function getDataSources (params) {
            return connection.get('/api/data-sources/find-all', params);
        }

        function getEntitiesSchema (dataSourceID, entity) {
            var params = {
                datasourceID: dataSourceID,
                entity: entity,
            };

            return connection.get('/api/data-sources/getEntitySchema', params);
        }

        function getSqlQuerySchema (dataSourceID, collection) {
            var params = {
                datasourceID: dataSourceID,
                collection: collection,
            };

            return connection.get('/api/data-sources/getsqlQuerySchema', params);
        }

        /**
         * Fetch multiple reports
         *
         * @param {object} params - Query parameters
         * @param {Array<string>} params.fields - List of fields to retrive
         * @param {Object<string, string>} params.filters - Filters to apply
         * @param {string} params.sort - Field to sort on
         * @param {number} params.sortType - Sort direction (1: asc, -1: desc)
         * @param {number} params.page - Page to fetch
         * @returns {Promise<object, Error>} Promise that resolves to an object
         */
        function getReports (params) {
            return get('/api/reports/find-all', params);
        }

        function deleteReport (id) {
            return connection.post('/api/reports/delete/' + id, { id: id });
        }

        function publishReport (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/reports/publish-report', data);
        }

        function unpublishReport (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/reports/unpublish', data);
        }

        function shareReport (id, folderID) {
            const data = {
                id: id,
                parentFolder: folderID,
            };

            return connection.post('/api/reports/share-report', data);
        }

        function unshareReport (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/reports/unshare', data);
        }

        /**
         * Fetch an existing report
         *
         * @param {string} id - ID of report to fetch
         * @returns {Promise<object, Error>} Promise that resolves to the report object
         */
        function getReport (id) {
            return get('/api/reports/find-one', { id: id }).then(data => data.item);
        }

        /**
         * Create a new report
         *
         * @param {object} report - Report to create
         * @returns {Promise<object, Error>} Promise that resolves to the created report
         */
        function createReport (report) {
            return post('/api/reports/create', report).then(data => data.item);
        }

        /**
         * Update an existing report
         *
         * @param {object} report - Report to update
         * @param {string} report._id - ID of report to update
         * @returns {Promise<object, Error>} Promise that resolves to the updated report
         */
        function updateReport (report) {
            return post('/api/reports/update/' + report._id, report).then(data => data.item);
        }

        /**
         * Fetch report data
         *
         * @param {object} report - Report definition
         * @param {object} options - Options
         * @param {number} options.limit - Limit the maximum number of rows used
         * @param {object} options.filters - Filters values
         */
        function getReportData (report, options = {}) {
            const params = {
                report: report,
            };

            if (options.limit && !report.properties.recordLimit) {
                params.limit = options.limit;
            }

            if (options.filters) {
                params.filters = options.filters;
            }

            return post('/api/reports/data-query', params);
        }

        function getReportFilterValues (filter) {
            return post('/api/reports/filter-values-query', { filter: filter });
        }

        /**
         * Export a report as PDF
         *
         * @param {string} id - Report ID
         * @param {object} params - Parameters
         * @param {boolean} params.displayHeaderFooter - Display header and footer
         * @param {string} params.headerTemplate - Header template
         * @param {string} params.footerTemplate - Footer template
         */
        function getReportAsPDF (id, params) {
            return post(`/api/reports/${id}/pdf`, params);
        }

        function getReportAsPNG (id) {
            return post(`/api/reports/${id}/png`);
        }

        /**
         * Fetch multiple dashboards
         *
         * @param {object} params - Query parameters
         * @param {Array<string>} params.fields - List of fields to retrive
         * @param {Object<string, string>} params.filters - Filters to apply
         * @param {string} params.sort - Field to sort on
         * @param {number} params.sortType - Sort direction (1: asc, -1: desc)
         * @param {number} params.page - Page to fetch
         * @returns {Promise<object, Error>} Promise that resolves to an object
         */
        function getDashboards (params) {
            return get('/api/dashboards/find-all', params);
        }

        function deleteDashboard (id) {
            return connection.post('/api/dashboards/delete/' + id, { id: id });
        }

        /**
         * Fetch an existing dashboard
         *
         * @param {string} id - ID of dashboard to fetch
         * @returns {Promise<object, Error>} Promise that resolves to the dashboard object
         */
        function getDashboard (id) {
            return get('/api/dashboards/find-one', { id: id }).then(data => data.item);
        }

        function publishDashboard (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/dashboards/publish-page', data);
        }

        function unpublishDashboard (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/dashboards/unpublish', data);
        }

        function shareDashboard (id, folderID) {
            const data = {
                id: id,
                parentFolder: folderID,
            };

            return connection.post('/api/dashboards/share-page', data);
        }

        function unshareDashboard (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/dashboards/unshare', data);
        }

        /**
         * Create a new dashboard
         *
         * @param {object} dashboard - Dashboard to create
         * @returns {Promise<object, Error>} Promise that resolves to the created dashboard
         */
        function createDashboard (dashboard) {
            return post('/api/dashboards/create', dashboard).then(data => data.item);
        }

        /**
         * Update an existing dashboard
         *
         * @param {object} dashboard - Dashboard to update
         * @param {string} dashboard._id - ID of dashboard to update
         * @returns {Promise<object, Error>} Promise that resolves to the updated dashboard
         */
        function updateDashboard (dashboard) {
            return post('/api/dashboards/update/' + dashboard._id, dashboard).then(data => data.item);
        }

        /**
         * Export a dashboard as PDF
         *
         * @param {string} id - Dashboard ID
         * @param {object} params - Parameters
         * @param {boolean} params.displayHeaderFooter - Display header and footer
         * @param {string} params.headerTemplate - Header template
         * @param {string} params.footerTemplate - Footer template
         */
        function getDashboardAsPDF (id, params) {
            return post(`/api/dashboards/${id}/pdf`, params);
        }

        function getDashboardAsPNG (id) {
            return post(`/api/dashboards/${id}/png`);
        }

        /**
         * Fetch multiple layers
         *
         * @param {object} params - Query parameters
         * @param {Array<string>} params.fields - List of fields to retrive
         * @param {Object<string, string>} params.filters - Filters to apply
         * @param {string} params.sort - Field to sort on
         * @param {number} params.sortType - Sort direction (1: asc, -1: desc)
         * @param {number} params.page - Page to fetch
         * @returns {Promise<object, Error>} Promise that resolves to an object
         */
        function getLayers (params) {
            return get('/api/layers/find-all', params);
        }

        function changeLayerStatus (layerID, newStatus) {
            var data = {
                layerID: layerID,
                status: newStatus,
            };

            return post('/api/layers/change-layer-status', data);
        }

        /**
         * Create a new layer
         *
         * @param {object} layer - Layer to create
         * @returns {Promise<object, Error>} Promise that resolves to the created layer
         */
        function createLayer (layer) {
            return post('/api/layers/create', layer);
        }

        function deleteLayer (id) {
            return connection.post('/api/layers/delete/' + id, { id: id });
        }

        /**
         * Fetch an existing layer
         *
         * @param {string} id - ID of layer to fetch
         * @returns {Promise<object, Error>} Promise that resolves to the layer object
         */
        function getLayer (id) {
            return get('/api/layers/find-one', { id: id }).then(data => data.item);
        }

        /**
         * Update an existing layer
         *
         * @param {object} layer - Layer object
         * @param {string} layer._id - ID of layer to be updated
         * @returns {Promise<object, Error>}
         */
        function updateLayer (layer) {
            return post('/api/layers/update/' + layer._id, layer).then(data => data.item);
        }

        function getFiles () {
            return get('/api/files/get-files').then(function (res) {
                return res.files;
            });
        }

        function uploadFile (file) {
            const config = {
                headers: {
                    'Content-Type': undefined,
                },
            };
            const data = new FormData();
            data.set('content', file);

            return $http.post('/api/files/upload', data, config).then(res => res.data.item, res => {
                throw new Error(res.statusText);
            });
        }

        /**
         * Fetch the list of available themes
         */
        function getThemes () {
            return $http.get('/api/themes').then(res => {
                return res.data;
            });
        }

        /**
         * Perform a GET request
         *
         * @param {string} url - URL of the request
         * @param {object} params - Query parameters
         * @returns {Promise<object, Error>} Promise that resolves to an object (can be undefined if not found)
         */
        function get (url, params) {
            return $http.get(url, { params: params }).then(res => {
                if (res.data.result === 0) {
                    throw new Error(res.data.msg);
                }

                return res.data;
            }, res => {
                throw new Error(res.data);
            });
        }

        /**
         * Perform a POST request
         *
         * @param {string} url - URL of the request
         * @param {object} data - Data to send as request body
         * @returns {Promise<object, Error>}
         */
        function post (url, data) {
            return $http.post(url, data).then(res => {
                if (res.data.result === 0) {
                    throw new Error(res.data.msg);
                }

                return res.data;
            }, res => {
                throw new Error(res.data);
            });
        }
    }
})();
