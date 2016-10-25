app.service('queryModel' , function ($http, $q, $filter, connection, $compile, $rootScope,uuid2) {
    this.data = null;
    this.scope = null;
    this.reverse = false;
    this.predicate = undefined;
    this.selectedReport = null;
    var wrongFilters = [];
    var query = {};
    query.id = uuid2.newguid();
    this.query = function()
    {
        return query;
    }
    var columns = [];
    this.columns = function()
    {
        return columns;
    }

    var order = [];
    this.order = function()
    {
        return order;
    }

    var filters = [
        {
            group: true,
            filters: []
        }
        ];

    this.filters = function()
    {
        return filters;
    }

    var datasources = [];
    var queries = [];
    this.queries = function()
    {
        return queries;
    }

    var layers = [];
    this.layers = function()
    {
        return layers;
    }

    var selectedLayer = undefined;

    function setSelectedLayer(layer)
    {
        selectedLayer = layer;
        selectedLayerID = layer._id;
        rootItem.elements = layer.objects;
        calculateIdForAllElements(rootItem.elements);
    }

    this.changeLayer = function(selectedLayerID)
    {
        for (var i in layers)
        {
            if (layers[i]._id == selectedLayerID)
            {
                setSelectedLayer(layers[i]);
            }
        }
    }

    var selectedLayerID = undefined;
    this.selectedLayerID = function()
    {
        return selectedLayerID;
    }

    var rootItem = {elementLabel: '', elementRole: 'root', elements: []};
    this.rootItem = function()
    {
        return rootItem;
    }

    var page = 0;
    var pages = 0;

    this.initQuery = function() {
        query = {};
        query.id = uuid2.newguid();
        columns = [];
        order = [];
        filters = [
        {
            group: true,
            filters: []
        }
        ];
        dataSources = [];
        queries = [];
        if (selectedLayer)
            detectLayerJoins();
        //processStructure();

    }

    this.filterStringOptions = [
                                    {value:"equal",label:"equal"},
                                    {value:"diferentThan",label:"different than"},
                                    {value:"biggerThan",label:"bigger than"},
                                    {value:"biggerOrEqualThan",label:"bigger or equal than"},
                                    {value:"lessThan",label:"less than"},
                                    {value:"lessOrEqualThan",label:"less or equal than"},
                                    {value:"between",label:"between"},
                                    {value:"notBetween",label:"not between"},
                                    {value:"contains",label:"contains"},
                                    {value:"notContains",label:"not contains"},
                                    {value:"startWith",label:"start with"},
                                    {value:"notStartWith",label:"not start with"},
                                    {value:"endsWith",label:"ends with"},
                                    {value:"notEndsWith",label:"not ends with"},
                                    {value:"like",label:"like"},
                                    {value:"notLike",label:"not like"},
                                    {value:"null",label:"is null"},
                                    {value:"notNull",label:"is not null"},
                                    {value:"in",label:"in"},
                                    {value:"notIn",label:"not in"}
                                    ];
    this.filterArrayOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},   //TODO: el different than no está funcionando
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
    ];

    this.filterNumberOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"},
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
        /* RANKING
        el (los) primeros
        el (los) ultimos
        el (los) primeros %
        el (los) ultimos % */

    ];

    this.signalOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"}
    ];

    this.dateFilters = [
        {value:"#WST-TODAY#",label:"Today"},
        {value:"#WST-THISWEEK#",label:"This week"},
        {value:"#WST-THISMONTH#",label:"This month"},
        {value:"#WST-THISYEAR#",label:"This year"},
        {value:"#WST-FIRSTQUARTER#",label:"First quarter"},
        {value:"#WST-SECONDQUARTER#",label:"Second quarter"},
        {value:"#WST-THIRDQUARTER#",label:"Third quarter"},
        {value:"#WST-FOURTHQUARTER#",label:"Fourth quarter"},
        {value:"#WST-FIRSTSEMESTER#",label:"First semester"},
        {value:"#WST-SECONDSEMESTER#",label:"Second semester"},
        {value:"#WST-YESTERDAY#",label:"Yesterday"},
        {value:"#WST-LASTWEEK#",label:"Last week"},
        {value:"#WST-LASTMONTH#",label:"Last month"},
        {value:"#WST-LASTYEAR#",label:"Last year"},
        {value:"#WST-LYFIRSTQUARTER#",label:"Last year first quarter"},
        {value:"#WST-LYSECONDQUARTER#",label:"Last year second quarter"},
        {value:"#WST-LYTHIRDQUARTER#",label:"Last year third quarter"},
        {value:"#WST-LYFOURTHQUARTER#",label:"Last year fourth quarter"},
        {value:"#WST-LYFIRSTSEMESTER#",label:"Last year first semester"},
        {value:"#WST-LYSECONDSEMESTER#",label:"Last year second semester"}
    ]

    this.filterDateOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"},
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        //TODO: in , not in or date elements
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
    ];

    this.fieldsAggregations = {
        'number': [
            {name: 'Sum', value: 'sum'},
            {name: 'Avg', value: 'avg'},
            {name: 'Min', value: 'min'},
            {name: 'Max', value: 'max'},
            {name: 'Count', value: 'count'}
        ],
        'date': [
            {name: 'Year', value: 'year'},
            {name: 'Month', value: 'month'},
            {name: 'Day', value: 'day'},
            {name: 'Count', value: 'count'}
            /*{name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'}*/
        ],
        'string': [
            {name: 'Count', value: 'count'}
        ]
    };

    this.conditionTypes = [
        {conditionType: 'and', conditionLabel: 'AND'},
        {conditionType: 'or', conditionLabel: 'OR'},
        {conditionType: 'andNot', conditionLabel: 'AND NOT'},
        {conditionType: 'orNot', conditionLabel: 'OR NOT'}
    ];


    this.getElementFilterOptions = function(elementType)
    {
        if (elementType == 'array')
            return  this.filterArrayOptions;
        if (elementType == 'string')
           return  this.filterStringOptions;
        if (elementType == 'number')
            return  this.filterNumberOptions;
        if (elementType == 'date')
            return this.filterDateOptions
    }


    this.removeQueryItem = function(object,type)
    {

        if (type == 'column')
        {
            if (columns)
                $rootScope.removeFromArray(columns, object);
        }

        detectLayerJoins();

    }

    this.getQueryData = function( done) {
        getQueryData(done);
    }

    this.getQueryData = function(queryObject, done) {
        query = queryObject;
        getQueryData(done);
    }

    this.loadQuery = function(queryObject)
    {
        query = queryObject;
    }


    function getQueryData(done)
    {
            var params = {};
            params.query = query;


            connection.get('/api/reports/get-data', params, function(data) {
                var sql = data.sql;


                if (data.result == 0)
                {
                    noty({text: data.msg,  timeout: 2000, type: 'error'});
                    done([],sql,query);
                } else {


                    prepareData(query,data.data, function(result)
                    {
                        query.columns = columns;
                        query.filters = filters;
                        query.order = order;

                        done(result,sql,query);
                    });
                }

            });

    };

    function getData(query, params,  done) {
        params.query = query;
        console.log('the query',query);
        connection.get('/api/reports/get-data', params, function(data) {
            if (data.result == 0)
                {
                    noty({text: data.msg,  timeout: 2000, type: 'error'});
                    done([]);
                } else {
                    done(data.data,data.sql,query);
                }
        });
    }

    function prepareData(query,data,done)
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
        query.id = uuid2.newguid();
        query.datasources = [];

        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);
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

                for (var n1 in order) {
                    if (order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push(order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;
        query.order = [];
        query.order.push(attribute);

        getData(query, {page: 0}, function(data,sql) {

            if (data.items)
                data = data.items;

            attribute.data = data;
            $scope.searchValues = data;
            $scope.errorMsg = (data.result === 0) ? data.msg : false;
            page = data.page;
            pages = data.pages;
            //$scope.data = data;

        });
    }


    this.getDistinctFiltered = function(attribute,search,done) {

        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.id = uuid2.newguid();
        query.datasources = [];

        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);
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

                for (var n1 in order) {
                    if (order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push(order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;
        query.order = [];
        query.order.push(attribute);

        getData(query, {page: 0}, function(data,sql) {
            done(data,sql);
        });
    }

    this.getFilterValues = function(attribute,done) {

        var execute = (typeof execute !== 'undefined') ? execute : true;

        var query = {};
        query.id = uuid2.newguid();
        query.datasources = [];

        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);
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

                for (var n1 in order) {
                    if (order[n1].collectionID == dtsCollections[n])
                    {
                        collection.order.push(order[n1]);
                    }
                }

                dtsObject.collections.push(collection);

            }
            query.datasources.push(dtsObject);
        }

        query.layers = layersList;
        query.order = [];
        query.order.push(attribute);

        getData(query, {page: 0}, function(data,sql) {

            if (data.items)
                data = data.items;

            attribute.data = data;
            //$scope.searchValues = data;
            //$scope.errorMsg = (data.result === 0) ? data.msg : false;
            page = data.page;
            pages = data.pages;
            //$scope.data = data;
            done(data,sql);
        });
    }


    this.onDateSet = function (newDate, oldDate, filter) {
        var year = newDate.getFullYear();
        var month = pad(newDate.getMonth()+1,2);
        var day = pad(newDate.getDate(),2);
        var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        if (filter.filterType == 'in' || filter.filterType == 'notIn')
        {
            if (!filter.filterText1)
                filter.filterText1 = [];
            filter.filterText1.push(theDate);
        } else
            filter.filterText1 = theDate;

        filter.searchValue = theDate;
        filter.filterValue = theDate;
        filter.dateCustomFilterLabel = undefined;
    }

    this.onDateEndSet = function (newDate, oldDate, filter) {
        var year = newDate.getFullYear();
        var month = pad(newDate.getMonth()+1,2);
        var day = pad(newDate.getDate(),2);
        var theDate = new Date(year+'-'+month+'-'+day+'T00:00:00.000Z');
        filter.filterText2 = theDate;
        filter.dateCustomFilterLabel = undefined;
    }

    this.getLayers = function(done) {

        connection.get('/api/layers/get-layers', {}, function(data) {
            //$scope.errorMsg = (data.result === 0) ? data.msg : false;

            if (data.result == 1)
                {
                    page = data.page;
                    pages = data.pages;
                    layers = data.items;
                    if (selectedLayerID)
                        {
                          for (var i in data.items)
                              {
                                  if (data.items[i]._id == selectedLayerID)
                                      {
                                            rootItem.elements = data.items[i].objects;
                                            selectedLayer = data.items[i];
                                      }
                              }
                        } else {
                            setSelectedLayer(data.items[0]);
                        }

                    calculateIdForAllElements(rootItem.elements);
                    done(layers,selectedLayerID);
                }
        });
    };

    function pad(num, size) {
        var s = num+"";
        while (s.length < size) s = "0" + s;
        while (s.length < size) s = "0" + s;
        return s;
    }

    this.calculateIdForAllElements = function(elements)
    {
        calculateIdForAllElements(elements);
    }


    function calculateIdForAllElements(elements)
    {
        for (var e in elements)
        {
                if (elements[e].collectionID)
                {
                var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                elements[e].id = elementID;
                }

            if (elements[e].elements)
                calculateIdForAllElements(elements[e].elements);
        }
    }

    this.detectLayerJoins = function()
    {
        detectLayerJoins();
    }

    function detectLayerJoins()
    {


        checkChoosedElements();

        generateQuery(function(){

            //this function enables and disables elements in the layer if there is a join between the elements in the report and the element in the layer...
            var reportCollections = [];
            var selectableCollections = [];

            for (var i in query.datasources) {
                for (var c in query.datasources[i].collections) {
                     reportCollections.push(query.datasources[i].collections[c].collectionID);
                     selectableCollections.push(query.datasources[i].collections[c].collectionID);
                }
            }

            //get the joins for these collections
            if (selectedLayer.params && selectedLayer.params.joins)
            for (var j in selectedLayer.params.joins)
            {
                for (var c in reportCollections)
                {
                    if (selectedLayer.params.joins[j].sourceCollectionID == reportCollections[c])
                    {
                             if (selectableCollections.indexOf(selectedLayer.params.joins[j].sourceCollectionID) == -1)
                                 selectableCollections.push(selectedLayer.params.joins[j].sourceCollectionID);

                             if (selectableCollections.indexOf(selectedLayer.params.joins[j].targetCollectionID) == -1)
                                 selectableCollections.push(selectedLayer.params.joins[j].targetCollectionID);
                    }

                    if (selectedLayer.params.joins[j].targetCollectionID == reportCollections[c])
                    {
                        if (selectableCollections.indexOf(selectedLayer.params.joins[j].sourceCollectionID) == -1)
                            selectableCollections.push(selectedLayer.params.joins[j].sourceCollectionID);

                        if (selectableCollections.indexOf(selectedLayer.params.joins[j].targetCollectionID) == -1)
                            selectableCollections.push(selectedLayer.params.joins[j].targetCollectionID);
                    }
                }
            }

            if (selectableCollections.length == 0)
                enableAllElements(rootItem.elements);
            else
                detectLayerJoins4Elements(rootItem.elements,selectableCollections);
        });
    }

    function detectLayerJoins4Elements(elements,selectableCollections)
    {
        for (var e in elements)
        {
            if (elements[e].elementRole != 'folder')
            {
                if (selectableCollections.indexOf(elements[e].collectionID) == -1)
                {
                    elements[e].enabled = false;
                } else
                    elements[e].enabled = true;
            }
            if (elements[e].elements)
                detectLayerJoins4Elements(elements[e].elements,selectableCollections);

        }
    }

    function enableAllElements(elements)
    {
        for (var e in elements)
        {
            if (elements[e].elementRole != 'folder')
            {
                    elements[e].enabled = true;
            }

            if (elements[e].id == undefined)
            {
                if (elements[e].collectionID)
                    {
                       var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                        if (elements[e].aggregation)
                          elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName+elements[e].aggregation;
                        elements[e].id = elementID;
                    }

            }

            if (elements[e].elements)
                enableAllElements(elements[e].elements);
        }
    }


    function checkFilters(filters)
    {
        for (var g in filters) {
                var filter = filters[g];
                if (filter)
                    {
                        if ((filter.searchValue == undefined || filter.searchValue == '') && filter.filterPrompt == false)
                            wrongFilters.push(filter);

                        if (filter.group == true)
                        {
                            checkFilters(filter.filters)
                        }
                    }
            }
    }


    var lastDrop = null;
    // Drop handler.
    this.onDrop = function ($scope,data, event, type, group, done) {
        event.stopPropagation();
        if (lastDrop && lastDrop == 'onFilter') {
            lastDrop = null;
            return;
        }

        // Get custom object data.
        var customObjectData = data['json/custom-object']; // {foo: 'bar'}

        // Get other attached data.
        var uriList = data['text/uri-list']; // http://mywebsite.com/..


        if (type == 'column') {
            var el = document.getElementById('column-zone');
            var theTemplate =  $compile('<div class="column-box">'+customObjectData.objectLabel+'</div>')($scope);
            if (!columns)
                columns = [];
            columns.push(customObjectData);

        }

        if (type == 'order') {
            customObjectData.sortType = -1;
            order.push(customObjectData);
        }
        if (type == 'filter') {
            var el = document.getElementById('filter-zone');
            filters.push(customObjectData);
            this.filtersUpdated();
        }
        if (type == 'group') {

            group.filters.push(customObjectData);
            this.filtersUpdated();
        }


        detectLayerJoins();
        processStructure(undefined,done);
    };

    this.onDropOnFilter = function (data, event, filter) {
        lastDrop = 'onFilter';

        var droppedFilter = data['json/custom-object'];

        filter.filters = [jQuery.extend({}, filter), droppedFilter];

        filter.group = true;

        updateConditions(filter.filters);

        delete(filter.collectionID);
        delete(filter.datasourceID);
        delete(filter.elementID);
        delete(filter.elementName);
        delete(filter.elementType);
        delete(filter.filterType);
        delete(filter.filterTypeLabel);
        delete(filter.objectLabel);
        delete(filter.filterText1);
        delete(filter.filterText2);

        event.stopPropagation();
        return;
    };

    function checkChoosedElements()
    {
        if (columns.length > 1)
        {
            for( var e=columns.length -1;e>=0;e--)
            {
                if (thereIsAJoinForMe(columns[e]) == 0)
                {

                columns.splice(e,1);
                }
            }
        }
    }


    function generateQuery(done)
    {
        //$scope.processStructure();
        query = {};
        query.id = uuid2.newguid();
        query.datasources = [];
        query.order = order;


        query.wrongFilters = wrongFilters;


        var datasourcesList = [];
        var layersList = [];
        layersList.push(selectedLayerID);

        for (var i in columns) {
            if (datasourcesList.indexOf(columns[i].datasourceID) == -1)
                datasourcesList.push(columns[i].datasourceID);
            if (layersList.indexOf(columns[i].layerID) == -1)
                layersList.push(columns[i].layerID);
        }

        for (var i in filters) {

            for (var z in filters[i].filters)
            {
                if (datasourcesList.indexOf(filters[i].filters[z].datasourceID) == -1)
                    datasourcesList.push(filters[i].filters[z].datasourceID);
                if (layersList.indexOf(filters[i].filters[z].layerID) == -1)
                    layersList.push(filters[i].filters[z].layerID);
            }

        }

        for (var i in datasourcesList) {

            var dtsObject = {};
            dtsObject.datasourceID = datasourcesList[i];
            dtsObject.collections = [];

            var dtsCollections = [];


            for (var z in columns) {
                if (columns[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf(columns[z].collectionID) == -1)
                        dtsCollections.push(columns[z].collectionID);
                }
            }


            getFiltersCollections(filters,dtsCollections,datasourcesList[i], function(){

                        for (var n in dtsCollections) {

                            var collection = {};
                            collection.collectionID = dtsCollections[n];

                            collection.columns = [];

                            for (var n1 in columns) {
                                if (columns[n1].collectionID == dtsCollections[n])
                                {
                                    collection.columns.push(columns[n1]);
                                }
                            }

                            collection.order = [];

                            for (var n1 in order) {
                                if (order[n1].collectionID == dtsCollections[n])
                                {
                                    collection.order.push(order[n1]);
                                }
                            }


                            collection.filters = [];
                             for (var n1 in filters) {
                                for (var n1f in filters[n1].filters)
                                {
                                if (filters[n1].filters[n1f].collectionID)
                                    if (filters[n1].filters[n1f].collectionID == dtsCollections[n])
                                        {
                                            collection.filters.push(filters[n1].filters[n1f]);
                                        }
                                }
                             }

                            dtsObject.collections.push(collection);

                        }



                        query.datasources.push(dtsObject);
                        query.layers = layersList;

            });

        }

        query.groupFilters = filters;

        done();
    }


    function getFiltersCollections(filters,dtsCollections,dtsID,done)
    {

        for (var z in filters) {
                getGroupCollections(filters[z].filters,dtsCollections,dtsID,true,function(){
                    done();
                });
            }
    }

    function getGroupCollections(theGroup,dtsCollections,dtsID,isRoot,done)
    {
            for (var ff in theGroup)
                {
                    if (theGroup[ff].datasourceID)
                      {
                        if (theGroup[ff].datasourceID == dtsID)
                            {
                                    if (dtsCollections.indexOf(theGroup[ff].collectionID) == -1)
                                    {
                                        dtsCollections.push(theGroup[ff].collectionID);
                                    }
                            }
                        }
                        var well = theGroup[ff];

                       if (theGroup[ff].group == true)
                        {
                            getGroupCollections(theGroup[ff].filters,dtsCollections,false,done);
                        }

                }

            if (isRoot == true)
                done();

    }

    this.processStructure = function(execute, done)
    {
        processStructure(execute,done);
    }

    function processStructure(execute,done) {

        var execute = (typeof execute !== 'undefined') ? execute : true;
        wrongFilters = [];
        checkFilters(filters);

            if (wrongFilters.length == 0)
                {
                    $('#reportLayout').empty();
                    if (columns.length > 0 && execute)
                        done();
                        //$scope.getDataForPreview();

                } else {

                    //var errorMsg = 'There are incomplete filters'
                    //noty({text: errorMsg,  timeout: 6000, type: 'error'});
                }

    }


    function thereIsAJoinForMe(element)
    {
        var found = 0;
        for (var i in columns)
        {
             if (element.elementID != columns[i].elementID)
             {
                 if (joinExists(element.collectionID,columns[i].collectionID) || (element.collectionID == columns[i].collectionID))
                    found = found+1;
             }
        }

        return found;
    }

    function joinExists(collection1,collection2)
    {
        var found = false;

        if (!selectedLayer.params || !selectedLayer.params.joins) return false;

        if (collection1 != collection2)
        {
            for (var j in selectedLayer.params.joins)
            {
                if ((selectedLayer.params.joins[j].sourceCollectionID == collection1 && selectedLayer.params.joins[j].targetCollectionID == collection2) ||
                    (selectedLayer.params.joins[j].sourceCollectionID == collection2 && selectedLayer.params.joins[j].targetCollectionID == collection1))
                {
                    found = true;
                }
            }
        } else
            found = true;

        return found;
    }


    this.updateCondition = function(filter, condition) {
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
        this.processStructure();
    };


    this.filtersUpdated = function(theFilters, mainFilters) {
        var theFilters = (theFilters) ? theFilters : filters;
        var mainFilters = (typeof mainFilters === 'undefined') ? true : mainFilters;
        updateConditions(theFilters);
        updateGroups(theFilters, mainFilters);
        for (var i in theFilters) {
            if (theFilters[i])
                if (theFilters[i].group) {
                    this.filtersUpdated(theFilters[i].filters, false);
                }
        }
    };

    function updateGroups(theFilters, mainFilters) {
        var theFilters = (theFilters) ? theFilters : filters;

        for (var i in theFilters) {
            if (theFilters[i])
                if (theFilters[i].group && theFilters[i].filters.length == 0 && !mainFilters) {
                    theFilters.splice(i, 1);
                    updateConditions(theFilters);
                    return updateGroups(theFilters, mainFilters);
                }
        }
    };

    function updateConditions(theFilters) {
        var theFilters = (theFilters) ? theFilters : filters;
        for (var i in theFilters) {
            if (i%2) { //must be condition
                if (!theFilters[i].condition) {
                    theFilters.splice(i, 0, {
                        condition: true,
                        conditionType: 'and',
                        conditionLabel: 'AND'
                    });
                    return updateConditions(theFilters);
                }
                else { //is a condition, next is a filter?
                    if (theFilters[Number(i)+1]) {
                        if (theFilters[Number(i)+1].condition) { //if next is a condition
                            theFilters.splice(i, 1);
                            return updateConditions(theFilters);
                        }
                    }
                    else {
                        theFilters.splice(i, 1);
                        return updateConditions(theFilters);
                    }
                }
            }
            else { //must not be condition
                if (theFilters[i])
                    if (theFilters[i].condition) {
                        theFilters.splice(i, 1);
                        return updateConditions(theFilters);
                    }
            }
        }
    };


    this.setFilterType = function(filter, filterOption)
    {
        filter.filterType = filterOption.value;
        filter.filterTypeLabel = filterOption.label;

        if (filter.filterType == 'in' || filter.filterType == 'notIn')
        {
            filter.filterText1 = [];
            filter.filterLabel1 = [];
        } else {
            filter.filterText1 = '';
            filter.filterLabel1 = '';
            filter.filterText2 = '';
            filter.filterLabel2 = '';
        }
        //set the appropiate interface for the choosed filter relation
    }

    this.orderColumn = function(predicate) {
        this.reverse = (this.predicate === predicate) ? !this.reverse : false;
        this.predicate = predicate;
    };



});
