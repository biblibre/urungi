(function () {
    'use strict';

    angular.module('app.core').factory('api', api);

    api.$inject = ['connection'];

    function api (connection) {
        const service = {
            getDataSources: getDataSources,
            getEntitiesSchema: getEntitiesSchema,
            getSqlQuerySchema: getSqlQuerySchema,
        };

        return service;

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
    }
})();
