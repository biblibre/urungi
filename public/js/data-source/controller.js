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
        if ($scope.mode == 'add') {
            var parameters = {};

            parameters.connection = $scope._Parameters;
            parameters.schema = $scope.schemas;

            $scope._DataSource.params.push(parameters);

            var data = $scope._DataSource;


            console.log('saving data source '+data.reportName);

            connection.post('/api/data-sources/create', data, function(data) {
                $scope.items.push(data.item);

                $scope.cancel();
            });
        }
        else {
            console.log($scope._dataSource);

            $scope._dataSource.params[0].schema = removeUnselected($scope._dataSource.params[0].schema);

            for (var i in $scope.schemas) {
                if ($scope.schemas[i].selected) {
                    $scope._dataSource.params[0].schema.push($scope.schemas[i]);
                }
            }

            for (var i in $scope._dataSource.params[0].schema) {
                for (var j in $scope._dataSource.params[0].schema[i].elements) {
                    if ($scope._dataSource.params[0].schema[i].elements[j].elementLabel == '' || $scope._dataSource.params[0].schema[i].elements[j].elementName == '') {
                        $scope._dataSource.params[0].schema[i].elements[j].selected = false;
                    }
                }

                $scope._dataSource.params[0].schema[i].elements = removeUnselected($scope._dataSource.params[0].schema[i].elements);

                delete($scope._dataSource.params[0].schema[i].selected);
                delete($scope._dataSource.params[0].schema[i].isOpen);
                delete($scope._dataSource.params[0].schema[i].isNew);

                for (var j in $scope._dataSource.params[0].schema[i].elements) {
                    delete($scope._dataSource.params[0].schema[i].elements[j].selected);
                    delete($scope._dataSource.params[0].schema[i].elements[j].isNew);
                }
            }

            connection.post('/api/data-sources/update/'+$scope._dataSource._id, $scope._dataSource, function(result) {
                console.log(result);
                if (result.result == 1) {
                    window.history.back();
                }
            });
        }
    };

    function removeUnselected(items) {
        for (var i in items) {
            if (!items[i].selected) {
                items.splice(i, 1);
                return removeUnselected(items);
            }
        }
        return items;
    }

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

    $scope.view = function() {
        if ($routeParams.dataSourceID)
        {
            connection.get('/api/data-sources/find-one', {id: $routeParams.dataSourceID}, function(data) {

                //console.log(JSON.stringify(data.item));

                $scope._dataSource = data.item;
                console.log($scope._dataSource);
                //params: Array[1]0: connection: {database: "testIntalligent"host: "54.154.195.107"port: 27017}

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

    $scope.elementTypes = [
        {name: 'String', value: 'string'},
        {name: 'Number', value: 'number'},
        {name: 'Object', value: 'object'},
        {name: 'Date', value: 'date'},
        {name: 'Array', value: 'array'},
        {name: 'Boolean', value: 'boolean'}
    ];

    $scope.edit = function() {
        if ($routeParams.dataSourceID)
        {
            connection.get('/api/data-sources/find-one', {id: $routeParams.dataSourceID}, function(data) {
                $scope._dataSource = data.item;
                console.log($scope._dataSource);

                //params: Array[1]0: connection: {database: "testIntalligent"host: "54.154.195.107"port: 27017}

                for (var i in $scope._dataSource.params[0].schema) {
                    $scope._dataSource.params[0].schema[i].selected = true;

                    for (var j in $scope._dataSource.params[0].schema[i].elements) {
                        $scope._dataSource.params[0].schema[i].elements[j].selected = true;
                    }
                }

                connection.post('/api/data-sources/testMongoConnection', $scope._dataSource.params[0].connection, function(result) {
                    console.log(result);

                    var collections = [];

                    for (var i in result.items) {
                        collections.push(result.items[i].name);
                    }

                    var params = {
                        host: $scope._dataSource.params[0].connection.host,
                        port: $scope._dataSource.params[0].connection.port,
                        database: $scope._dataSource.params[0].connection.database,
                        collections: collections
                    };

                    $scope.loadingNewCollections = true;

                    connection.post('/api/data-sources/getMongoSchemas', params, function(result) {
                        console.log(result);

                        $scope.schemas = [];

                        for (var i in result.items) {
                            var found = false;

                            for (var j in $scope._dataSource.params[0].schema) {
                                if (result.items[i].collectionName == $scope._dataSource.params[0].schema[j].collectionName) {
                                    for (var e in result.items[i].elements) {
                                        var elementFound = false;

                                        for (var ej in $scope._dataSource.params[0].schema[j].elements) {
                                            if (result.items[i].elements[e].elementName == $scope._dataSource.params[0].schema[j].elements[ej].elementName) {
                                                elementFound = true;
                                                break;
                                            }
                                        }

                                        if (!elementFound) {
                                            result.items[i].elements[e].isNew = true;
                                            $scope._dataSource.params[0].schema[j].elements.push(result.items[i].elements[e]);
                                        }
                                    }

                                    found = true;
                                    break;
                                }
                            }

                            if (!found) {
                                result.items[i].isNew = true;

                                for (var e in result.items[i].elements) {
                                    result.items[i].elements[e].isNew = true;
                                }

                                $scope.schemas.push(result.items[i]);
                            }
                        }

                        $scope.loadingNewCollections = false;

                        //elements: Array[17]0: ObjectelementID: "99181711-971a-453d-be90-8556c5844f8a"elementLabel: "_id"elementName: "_id"elementType: "object"visible: false__proto__: Object1: ObjectelementID: "9641ce17-5c04-412b-bfaf-d5cbfbf4f744"elementLabel: "content"elementName: "content"elementType: "string"visible: true


                    });
                });
            });
        }
    };

    $scope.onCollectionSelectionChange = function(collection) {
        for (var i in collection.elements) {
            collection.elements[i].selected = collection.selected;
        }
    };
    $scope.onElementSelectionChange = function(collection) {
        var selected = false;

        for (var i in collection.elements) {
            if (collection.elements[i].selected) {
                selected = true;
                break;
            }
        }

        collection.selected = selected;
    };
    $scope.addNewElement = function(collection) {
        var element = {
            selected: true,
            elementLabel: "",
            visible: true,
            elementType: "string",
            elementName: "",
            elementID: new ObjectId().toString()
        };
        console.log(element);
        collection.elements.push(element);
    };
    $scope.addValueToElement = function(element, value, label) {
        if (!element.values) element.values = [];

        element.values.push({value: value, label: label});
    };
    $scope.onElementTypeChange = function(collection, element) {
        console.log(element);

        var params = {datasourceID: $scope._dataSource._id, collectionID: collection.collectionID, elementName: element.elementName};

        if (element.elementType == 'array') {
            connection.get('/api/data-sources/get-element-distinct-values', params, function(data) {
                for (var i in data.items) {
                    $scope.addValueToElement(element, data.items[i], data.items[i]);
                }
            });
        }
    };

});
