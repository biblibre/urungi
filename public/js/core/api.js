(function () {
    'use strict';

    angular.module('app.core').factory('api', api);

    api.$inject = ['connection'];

    function api (connection) {
        const service = {
            getCounts: getCounts,

            getDataSources: getDataSources,
            getEntitiesSchema: getEntitiesSchema,
            getSqlQuerySchema: getSqlQuerySchema,

            reportsFindAll: reportsFindAll,
            deleteReport: deleteReport,
            publishReport: publishReport,
            unpublishReport: unpublishReport,
            shareReport: shareReport,
            unshareReport: unshareReport,

            dashboardsFindAll: dashboardsFindAll,
            deleteDashboard: deleteDashboard,
            getDashboard: getDashboard,
            publishDashboard: publishDashboard,
            unpublishDashboard: unpublishDashboard,
            shareDashboard: shareDashboard,
            unshareDashboard: unshareDashboard,

            layersFindAll: layersFindAll,
            changeLayerStatus: changeLayerStatus,
            createLayer: createLayer,
            deleteLayer: deleteLayer,
        };

        return service;

        function getCounts () {
            return connection.get('/api/get-counts');
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

        function reportsFindAll (params) {
            return connection.get('/api/reports/find-all', params);
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

        function dashboardsFindAll (params) {
            return connection.get('/api/dashboardsv2/find-all', params);
        }

        function deleteDashboard (id) {
            return connection.post('/api/dashboardsv2/delete/' + id, { id: id });
        }

        function getDashboard (id) {
            const data = {
                id: id,
            };

            return connection.get('/api/dashboardsv2/get/' + id, data).then(res => res.item);
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

        function layersFindAll (params) {
            return connection.get('/api/layers/find-all', params);
        }

        function changeLayerStatus (layerID, newStatus) {
            var data = {
                layerID: layerID,
                status: newStatus,
            };

            return connection.post('/api/layers/change-layer-status', data);
        }

        function createLayer (layer) {
            return connection.post('/api/layers/create', layer);
        }

        function deleteLayer (id) {
            return connection.post('/api/layers/delete/' + id, { id: id });
        }
    }
})();
