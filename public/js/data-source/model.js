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


        console.log(data);

        connection.get('/api/data-sources/getEntitySchema', data, function(result) {
            //console.log(result);
            if (result.result == 1) {

                done(result);
                /*
                $scope.schemas = result.items;

                console.log(JSON.stringify($scope.schemas));

                //var element = {colectionName: collectionName,elementName:name,elementType:type}
                //console.log(result.items);
                $scope.mongoStep = 3;
                  */

            }
        });
    }

});
