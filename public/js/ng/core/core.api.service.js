(function () {
    'use strict';

    angular.module('app.core').factory('api', api);

    api.$inject = ['$http', 'connection'];

    function api ($http, connection) {
        const service = {
            getVersion,

            getSharedSpace,

            getCounts,
            getUserData,
            getUserObjects,
            setViewedContextHelp,

            getRole,
            getRoles,
            createRole,
            updateRole,
            deleteRole,

            getDatasource,
            getDatasources,
            createDatasource,
            updateDatasource,
            getDatasourceCollections,
            getDatasourceCollection,
            getSqlQueryCollection,

            getReports,
            deleteReport,
            publishReport,
            unpublishReport,
            shareReport,
            unshareReport,
            getReport,
            createReport,
            updateReport,
            duplicateReport,
            getReportData,
            getReportSql,
            getReportFilterValues,
            getReportAsPDF,
            getReportAsPNG,
            isReportAsPDFAvailable,
            isReportAsPNGAvailable,

            getDashboards,
            deleteDashboard,
            getDashboard,
            getDashboardForView,
            publishDashboard,
            unpublishDashboard,
            shareDashboard,
            unshareDashboard,
            createDashboard,
            updateDashboard,
            getDashboardAsPDF,
            getDashboardAsPNG,
            isDashboardAsPDFAvailable,
            isDashboardAsPNGAvailable,

            getLayers,
            changeLayerStatus,
            createLayer,
            deleteLayer,
            getLayer,
            replaceLayer,

            getFiles,
            uploadFile,

            getThemes,

            getUsers,
            getUser,
            createUser,
            updateUser,
        };

        return service;

        function getVersion () {
            return httpGet('/api/version');
        }

        function getSharedSpace () {
            return httpGet('/api/shared-space');
        }

        function getCounts () {
            return httpGet('/api/user/counts');
        }

        function getUserData () {
            return httpGet('/api/user');
        }

        function getUserObjects () {
            return httpGet('/api/user/objects');
        }

        function setViewedContextHelp (name) {
            return httpPut('/api/user/context-help/' + name);
        }

        function getRole (id) {
            return httpGet('/api/roles/' + id);
        }

        function getRoles (params) {
            return httpGet('/api/roles', params);
        }

        function createRole (role) {
            return httpPost('/api/roles', role);
        }

        function updateRole (role) {
            return httpPatch('/api/roles/' + role._id, role);
        }

        function deleteRole (id) {
            return httpDelete('/api/roles/' + id);
        }

        function getDatasource (id) {
            return httpGet('/api/datasources/' + id);
        }

        function getDatasources (params) {
            return httpGet('/api/datasources', params);
        }

        function createDatasource (datasource) {
            return httpPost('/api/datasources', datasource);
        }

        function updateDatasource (datasourceId, changes) {
            return httpPatch('/api/datasources/' + datasourceId, changes);
        }

        function getDatasourceCollections (datasourceId) {
            return httpGet('/api/datasources/' + datasourceId + '/collections');
        }

        function getDatasourceCollection (datasourceId, collectionName) {
            return connection.get('/api/datasources/' + datasourceId + '/collections/' + collectionName);
        }

        function getSqlQueryCollection (datasourceId, collection) {
            return httpGet('/api/datasources/' + datasourceId + '/sql-query-collection', { sqlQuery: collection.sqlQuery, collectionName: collection.name });
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
            return httpGet('/api/reports/find-all', params);
        }

        function deleteReport (id) {
            return connection.post('/api/reports/delete/' + id, { id });
        }

        function publishReport (id) {
            const data = {
                id,
            };

            return connection.post('/api/reports/publish-report', data);
        }

        function unpublishReport (id) {
            const data = {
                id,
            };

            return connection.post('/api/reports/unpublish', data);
        }

        function shareReport (id, folderID) {
            const data = {
                id,
                parentFolder: folderID,
            };

            return connection.post('/api/reports/share-report', data);
        }

        function unshareReport (id) {
            const data = {
                id,
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
            return httpGet('/api/reports/find-one', { id }).then(data => data.item);
        }

        /**
         * Create a new report
         *
         * @param {object} report - Report to create
         * @returns {Promise<object, Error>} Promise that resolves to the created report
         */
        function createReport (report) {
            return httpPost('/api/reports/create', report).then(data => data.item);
        }

        /**
         * Update an existing report
         *
         * @param {object} report - Report to update
         * @param {string} report._id - ID of report to update
         * @returns {Promise<object, Error>} Promise that resolves to the updated report
         */
        function updateReport (report) {
            return httpPost('/api/reports/update/' + report._id, report).then(data => data.item);
        }

        function duplicateReport (params) {
            return getReport(params.reportId).then(function (report) {
                delete report._id;
                delete report.createdOn;
                report.reportName = params.newName;

                return createReport(report);
            });
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
                report,
            };

            if (options.limit && !report.properties.recordLimit) {
                params.limit = options.limit;
            }

            if (options.filters) {
                params.filters = options.filters;
            }

            return httpPost('/api/reports/data-query', params);
        }

        function getReportSql (report, options = {}) {
            const params = {
                report,
            };

            if (options.limit && !report.properties.recordLimit) {
                params.limit = options.limit;
            }

            if (options.filters) {
                params.filters = options.filters;
            }

            return httpPost('/api/reports/sql-query', params);
        }

        function getReportFilterValues (filter, options) {
            return httpPost('/api/reports/filter-values-query', { filter, options });
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
            return httpPost(`/api/reports/${id}/pdf`, params);
        }

        function getReportAsPNG (id, params) {
            return httpPost(`/api/reports/${id}/png`, params);
        }

        function isReportAsPDFAvailable (id) {
            return $http({ method: 'OPTIONS', url: `/api/reports/${id}/pdf` }).then(res => {
                return true;
            }, res => {
                return false;
            });
        }

        function isReportAsPNGAvailable (id) {
            return $http({ method: 'OPTIONS', url: `/api/reports/${id}/png` }).then(res => {
                return true;
            }, res => {
                return false;
            });
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
            return httpGet('/api/dashboards/find-all', params);
        }

        function deleteDashboard (id) {
            return connection.post('/api/dashboards/delete/' + id, { id });
        }

        /**
         * Fetch an existing dashboard
         *
         * @param {string} id - ID of dashboard to fetch
         * @returns {Promise<object, Error>} Promise that resolves to the dashboard object
         */
        function getDashboard (id) {
            return httpGet('/api/dashboards/find-one', { id }).then(data => data.item);
        }

        function getDashboardForView (id) {
            return httpGet('/api/dashboards/get/' + id).then(data => data.item);
        }

        function publishDashboard (id) {
            const data = {
                id,
            };

            return connection.post('/api/dashboards/publish-page', data);
        }

        function unpublishDashboard (id) {
            const data = {
                id,
            };

            return connection.post('/api/dashboards/unpublish', data);
        }

        function shareDashboard (id, folderID) {
            const data = {
                id,
                parentFolder: folderID,
            };

            return connection.post('/api/dashboards/share-page', data);
        }

        function unshareDashboard (id) {
            const data = {
                id,
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
            return httpPost('/api/dashboards/create', dashboard).then(data => data.item);
        }

        /**
         * Update an existing dashboard
         *
         * @param {object} dashboard - Dashboard to update
         * @param {string} dashboard._id - ID of dashboard to update
         * @returns {Promise<object, Error>} Promise that resolves to the updated dashboard
         */
        function updateDashboard (dashboard) {
            return httpPost('/api/dashboards/update/' + dashboard._id, dashboard).then(data => data.item);
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
            return httpPost(`/api/dashboards/${id}/pdf`, params);
        }

        function getDashboardAsPNG (id, params) {
            return httpPost(`/api/dashboards/${id}/png`, params);
        }

        function isDashboardAsPDFAvailable (id) {
            return $http({ method: 'OPTIONS', url: `/api/dashboards/${id}/pdf` }).then(res => {
                return true;
            }, res => {
                return false;
            });
        }

        function isDashboardAsPNGAvailable (id) {
            return $http({ method: 'OPTIONS', url: `/api/dashboards/${id}/png` }).then(res => {
                return true;
            }, res => {
                return false;
            });
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
            return httpGet('/api/layers', params);
        }

        function changeLayerStatus (layerID, newStatus) {
            const data = {
                status: newStatus,
            };

            return httpPatch('/api/layers/' + layerID, data);
        }

        /**
         * Create a new layer
         *
         * @param {object} layer - Layer to create
         * @returns {Promise<object, Error>} Promise that resolves to the created layer
         */
        function createLayer (layer) {
            return httpPost('/api/layers', layer);
        }

        function deleteLayer (id) {
            return httpDelete('/api/layers/' + id);
        }

        /**
         * Fetch an existing layer
         *
         * @param {string} id - ID of layer to fetch
         * @returns {Promise<object, Error>} Promise that resolves to the layer object
         */
        function getLayer (id) {
            return httpGet('/api/layers/' + id);
        }

        /**
         * Replace an existing layer
         *
         * @param {object} layer - Layer object
         * @param {string} layer._id - ID of layer to be updated
         * @returns {Promise<object>}
         */
        function replaceLayer (layer) {
            return httpPut('/api/layers/' + layer._id, layer);
        }

        function getFiles () {
            return httpGet('/api/files').then(function (res) {
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

            return $http.post('/api/files', data, config).then(res => res.data, res => {
                throw new Error(res.statusText);
            });
        }

        /**
         * Fetch the list of available themes
         */
        function getThemes () {
            return httpGet('/api/themes');
        }

        function getUsers (params) {
            return httpGet('/api/users', params);
        }

        function getUser (userId) {
            return httpGet('/api/users/' + userId);
        }

        function createUser (user) {
            return httpPost('/api/users', user);
        }

        function updateUser (id, changes) {
            return httpPatch('/api/users/' + id, changes);
        }

        /**
         * Perform a GET request
         *
         * @param {string} url - URL of the request
         * @param {object} params - Query parameters
         * @returns {Promise<object, Error>} Promise that resolves to an object (can be undefined if not found)
         */
        function httpGet (url, params) {
            return httpRequest({ method: 'GET', url, params });
        }

        /**
         * Perform a POST request
         *
         * @param {string} url - URL of the request
         * @param {object} data - Data to send as request body
         * @returns {Promise<object, Error>}
         */
        function httpPost (url, data) {
            return httpRequest({ method: 'POST', url, data });
        }

        /**
         * Perform a PATCH request
         *
         * @param {string} url - URL of the request
         * @param {object} data - Data to send as request body
         * @returns {Promise<object>}
         */
        function httpPatch (url, data) {
            return httpRequest({ method: 'PATCH', url, data });
        }

        function httpPut (url, data) {
            return httpRequest({ method: 'PUT', url, data });
        }

        function httpDelete (url) {
            return httpRequest({ method: 'DELETE', url });
        }

        function httpRequest (config) {
            return $http(config).then(res => {
                if (res.data && res.data.result === 0) {
                    throw new Error(res.data.msg);
                }

                return res.data;
            }, res => {
                if (typeof res.data === 'object' && res.data.error) {
                    throw new Error(res.data.error);
                }

                throw new Error(res.data);
            });
        }
    }
})();
