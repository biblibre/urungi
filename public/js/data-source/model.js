app.service('datasourceModel', function ($http, $q, $filter, connection) {
    this.getDataSources = function (params, done) {
        connection.get('/api/data-sources/find-all', params, done);
    };

    this.getEntitiesSchema = function (datasourceID, entity, done) {
        var data = {};
        data.datasourceID = datasourceID;
        data.entity = entity;

        connection.get('/api/data-sources/getEntitySchema', data, function (result) {
            if (result.result === 1) {
                done(result);
            }
        });
    };

    this.getSqlQuerySchema = function (datasourceID, collection, done) {
        var data = {};
        data.datasourceID = datasourceID;
        data.collection = collection;

        connection.get('/api/data-sources/getsqlQuerySchema', data, function (result) {
            if (result.result === 1) {
                done(result);
            }
        });
    };
});
