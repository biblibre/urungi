app.controller('dataSourceCtrl', function ($scope, connection, $routeParams, dataSourceNameModal ) {

    $scope.activeForm = 'partials/data-source/source_wizard_index.html';
    $scope.selectedCollections = [];

    $scope.elementTypes = [{name:"object",value:"object"},
        {name:"string",value:"string"},
        {name:"number",value:"number"},
        {name:"boolean",value:"boolean"},
        {name:"date",value:"date"}];
    /*
    $scope.add = function() {

        $scope._DataSource = {};
        $scope._DataSource.parameters = {};
        $scope._DataSource.status = 1;

        $scope.mode = 'add';
        $scope.subPage= '/partial/custom/Badges/form.html';

    };
    */

    init();

    function init()
    {
        console.log('entering init');
        if ($routeParams.newDataSource) {
            if ($routeParams.newDataSource == 'true') {
                $scope._DataSource = {};
                $scope._DataSource.params = [];
                $scope._DataSource.status = 1;
                $scope._DataSource.type = 'MONGODB';
                //$scope._DataSource.companyID = 'XXXXXX';
                $scope.mode = 'add';

                console.log('entering in add mode for datasource')
            }
        } /*else {
            $scope.getDataSources(1,'',['type','params.connection.host']);
        }   */
    };

    $scope.save = function() {



        var parameters = {};

        parameters.connection = $scope._Parameters;
        parameters.schema = $scope.schemas;

        $scope._DataSource.params.push(parameters);

        var data = $scope._DataSource;


        console.log('saving data source '+data.reportName);



        if ($scope.mode == 'add') {
            connection.post('/api/data-sources/create', data, function(data) {
                $scope.items.push(data.item);

                $scope.cancel();
            });
        }
        else {
            $scope.edit_id = data._id;

            connection.post('/api/data-sources/update/'+data._id, data, function(result) {
                if (result.result == 1) {
                    for (i = 0; i < $scope.items.length; i++) {
                        if ($scope.items[i]._id == data._id) {
                            $scope.items[i] = data;
                        }
                    }
                    $scope.cancel();
                }
            });
        }
    };


    $scope.fileSourceSelected  = function()
    {
        $scope.activeForm = 'partials/data-source/source_wizard_file1.html';

    }

    $scope.fileSourceFileSelected  = function()
    {
        $scope.activeForm = 'partials/data-source/source_wizard_file1.html';

    }

    $scope.fileSourceS3Selected  = function()
    {
        $scope.activeForm = 'partials/data-source/source_wizard_file2_s3.html';
                $scope._Parameters = {};
                $scope._Parameters.draft = true;
                $scope._Parameters.badgeStatus = 0;
                $scope._Parameters.exportable = true;
                $scope._Parameters.badgeMode = 1;

    }

    $scope.mongoSourceSelected  = function()
    {
        $scope.activeForm = 'partials/data-source/source_wizard_mongo.html';
        $scope.mongoStep = 1;
        $scope._Parameters = {};
        $scope._Parameters.port = 27017;
        $scope._Parameters.host = '54.154.195.107';
        $scope._Parameters.database = 'testIntalligent';




    }

    $scope.setMongoStep = function(step)
    {
        $scope.mongoStep = step;
    }


    $scope.testS3Connection = function()
    {

        var data = {};
        data.accessKey = $scope._Parameters.accessKey;
        data.secret = $scope._Parameters.secret;
        data.bucket = $scope._Parameters.bucket;
        data.region = $scope._Parameters.region;
        data.folder = $scope._Parameters.folder;


        console.log(data);

        connection.post('/api/data-sources/testS3Connection', data, function(result) {
            //console.log(result);

        });
    }


    $scope.testMongoConnection = function()
    {
        var data = {};
        data.host = $scope._Parameters.host;
        data.port = $scope._Parameters.port;
        data.database = $scope._Parameters.database;
        data.userName = $scope._Parameters.userName;
        data.password = $scope._Parameters.password;


        console.log(data);

        connection.post('/api/data-sources/testMongoConnection', data, function(result) {
            console.log(result);
            if (result.result == 1) {

                $scope.items = result.items;
                $scope.mongoStep = 2;


            }
        });
    }


    $scope.getCollectionsSchema = function()
    {
        var data = {};
        data.host = $scope._Parameters.host;
        data.port = $scope._Parameters.port;
        data.database = $scope._Parameters.database;
        data.userName = $scope._Parameters.userName;
        data.password = $scope._Parameters.password;
        data.collections = $scope.selectedCollections;


        console.log(data);

        connection.post('/api/data-sources/getMongoSchemas', data, function(result) {
            //console.log(result);
            if (result.result == 1) {

                $scope.schemas = result.items;

                console.log(JSON.stringify($scope.schemas));

                //var element = {colectionName: collectionName,elementName:name,elementType:type}
                //console.log(result.items);
                $scope.mongoStep = 3;


            }
        });
    }

    $scope.saveDatasource = function () {


        var modalOptions    = {
            container: 'dataSourceName',
            containerID: '12345',//$scope._Report._id,
            tracking: true,
            dataSource: $scope._DataSource
        }



        //$scope.sendHTMLtoEditor(dataset[field])

        dataSourceNameModal.showModal({}, modalOptions).then(function (result) {


            $scope.save();
            /*
             var container = angular.element(document.getElementById(source));
             container.children().remove();
             //var theHTML = ndDesignerService.getOutputHTML();
             theTemplate = $compile(theHTML)($scope);
             container.append(theTemplate);


             dataset[field] = theHTML;

             if ($scope._posts.postURL && $scope._posts.title && $scope._posts.status)
             {
             //console.log('saving post');
             $scope.save($scope._posts, false);
             }
             //console.log(theHTML);
             */
        });


    }

    $scope.getDataSources = function(page, search, fields) {
        var params = {};

        params.page = (page) ? page : 1;

        if (search) {
            $scope.search = search;
        }
        else if (page == 1) {
            $scope.search = '';
        }
        if ($scope.search) {
            params.search = $scope.search;
        }

        if (fields) params.fields = fields;

        connection.get('/api/data-sources/find-all', params, function(data) {
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;


        });
    };

    $scope.getDataSource = function() {


           {

           }

    }

    $scope.edit = function() {
        if ($routeParams.dataSourceID)
        {
            connection.get('/api/data-sources/find-one', {id: $routeParams.dataSourceID}, function(data) {

                //console.log(JSON.stringify(data.item));

                $scope._dataSource = data.item;
                /*
                if ($scope._Badges.positionID) {
                    $scope.setSelectedPosition($scope._Badges.positionID);
                }

                $scope.mode = 'edit';
                $scope.subPage= '/partial/custom/Badges/form.html';
                */
            });
        };
    };


});
