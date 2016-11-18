app.service('datasourceModel' , function ($http, $q, $filter, connection) {


    this.getDataSources = function(params, done)
    {
        connection.get('/api/data-sources/find-all', params, function(data) {

            done(data);


        });
    }

    this.getReverseEngineering = function(datasourceID, done){
        var data = {};
        data.datasourceID = datasourceID;

        connection.get('/api/data-sources/getReverseEngineering', data, function(result) {
            done(result);
        });
    };


    this.getEntitiesSchema = function(datasourceID,entities,done)
    {
        var data = {};
        data.datasourceID = datasourceID;
        data.entities = entities;


        connection.get('/api/data-sources/getEntitySchema', data, function(result) {
            if (result.result == 1) {
                done(result);
            }
        });
    }

    this.getSqlQuerySchema = function(datasourceID,sqlQuery,done)
    {
        var data = {};
        data.datasourceID = datasourceID;
        data.sqlQuery = sqlQuery;

        connection.get('/api/data-sources/getsqlQuerySchema', data, function(result) {
            if (result.result == 1) {
                done(result);
            }
        });
    }

});
