(function () {
    'use strict';

    angular.module('app.core').factory('api', api);

    api.$inject = ['$http', 'connection'];

    function api ($http, connection) {
        const service = {
            getCounts: getCounts,
            getUserData: getUserData,
            getUserObjects: getUserObjects,

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

            getDashboards: getDashboards,
            deleteDashboard: deleteDashboard,
            getDashboard: getDashboard,
            publishDashboard: publishDashboard,
            unpublishDashboard: unpublishDashboard,
            shareDashboard: shareDashboard,
            unshareDashboard: unshareDashboard,
            createDashboard: createDashboard,
            updateDashboard: updateDashboard,

            getLayers: getLayers,
            changeLayerStatus: changeLayerStatus,
            createLayer: createLayer,
            deleteLayer: deleteLayer,
            getLayer: getLayer,
            updateLayer: updateLayer,
        };

        return service;

        function getCounts () {
            return connection.get('/api/get-counts');
        }

        function getUserData () {
            return connection.get('/api/get-user-data');
        }

        function getUserObjects () {
            return connection.get('/api/get-user-objects').then(res => res.items);
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
            return get('/api/dashboardsv2/find-all', params);
        }

        function deleteDashboard (id) {
            return connection.post('/api/dashboardsv2/delete/' + id, { id: id });
        }

        /**
         * Fetch an existing dashboard
         *
         * @param {string} id - ID of dashboard to fetch
         * @returns {Promise<object, Error>} Promise that resolves to the dashboard object
         */
        function getDashboard (id) {
            return get('/api/dashboardsv2/find-one', { id: id }).then(data => data.item);
        }

        function publishDashboard (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/dashboardsv2/publish-page', data);
        }

        function unpublishDashboard (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/dashboardsv2/unpublish', data);
        }

        function shareDashboard (id, folderID) {
            const data = {
                id: id,
                parentFolder: folderID,
            };

            return connection.post('/api/dashboardsv2/share-page', data);
        }

        function unshareDashboard (id) {
            const data = {
                id: id,
            };

            return connection.post('/api/dashboardsv2/unshare', data);
        }

        /**
         * Create a new dashboard
         *
         * @param {object} dashboard - Dashboard to create
         * @returns {Promise<object, Error>} Promise that resolves to the created dashboard
         */
        function createDashboard (dashboard) {
            return post('/api/dashboardsv2/create', dashboard).then(data => data.item);
        }

        /**
         * Update an existing dashboard
         *
         * @param {object} dashboard - Dashboard to update
         * @param {string} dashboard._id - ID of dashboard to update
         * @returns {Promise<object, Error>} Promise that resolves to the updated dashboard
         */
        function updateDashboard (dashboard) {
            return post('/api/dashboardsv2/update/' + dashboard._id, dashboard).then(data => data.item);
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

            return connection.post('/api/layers/change-layer-status', data);
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
