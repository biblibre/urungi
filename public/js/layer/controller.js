app.controller('layerCtrl', function ($scope,$rootScope,connection,$routeParams,datasourceModel,uuid2 ) {
    $scope.layerModal = 'partials/layer/layerModal.html';
    $scope.datasetModal = 'partials/layer/datasetModal.html';
    $scope.elementModal = 'partials/layer/elementModal.html';
    $scope.datasetPropertiesModal  = 'partials/layer/datasetPropertiesModal.html';
    $scope.items =  [];
    $scope.elementTypes = [{name:"object",value:"object"},
        {name:"string",value:"string"},
        {name:"number",value:"number"},
        {name:"boolean",value:"boolean"},
        {name:"date",value:"date"},
        {name:"array",value:"array"}
    ];

    $scope.numberDefaultAggregation = [{name:"original value",value:"value"},
        {name:"SUM",value:"sum"},
        {name:"AVG",value:"avg"},
        {name:"MIN",value:"min"},
        {name:"MAX",value:"max"}
    ];

    $scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};

    $scope.deletingJoin = false;
    $scope.elementEditing = false;



    $scope.newLayer = function ()
    {
        $scope._Layer = {};
        $scope._Layer.params = {};
        $scope._Layer.status = 'Not active';
        $scope.mode = 'add';
        $('#layerModal').modal('show');
    }

    $scope.changeLayerStatus = function(layer)
    {
        if ($rootScope.isWSTADMIN)
        {

            if (layer.status == 'active')
                var newStatus = 'Not active';
            if (layer.status == 'Not active')
                var newStatus = 'active';

            var data = {layerID: layer._id, status: newStatus}

            connection.post('/api/layers/change-layer-status', data, function(result) {
                layer.status = newStatus;
            });
        }
    }

    $scope.view = function() {
        if ($routeParams.layerID)
        {
            connection.get('/api/layers/find-one', {id: $routeParams.layerID}, function(data) {
                $scope._Layer = data.item;
                $scope.mode == 'edit';
                //$scope.$apply();
                //console.log('me he traido el layer...'+ JSON.stringify($scope._Layer));
                $scope.rootItem.elements = $scope._Layer.objects;


                if ($scope._Layer.params)

                {
                    $scope.erDiagramInit();
                }
                else {
                    $scope._Layer.params = {};
                    $scope._Layer.params.schema = [];

                }

            });
        };
    };


    $scope.save = function() {
        if ($scope.mode == 'add') {
            $scope._Layer.objects = $scope.rootItem.elements;
            var data = $scope._Layer;
            connection.post('/api/layers/create', data, function(data) {
                $scope.items.push(data.item);
                $scope.cancel();
                $('#layerModal').modal('hide');
            });

        } else {

        var theLayer = $scope._Layer;
            //clean parameters just for the view...

            for (var collection in theLayer.params.schema)
            {

                for (var element in theLayer.params.schema[collection].elements)
                {

                    if (theLayer.params.schema[collection].elements[element].painted)

                        theLayer.params.schema[collection].elements[element].painted = false;



                }
            }

            connection.post('/api/layers/update/'+theLayer._id, theLayer, function(result) {
                console.log(result);
                if (result.result == 1) {
                    window.history.back();
                }
            });
        }
    };


    $scope.getLayers = function(page, search, fields) {
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

        connection.get('/api/layers/find-all', params, function(data) {
            $scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;


        });
    };

    $scope.getDatasources = function()
    {
        console.log('getting datasources');

        var params = {};

        params.page = 1;

        params.fields = ['name','type','params.connection.host','params.connection.port','params.connection.database'];

        datasourceModel.getDataSources(params, function(data){
            $scope.datasources = data.items;
        });
    }

    $scope.addDataset = function ()
    {
        console.log('add dataset');
        $scope.selectedDts = {};
        $scope.selectedEntities = [];
        $('#datasetModal').modal('show');
    }

    $scope.setSelectedEntity = function (entity)
    {
        if ($scope.selectedEntities.indexOf(entity) == -1)
        {
            $scope.selectedEntities.push(entity);
        } else {
            var index = $scope.selectedEntities.indexOf(entity);
            $scope.selectedEntities.splice(index, 1);
        }

    }

    $scope.addToLayer = function ()
    {
        if ($scope.selectedEntities.length > 0)
        {
            datasourceModel.getEntitiesSchema($scope.selectedDts.id,$scope.selectedEntities,function(result){


                if (result.result == 1)
                {
                console.log('uno');

                    for (i in result.items)
                    {
                        console.log('dos',result.items[i]);

                        result.items[i].datasourceID = $scope.selectedDts.id;

                        for (e in result.items[i].elements)
                        {
                            result.items[i].elements[e].datasourceID = $scope.selectedDts.id;
                            result.items[i].elements[e].collectionID = result.items[i].collectionID;
                            result.items[i].elements[e].collectionName = result.items[i].collectionName;
                        }

                        //Add the count element
                        var theCountElement = {};
                        theCountElement.elementName = 'WSTcount'+result.items[i].collectionName;
                        theCountElement.elementLabel = 'Count'+' '+result.items[i].collectionLabel;
                        theCountElement.datasourceID = $scope.selectedDts.id;
                        theCountElement.collectionID = result.items[i].collectionID;
                        theCountElement.collectionName = result.items[i].collectionName;
                        theCountElement.elementID = result.items[i].collectionID+'#count#',
                        theCountElement.elementType = 'number';
                        theCountElement.count = true;

                        result.items[i].elements.unshift(theCountElement);


                        if (!$scope._Layer.params)
                            $scope._Layer.params = {};
                        if (!$scope._Layer.params.schema)
                            $scope._Layer.params.schema = [];

                        $scope._Layer.params.schema.push(result.items[i]);



                        //console.log('añadido uno');

                    }
                    //$scope.$apply();
                    $('#datasetModal').modal('hide');
                    $scope.erDiagramInit();

            }
            });
        }
    }

    $scope.getDatasetsForDts = function (_id)
    {
        console.log('The selected datasource  '+$scope.selectedDts.id);
        console.log('The selected id  '+_id);
        connection.get('/api/data-sources/getEntities', {id: $scope.selectedDts.id}, function(data) {
            $scope.datasetEntities = data.items;
            console.log('entities '+JSON.stringify($scope.datasetEntities));
        });
    }


    function getElement(elementID)
    {
        for (var collection in $scope._Layer.params.schema)
        {
            for (var element in $scope._Layer.params.schema[collection].elements)
            {
                if ($scope._Layer.params.schema[collection].elements[element].elementID == id)
                    return $scope._Layer.params.schema[collection].elements[element];
            }
        }
    }

    function getElementAndCollection(elementID)
    {
        var foundedElement = {};

        for (var collection in $scope._Layer.params.schema)
        {
            for (var element in $scope._Layer.params.schema[collection].elements)
            {
                if ($scope._Layer.params.schema[collection].elements[element].elementID == id)
                {
                    foundedElement.elementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                    foundedElement.collectionID = $scope._Layer.params.schema[collection].collectionID;
                }
            }
        }
    }

    function makeJoin(sourceID,targetID)
    {
        if(!$scope._Layer.params.joins)
            $scope._Layer.params.joins = [];

        var found = false;
        //First verify that the join does not exists
        for (var j in $scope._Layer.params.joins)
        {
            if ($scope._Layer.params.joins[j].sourceElementID == sourceID && $scope._Layer.params.joins[j].targetElementID == targetID)
            {
                found = true;
                //console.log('previous join founded');
            }
        }

        if (found == false)
        {
                var join = {};
                join.joinID = uuid2.newguid();

                for (var collection in $scope._Layer.params.schema)
                {
                    for (var element in $scope._Layer.params.schema[collection].elements)
                    {
                        if ($scope._Layer.params.schema[collection].elements[element].elementID == sourceID)
                        {
                            join.sourceElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.sourceElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.sourceCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.sourceCollectionName = $scope._Layer.params.schema[collection].collectionName;
                            console.log('the collection name',$scope._Layer.params.schema[collection].collectionName);
                        }

                        if ($scope._Layer.params.schema[collection].elements[element].elementID == targetID)
                        {
                            join.targetElementID = $scope._Layer.params.schema[collection].elements[element].elementID;
                            join.targetElementName = $scope._Layer.params.schema[collection].elements[element].elementName;
                            join.targetCollectionID = $scope._Layer.params.schema[collection].collectionID;
                            join.targetCollectionName = $scope._Layer.params.schema[collection].collectionName;
                            console.log('the collection name 2',$scope._Layer.params.schema[collection].collectionName);
                        }
                    }
                }

               // console.log('the join',JSON.stringify(join));

                if (join.sourceElementID && join.sourceCollectionID && join.targetElementID && join.targetCollectionID)
                {
                    join.joinType = 'default';
                    $scope._Layer.params.joins.push(join);
                    //console.log('join pushed');
                }
        }


    }

    function deleteJoin(sourceID,targetID)
    {
        if(!$scope._Layer.params.joins)
            $scope._Layer.params.joins = [];

        var found = false;
        //First verify that the join does not exists
        for (var j in $scope._Layer.params.joins)
        {
            if ($scope._Layer.params.joins[j].sourceElementID == sourceID && $scope._Layer.params.joins[j].targetElementID == targetID)
            {
                found = true;
                $scope._Layer.params.joins.splice(j,1);
                console.log('join deleted');
            }
        }
    }

    var instance;

    $scope.erDiagramInit = function() {

        //this timeout is here to give time to angular to create the element's divs'
        setTimeout(function () {
              instance = jsPlumb.getInstance({
                // default drag options
                Endpoint: ["Dot", {radius: 2}],

                DragOptions: { cursor: 'pointer', zIndex: 2000 },
                // the overlays to decorate each connection with.  note that the label overlay uses a function to generate the label text; in this
                // case it returns the 'labelText' member that we set on each connection in the 'init' method below.
                ConnectionOverlays: [

                ],

                Container: "canvas"
            });

            var rightJoinType = {
                connector: "StateMachine",
                paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "blue" },
                overlays: [
                    ["Diamond" , { location: 1 }]
                ]

            };

            var leftJoinType = {
                connector: "StateMachine",
                paintStyle: { strokeStyle: "#61B7CF", lineWidth: 4 },
                hoverPaintStyle: { strokeStyle: "blue" },
                overlays: [
                    ["Diamond" , { location: 0 }]
                ]

            };

            instance.registerConnectionType("right", rightJoinType);
            instance.registerConnectionType("left", leftJoinType);

            var connectorPaintStyle = {
                    lineWidth: 4,
                    strokeStyle: "#61B7CF",
                    joinstyle: "round",
                    outlineColor: "white",
                    outlineWidth: 2
                },
            // .. and this is the hover style.
                connectorHoverStyle = {
                    lineWidth: 4,
                    strokeStyle: "#216477",
                    outlineWidth: 2,
                    outlineColor: "white"
                },
                endpointHoverStyle = {
                    fillStyle: "#000000",
                    strokeStyle: "#000000"    //strokeStyle: "#216477"
                },

            // the definition of source endpoints (the small blue ones)
                sourceEndpoint = {
                    endpoint: "Dot",
                    paintStyle: {
                        strokeStyle: "#7AB02C",
                        fillStyle: "transparent",
                        radius: 6,
                        lineWidth: 3
                    },
                    isSource: true,
                    connector: [ "Flowchart", { stub: [40, 60], gap: 10, cornerRadius: 5, alwaysRespectStubs: true } ],
                    connectorStyle: connectorPaintStyle,
                    hoverPaintStyle: endpointHoverStyle,
                    connectorHoverStyle: connectorHoverStyle,
                    maxConnections: -1,
                    dragOptions: {},
                    overlays: [
                        [ "Label", {
                            location: [0.5, 1.5],
                            label: "",
                            cssClass: "endpointSourceLabel"
                        } ]
                    ]
                },
            // the definition of target endpoints (will appear when the user drags a connection)
                targetEndpoint = {
                    endpoint: "Dot",
                    paintStyle: { fillStyle: "#7AB02C", radius: 6 },
                    hoverPaintStyle: endpointHoverStyle,
                    maxConnections: -1,
                    dropOptions: { hoverClass: "hover", activeClass: "active" },
                    isTarget: true,
                    overlays: [
                        [ "Label", { location: [0.5, -0.5], label: "", cssClass: "endpointTargetLabel" } ]
                    ]
                },
                 _addEndpoints = function (toId, sourceAnchors, targetAnchors) {
                    for (var i = 0; i < sourceAnchors.length; i++) {
                        var sourceUUID = toId + sourceAnchors[i];
                        //console.log('the sourceID',sourceUUID)
                        instance.addEndpoint( toId, sourceEndpoint, {
                            anchor: sourceAnchors[i], uuid: sourceUUID
                        });
                    }
                    for (var j = 0; j < targetAnchors.length; j++) {
                        var targetUUID = toId + targetAnchors[j];
                        //console.log('the targetID',targetUUID);
                        instance.addEndpoint( toId, targetEndpoint, { anchor: targetAnchors[j], uuid: targetUUID });
                    }
                 },
                init = function (connection) {
                    connection.getOverlay("label").setLabel(connection.sourceId.substring(15) + "-" + connection.targetId.substring(15));
                };



            // suspend drawing and initialise.
            instance.batch(function () {




                for (var collection in $scope._Layer.params.schema)
                {
                    for (var element in $scope._Layer.params.schema[collection].elements)
                    {
                        if (!$scope._Layer.params.schema[collection].elements[element].painted || $scope._Layer.params.schema[collection].elements[element].painted == false)
                        {
                            _addEndpoints($scope._Layer.params.schema[collection].elements[element].elementID, [ "RightMiddle"], ["LeftMiddle"]);
                            $scope._Layer.params.schema[collection].elements[element].painted = true;
                        }


                    }
                }


                /*
                 _addEndpoints("Window2", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window1", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window3", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window4", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window5", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window6", [ "RightMiddle"], ["LeftMiddle"]);
                 _addEndpoints("Window7", [ "RightMiddle"], ["LeftMiddle"]);
                 */

                // listen for new connections; initialise them the same way we initialise the connections at startup.
                instance.bind("connection", function (connInfo, originalEvent) {
                    init(connInfo.connection);
                });

                // make all the window divs draggable
           /*
                instance.draggable(jsPlumb.getSelector(".flowchart-demo .window"), { grid: [20, 20] });


           */
                instance.draggable(document.querySelectorAll(".window"), {
                    drag:function(e){
                        // Your code comes here
                        jsPlumb.repaint($(this));
                    },
                    stop: function(event, ui) {

                        if (ui.position != undefined)
                        {
                            var pos_x = ui.position.left;
                            var pos_y = ui.position.top;

                            var id = $(this).attr("id");

                            for (var c in $scope._Layer.params.schema)
                            {
                                if ($scope._Layer.params.schema[c].collectionID == id)
                                {
                                    $scope._Layer.params.schema[c].left = pos_x;
                                    $scope._Layer.params.schema[c].top = pos_y;
                                }
                            }

                            console.log('se ha movido',pos_x,pos_y,id);
                        }
                    }
                });

                /*
                $(".window").draggable({
                    drag:function(e){
                        // Your code comes here
                        //jsPlumb.repaint($(this));
                    },
                    stop: function(e){
                        // Your code for capturing dragged element position.
                        console.log($(this).offset());
                    }
                })*/

                // THIS DEMO ONLY USES getSelector FOR CONVENIENCE. Use your library's appropriate selector
                // method, or document.querySelectorAll:
                //jsPlumb.draggable(document.querySelectorAll(".window"), { grid: [20, 20] });

                // connect a few up
                /*
                 instance.connect({uuids: ["Window2BottomCenter", "Window3TopCenter"], editable: true});
                 instance.connect({uuids: ["Window2LeftMiddle", "Window4LeftMiddle"], editable: true});
                 instance.connect({uuids: ["Window4TopCenter", "Window4RightMiddle"], editable: true});
                 instance.connect({uuids: ["Window3RightMiddle", "Window2RightMiddle"], editable: true});
                 instance.connect({uuids: ["Window4BottomCenter", "Window1TopCenter"], editable: true});
                 instance.connect({uuids: ["Window3BottomCenter", "Window1BottomCenter"], editable: true});
                 */
                //


                for (var j in $scope._Layer.params.joins)
                {
                    instance.connect({uuids: [$scope._Layer.params.joins[j].sourceElementID+"RightMiddle", $scope._Layer.params.joins[j].targetElementID+"LeftMiddle"], editable: true,type: $scope._Layer.params.joins[j].joinType});
                }

                //
                // listen for clicks on connections, and offer to delete connections on click.
                //
                instance.bind("click", function (conn, originalEvent) {
                    // if (confirm("Delete connection from " + conn.sourceId + " to " + conn.targetId + "?"))
                    //   instance.detach(conn);
                    //console.log('the connection has this type: ',conn.getType());
                    var joinType = '';
                    if (conn.hasType("right") == true)
                    {
                        conn.setType("left");
                        joinType = 'left';
                    } else
                        if (conn.hasType("left") == true)
                        {
                            conn.setType("default");
                            joinType = 'default';
                        }else
                            if (conn.hasType("default") == true)
                            {
                                conn.setType("right");
                                joinType = 'right';
                            }

                    for (var j in $scope._Layer.params.joins)
                    {
                        if ($scope._Layer.params.joins[j].sourceElementID == conn.sourceId && $scope._Layer.params.joins[j].targetElementID == conn.targetId)
                            $scope._Layer.params.joins[j].joinType = joinType;
                    }

                    //conn.endpoint
                    //var e = jsPlumb.addEndpoint("someElement");
                    //conn.endpoints[0].addOverlay([ "Arrow", { width:10, height:10, id:"arrow" }]);

                    //conn.endpoints[1].paintStyle = { fillStyle: "#778899", radius: 8 };
                });

                instance.bind("connectionDrag", function (connection) {
                    console.log("connection " + connection.id + " is being dragged. suspendedElement is ", connection.suspendedElement, " of type ", connection.suspendedElementType);
                });
                /*
                instance.bind("connectionDragStop", function (params) {
                    console.log("connection " + params.id + " was dragged ", params.sourceId , 'to', params.targetId);

                    if ($scope.deletingJoin == false)
                        makeJoin(params.sourceId,params.targetId);
                    //params.scope
                    //params.connection
                    //params.dropEndPoint
                    //params.dropEndPoint
                });*/

                instance.bind("dblclick", function (connection, originalEvent){
                    console.log('double clicked...',connection.sourceId);
                });

                instance.bind("click", function (connection, originalEvent){
                    console.log(' clicked...',connection.sourceId);
                });

                instance.bind("beforeDrop", function (info){
                    console.log(' dropped...',info.sourceId);
                    //Here we can control if we are going to accept the join or not...
                    return true;
                });


                instance.bind("connectionMoved", function (params) {
                    console.log("connection " + params.connection.id + " was moved");
                });

                instance.bind("connectionDetached", function (info,originalEvent) {
                    console.log("connection ",info.sourceId,info.targetId , " was detached");
                    deleteJoin(info.sourceId,info.targetId);
                });

                instance.bind("connection", function (info,originalEvent) {
                    console.log("connection ",info.sourceId,info.targetId , " was made");
                    makeJoin(info.sourceId,info.targetId);
                });
            });

            jsPlumb.fire("jsPlumbDemoLoaded", instance);

            $scope.instance = instance;
            /*

             jsPlumb.connect({
             source:"flowchartWindow1",
             target:"flowchartWindow2",
             endpoint:"Rectangle"
             });

             jsPlumb.connect({
             source:"flowchartWindow1",
             target:"flowchartWindow3",
             endpoint:"Rectangle"
             });

             jsPlumb.bind("ready", function() {
             console.log("Set up jsPlumb listeners (should be only done once)");
             jsPlumb.bind("connection", function (info) {
             $scope.$apply(function () {
             console.log("Possibility to push connection into array");
             });
             });
             });
             */
        },100);
        /*
        for (var c in $scope._Layer.params.schema)
        {
            console.log('registering ',$scope._Layer.params.schema[c].collectionID)

            $( $scope._Layer.params.schema[c].collectionID ).draggable({
                containment: $('canvas'),
                drag:function(e){
                    // Your code comes here
                    jsPlumb.repaint($(this)); // Note that it will only repaint the dragged element
                },
                stop: function(event, ui) {
                    var pos_x = ui.offset.left;
                    var pos_y = ui.offset.top;
                    var need = ui.helper.data("need");

                    console.log('se ha movido');
                }
            });
        } */


    }

    $scope.collectionClicked = function (collection)
    {
        $scope.selectedCollection = collection;
        $('#datasetPropertiesModal').modal('show');

        console.log('collection clicked');
    }

    $scope.elementAdd = function (element)
    {
        $scope.selectedElement = element;
        $('#elementModal').modal('show');
    }

    $scope.editElement = function (element)
    {
        $scope.layerSelectedElement = element;
        for (var collection in $scope._Layer.params.schema)
        {
            if ( $scope._Layer.params.schema[collection].collectionID == element.collectionID)
            {
                for (var e in $scope._Layer.params.schema[collection].elements)
                {
                    if ($scope._Layer.params.schema[collection].elements[e].elementID == element.elementID)
                    {
                        $scope.elementEditing = true;
                        var tempElement = {};
                        tempElement = $scope._Layer.params.schema[collection].elements[e];
                        $scope.selectedElement = tempElement;
                        $('#elementModal').modal('show');
                    }
                }
            }
        }
    }

    $scope.saveEditElement = function()
    {
        var element = $scope.selectedElement;

        checkElementOk(element, function(result){

            if (result.result == 1)
            {
                for (var collection in $scope._Layer.params.schema)
                {
                    if ( $scope._Layer.params.schema[collection].collectionID == element.collectionID)
                    {
                        for (var e in $scope._Layer.params.schema[collection].elements)
                        {
                            if ($scope._Layer.params.schema[collection].elements[e].elementID == element.elementID)
                            {
                                $scope._Layer.params.schema[collection].elements[e] = element;

                                $scope.layerSelectedElement.elementRole = element.elementRole;
                                $scope.layerSelectedElement.elementType = element.elementType;
                                $scope.layerSelectedElement.elementLabel = element.elementLabel;
                                if (element.defaultAggregation)
                                    $scope.layerSelectedElement.defaultAggregation = element.defaultAggregation;
                                if (element.values)
                                    $scope.layerSelectedElement.values = element.values;
                                if (element.format)
                                    $scope.layerSelectedElement.format = element.format;
                                if (element.associatedElements)
                                    $scope.layerSelectedElement.associatedElements = element.associatedElements;

                                $('#elementModal').modal('hide');
                            }
                        }
                    }
                }
            } else {
                $scope.elementEditingWarning = result.message;
            }
        });
    }

    function  checkElementOk(element, done)
    {
        var isOk = true;
        var message = '';

        if (element.elementType == 'date')
        {
            if (element.extractFromString == true)
            {
                if (!element.yearPositionFrom ) //|| !angular.isNumber(element.yearPositionFrom))
                {
                    console.log ('no 1')
                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                }

                if (angular.isNumber(element.yearPositionFrom))
                {
                    console.log ('no 2')
                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the year from the string';
                }


                if (!element.yearPositionTo || angular.isNumber(element.yearPositionTo))
                {
                    isOk = false;
                    message = 'You have to setup a valid "TO" position number to extract the year from the string';
                }

                if (!element.monthPositionFrom || angular.isNumber(element.monthPositionFrom))
                {
                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the month from the string';
                }

                if (!element.monthPositionTo || angular.isNumber(element.monthPositionTo))
                {
                    isOk = false;
                    message = 'You have to setup a valid "TO" position number to extract the month from the string';
                }

                if (!element.dayPositionFrom || angular.isNumber(element.dayPositionFrom))
                {
                    isOk = false;
                    message = 'You have to setup a valid "FROM" position number to extract the day from the string';
                }

                if (!element.dayPositionTo || angular.isNumber(element.dayPositionTo))
                {
                    isOk = false;
                    message = 'You have to setup a valid "TO" position number to extract the day from the string';
                }


            }
        }


        var theResult = {};
        if (isOk == true)
            theResult.result = 1;
            else
            theResult.result = 0;

        theResult.message = message;

        done(theResult);

    }

    $scope.zoom = function(ratio)
    {
        var theWidth = 200*ratio+'px';
        var theFontSize = '10px';
        var theIconSize = '12px';


        if (ratio == 0.5)
        {
            theFontSize = '8px';
            theIconSize = '12px';
        }
        if (ratio == 2)
        {
            theFontSize = '12px';
            theIconSize = '14px';
        }

        $('.jtk-field').css('width', theWidth);
        $('.jtk-header').css('width', theWidth);
        $('.window').css('width', theWidth);
        $('.jtk-node').css('width', theWidth);

        $('.jtk-field-label').css('font-size', theFontSize);
        $('.jtk-header').css('font-size', theFontSize);
        $('.window').css('font-size', theFontSize);
        $('.jtk-node').css('font-size', theFontSize);

        $('.jtk-field-icon').css('font-size', theIconSize);
        $('.jtk-field-selected').css('font-size', theIconSize);


        var leftCorrection = (200*ratio) ;

        for (var collection in $scope._Layer.params.schema)
        {
            var theID = $scope._Layer.params.schema[collection].collectionID;
            console.log('the ID '+theID);
            var p = $(theID);
            var position = p.parent().position();
            var theLeft = position.left;
                console.log('the left '+theLeft);
            $($scope._Layer.params.schema[collection].collectionID).css('left', theLeft+leftCorrection+'px');
        }

            for (var collection in $scope._Layer.params.schema)
            {
                for (var element in $scope._Layer.params.schema[collection].elements)
                {
                    instance.revalidate($scope._Layer.params.schema[collection].elements[element].elementID);
                }
            }
    }

    var setZoom = function(z, el) {
        var p = [ "-webkit-", "-moz-", "-ms-", "-o-", "" ],
            s = "scale(" + z + ")";
        for (var i = 0; i < p.length; i++)
            el.css(p[i] + "transform", s);
        jsPlumb.setZoom(z);
    };

    $scope.addElementToObjects = function()
    {
        if (!$scope._Layer.objects)
            $scope._Layer.objects = [];

        $scope.selectedElement.elementRole = 'dimension';
        $scope._Layer.objects.push($scope.selectedElement);

        $('#elementModal').modal('hide');
    }

    $scope.addValueToElement = function(element, value, label) {
        if (!element.values) element.values = [];

        element.values.push({value: value, label: label});
    };

    $scope.addAssociatedElementToElement = function(element, associatedElement, isVisible) {
        if (!element.associatedElements) element.associatedElements = [];

        element.associatedElements.push({element: associatedElement, visible: isVisible});
    };

    $scope.addFolder = function()
    {
        var elementID = uuid2.newguid();

        var element = {};
        element.elementLabel = 'my folder';
        element.elementRole = 'folder';
        element.elementID = elementID;
        element.editing = true;
        element.elements = [];
        $scope._Layer.objects.push(element);
    }

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };

    $scope.deleteSchemaElement = function(element)
    {

        var elementID = element.elementID;

        for (var s in $scope._Layer.params.schema)
        {
            for (var e in $scope._Layer.params.schema[s].elements)
            {
                if ($scope._Layer.params.schema[s].elements[e].elementID == elementID)
                {
                    delete $scope._Layer.params.schema[s].elements[e]['elementRole'];
                }
            }
        }

        checkfordelete($scope.rootItem.elements,elementID);

    }

    function checkfordelete(elements,elementID)
    {

        for (var i in elements)
        {
            console.log('checking---',elementID,elements[i].elementID,JSON.stringify(elements[i]));
            if (elements[i].elementID == elementID)
            {
                //console.log('founded');
                unassingElementRole(elements[i]);
                elements.splice(i,1);
                return;
            } else {
                if (elements[i].elements)
                    if (elements[i].elements.length > 0)
                        checkfordelete(elements[i].elements,elementID);


            }
        }
    }

    function unassingElementRole(element)
    {
        var elementID = element.elementID;

        for (var s in $scope._Layer.params.schema)
        {
            for (var e in $scope._Layer.params.schema[s].elements)
            {
                if ($scope._Layer.params.schema[s].elements[e].elementID == elementID)
                {
                    delete $scope._Layer.params.schema[s].elements[e]['elementRole'];
                }
            }
        }

        if (element.elements)
            if (element.elements.length > 0)
            {
                for (var i in element.elements)
                {
                    unassingElementRole(element.elements[i])
                }
            }
    }

    $scope.onElementTypeChange = function(element) {

        var params = {datasourceID: element.datasourceID,layerID: $scope._Layer._id, collectionID: element.collectionID,collectionName: element.collectionName, elementName: element.elementName, defaultAggregation: element.defaultAggregation};

        if (element.elementType == 'array') {
            connection.get('/api/data-sources/get-element-distinct-values', params, function(data) {
                //console.log(JSON.stringify(data));
                for (var i in data.items) {
                    $scope.addValueToElement(element, data.items[i]["_id"][element.elementName], data.items[i]["_id"][element.elementName]);
                }
            });
        }
    };


    //Drag & drop elements
    $scope.onDrag = false;
    $scope.sortableOptions = {
        connectWith: ".schema-container",
        update: function(e, ui) {

        },
        start: function(e, ui) {
            $scope.$apply(function () {
                $scope.onDrag = true;
            });
        },
        stop: function(e, ui) {
            $scope.$apply(function () {
                $scope.onDrag = false;
            });
        }
    };


    $scope.deleteCollection = function(collection)
    {
        var theCollectionID = collection.collectionID;

        deleteAllCollectionElements($scope.rootItem.elements,theCollectionID);



        for (var c in $scope._Layer.params.schema)
        {
            if ($scope._Layer.params.schema[c].collectionID == theCollectionID)
            {

                for (var element in $scope._Layer.params.schema[c].elements)
                {
                    instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID+"LeftMiddle");
                    instance.deleteEndpoint($scope._Layer.params.schema[c].elements[element].elementID+"RightMiddle");
                }
                $scope._Layer.params.schema.splice(c, 1);
            }

        }

        $('#datasetPropertiesModal').modal('hide');
        $scope.selectedCollection = undefined;

        /*
        for (var j in $scope._Layer.params.joins)
        {
            if ($scope._Layer.params.joins[j].sourceCollectionID == theCollectionID || $scope._Layer.params.joins[j].targetCollectionID == theCollectionID)
                $scope._Layer.params.joins.splice(j, 1);
            //instance.detach(theCollectionID);
        } */



        //instance.repaint();
        //jsPlumb.deleteEndpoint(ep);
        //$scope.erDiagramInit();
        //jsPlumb.repaint($(this));
        //instance.reset();
        /*
        for (var collection in $scope._Layer.params.schema)
        {
            for (var element in $scope._Layer.params.schema[collection].elements)
            {
                $scope._Layer.params.schema[collection].elements[element].painted = false;
            }
        } */
        //$scope.erDiagramInit();

        //instance.deleteEveryEndpoint();
        //instance.detachEveryConnection();

    }

    function deleteAllCollectionElements(elements,collectionID)
    {

        for( var e=elements.length -1;e>=0;e--)
        //for (var e = elements.length -1 to 0)
        {

            if (elements[e].elements)
                deleteAllCollectionElements(elements[e].elements,collectionID);

            if (elements[e].collectionID == collectionID)
            {
                elements.splice(e, 1);
            }



        }
    }

    $scope.getCollectionElements = function(collectionID)
    {
        if ($scope._Layer)
            for (var e in $scope._Layer.params.schema)
            {
                if ($scope._Layer.params.schema[e].collectionID == collectionID)
                    return $scope._Layer.params.schema[e].elements;
            }


    }


});
