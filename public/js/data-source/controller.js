app.controller('dataSourceCtrl', function ($scope, connection, $routeParams, dataSourceNameModal,datasourceModel ) {

    $scope.activeForm = 'partials/data-source/source_wizard_index.html';
    $scope.selectedCollections = [];

    init();

    function init()
    {
        console.log('entering init');
        if ($routeParams.newDataSource) {
            if ($routeParams.newDataSource == 'true') {
                $scope._DataSource = {};
                $scope._DataSource.params = [];
                $scope._DataSource.params.push({connection:{}})
                $scope._DataSource.status = 1;
                $scope._DataSource.type = 'MONGODB';
                //$scope._DataSource.companyID = 'XXXXXX';

                $scope.mode = 'add';

                console.log('entering in add mode for datasource');

            }
        } else {
             if ($routeParams.dataSourceID)
             {
                connection.get('/api/data-sources/find-one', {id: $routeParams.dataSourceID}, function(data) {
                    $scope._DataSource = data.item;
                });
             };
        }
    };

    $scope.save = function() {


        if ($scope.mode == 'add') {

            var data = $scope._DataSource;
            connection.post('/api/data-sources/create', data, function(data) {
                //$scope.items.push(data.item);
                window.history.back();
            });
        } else {
        console.log($scope._dataSource);
            connection.post('/api/data-sources/update/'+$scope._DataSource._id, $scope._DataSource, function(result) {
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
        console.log('mongo selected');
        $scope.activeForm = '/partials/data-source/source_wizard_mongo.html';
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


    $scope.testConnection = function()
    {
        console.log('entering test connection')
        var data = {};
        data.type = $scope._DataSource.type;
        data.host = $scope._DataSource.params[0].connection.host;
        data.port = $scope._DataSource.params[0].connection.port;
        data.database = $scope._DataSource.params[0].connection.database;
        data.userName = $scope._DataSource.params[0].connection.userName;
        data.password = $scope._DataSource.params[0].connection.password;

        connection.post('/api/data-sources/testConnection', data, function(result) {
            if (result.result == 1) {
                $scope.testConnection = {result:1,message:"Successful database connection."};
            } else {
                $scope.testConnection = {result:0,message:"Database connection failed."};
            }
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

        datasourceModel.getDataSources(params, function(data){
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
        });

        /*
        connection.get('/api/data-sources/find-all', params, function(data) {
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;


        });*/
    };

    $scope.getDataSource = function() {


           {

           }

    }


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






    function getElement(elementID)
    {

    }




});

app.directive('postRender', [ '$timeout', function($timeout) {
    var def = {
        restrict : 'A',
        terminal : true,
        transclude : true,
        link : function(scope, element, attrs) {
            $timeout(scope.redraw, 0);  //Calling a scoped method
        }
    };
    return def;
}]);


//directives link user interactions with $scope behaviours
//now we extend html with <div plumb-item>, we can define a template <> to replace it with "proper" html, or we can
//replace it with something more sophisticated, e.g. setting jsPlumb arguments and attach it to a double-click
//event
app.directive('plumbItem', function() {
    return {
        replace: true,
        controller: 'PlumbCtrl',
        link: function (scope, element, attrs) {
            console.log("Add plumbing for the 'item' element");

            jsPlumb.makeTarget(element, {
                anchor: 'Continuous',
                maxConnections: 2,
            });
            jsPlumb.draggable(element, {
                containment: 'parent'
            });

            // this should actually done by a AngularJS template and subsequently a controller attached to the dbl-click event
            element.bind('dblclick', function(e) {
                jsPlumb.detachAllConnections($(this));
                $(this).remove();
                // stop event propagation, so it does not directly generate a new state
                e.stopPropagation();
                //we need the scope of the parent, here assuming <plumb-item> is part of the <plumbApp>
                scope.$parent.removeState(attrs.identifier);
                scope.$parent.$digest();
            });

        }
    };
});

//
// This directive should allow an element to be dragged onto the main canvas. Then after it is dropped, it should be
// painted again on its original position, and the full module should be displayed on the dragged to location.
//
app.directive('plumbMenuItem', function() {
    return {
        replace: true,
        controller: 'PlumbCtrl',
        link: function (scope, element, attrs) {
            console.log("Add plumbing for the 'menu-item' element");

            // jsPlumb uses the containment from the underlying library, in our case that is jQuery.
            jsPlumb.draggable(element, {
                containment: element.parent().parent()
            });
        }
    };
});

app.directive('plumbConnect', function() {
    return {
        replace: true,
        link: function (scope, element, attrs) {
            console.log("Add plumbing for the 'connect' element");

            jsPlumb.makeSource(element, {
                parent: $(element).parent(),
//				anchor: 'Continuous',
                paintStyle:{
                    strokeStyle:"#225588",
                    fillStyle:"transparent",
                    radius:7,
                    lineWidth:2
                },
            });
        }
    };
});
