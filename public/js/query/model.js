app.service('queryModel' , function ($http, $q, $filter, connection) {
    this.data = null;
    this.scope = null;
    this.selectedReport = null;



    this.getQueryData = function($scope,query, done) {
        getQueryData($scope,query, done);
    };

    function getQueryData($scope,query, done) {
        //console.log('getReportData');

            var params = {};
            params.query = query;


            connection.get('/api/reports/get-data', params, function(data) {
                //console.log('me he traido los datos',JSON.stringify(data));
                prepareData($scope,query,data, function(result)
                {
                    done(result);
                    //console.log('resultados',JSON.stringify(result));
                });

                //done(data);
            });

    };

    this.getData = function($scope,query, params,  done) {
        params.query = query;
        connection.get('/api/reports/get-data', params, function(data) {
            console.log(data);
            done(data);
        });
    }

    function prepareData($scope,query,data,done)
    {

        var dateTimeReviver = function (key, value) {
            var a;
            if (typeof value === 'string') {
                a = /\/Date\((\d*)\)\//.exec(value);
                if (a) {
                    return new Date(+a[1]);
                }
            }
            return value;
        }

        done(JSON.parse(JSON.stringify(data),dateTimeReviver));


    }

    this.getDistinct = function($scope,attribute) {

        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.datasources = [];

        console.log('the filter attribute ', attribute);

        var datasourcesList = [];
        var layersList = [];
        datasourcesList.push(attribute.datasourceID);
        layersList.push(attribute.layerID);


        for (var i in datasourcesList) {

            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];
            dtsCollections.push(attribute.collectionID);



            for (var n in dtsCollections) {

                var collection = {};
                collection.collectionID = dtsCollections[n];

                collection.columns = [];
                collection.columns.push(attribute);

                collection.order = [];
                collection.order.push(attribute);

                for (var n1 in $scope.order) {
                    if ($scope.order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push($scope.order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;



        this.getData($scope, query, {page: 0}, function(data) {

            if (data.items)
                data = data.items;

            $scope.searchValues = data;
            console.log('The data: ',JSON.stringify(data));
            $scope.errorMsg = (data.result === 0) ? data.msg : false;
            $scope.page = data.page;
            $scope.pages = data.pages;
            //$scope.data = data;
        });




    }

});