app.controller('queryCtrl', function ($scope, connection, $compile, queryModel, queryService, promptModel, grid, bsLoadingOverlayService,uuid2) {

    $scope.searchModal = 'partials/report/searchModal.html';
    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.dateModal = 'partials/report/dateModal.html';
    $scope.linkModal = 'partials/report/linkModal.html';

    $scope.rows = [];
    $scope.rows = [];
    $scope.columns = [];
    $scope.order = [];
    $scope.filters = [];
    $scope.dataSources = [];
    $scope.queryStructure = queryService.getQuery;
    $scope.queries = [];

    $scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};
    $scope.filterStringOptions = [
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
    $scope.filterArrayOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},   //TODO: el different than no está funcionando
        {value:"null",label:"is null"},
        {value:"notNull",label:"is not null"},
        {value:"in",label:"in"},
        {value:"notIn",label:"not in"}
    ];

    $scope.filterNumberOptions = [
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

    $scope.signalOptions = [
        {value:"equal",label:"equal"},
        {value:"diferentThan",label:"different than"},
        {value:"biggerThan",label:"bigger than"},
        {value:"biggerOrEqualThan",label:"bigger or equal than"},
        {value:"lessThan",label:"less than"},
        {value:"lessOrEqualThan",label:"less or equal than"},
        {value:"between",label:"between"},
        {value:"notBetween",label:"not between"}
    ];

    $scope.dateFilters = [
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

    $scope.filterDateOptions = [
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

    $scope.fieldsAggregations = {
        'number': [
            {name: 'Sum', value: 'sum'},
            {name: 'Avg', value: 'avg'},
            {name: 'Min', value: 'min'},
            {name: 'Max', value: 'max'}
        ],
        'date': [
            {name: 'Year', value: 'year'},
            {name: 'Month', value: 'month'},
            {name: 'Day', value: 'day'}
            /*{name: 'Semester', value: 'semester'},
            {name: 'Quarter', value: 'quarter'},
            {name: 'Trimester', value: 'trimester'}*/
        ]
    };

    var hashCode = function(s){
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    };

    $scope.initQuery = function() {
        $scope.query = {};
        $scope.rows = [];
        $scope.columns = [];
        $scope.order = [];
        $scope.filters = [];
        $scope.dataSources = [];
        $scope.queries = [];
        detectLayerJoins();
        $scope.processStructure();
    }

    $scope.$on("loadQueryStructure", function (event, args) {
     var theQuery = args.query;
        $scope.query = theQuery.query;
        $scope.rows = theQuery.rows;
        $scope.columns = theQuery.columns;
        $scope.order = theQuery.order;
        $scope.filters = theQuery.filters;
        $scope.dataSources = theQuery.dataSources;
        $scope.queries = [];
        detectLayerJoins();
        $scope.processStructure();
    });

    $scope.saveQueryStructure = function() {
        var queryStructure = {};
        queryStructure.query = $scope.query;
        queryStructure.rows = $scope.rows;
        queryStructure.columns = $scope.columns;
        queryStructure.order = $scope.order;
        queryStructure.filters = $scope.filters;
        queryStructure.dataSources = $scope.dataSources;
        queryService.addQuery(queryStructure);
    }




    $scope.stringVariables = [
        {value:"toUpper",label:"To Upper"},
        {value:"toLower",label:"To Lower"}
    ];

    $scope.filters = [
        {
            group: true,
            filters: []
        }
    ];



    $scope.getLayers = function() {
        connection.get('/api/layers/get-layers', {}, function(data) {
            $scope.errorMsg = (data.result === 0) ? data.msg : false;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.layers = data.items;
            $scope.rootItem.elements = data.items[0].objects;
            $scope.selectedLayer = data.items[0];
            $scope.selectedLayerID = data.items[0]._id;
            calculateIdForAllElements($scope.rootItem.elements);
            console.log('the elements',$scope.rootItem.elements);

        });
    };

    $scope.changeLayer = function(selectedLayerID)
    {
        for (var i in $scope.layers)
        {
            if ($scope.layers[i]._id == selectedLayerID)
            {
                $scope.rootItem.elements = $scope.layers[i].objects;
                $scope.selectedLayer = $scope.layers[i];
                $scope.selectedLayerID = $scope.layers[i]._id;
                calculateIdForAllElements($scope.rootItem.elements);
            }
        }
    }

    function calculateIdForAllElements(elements)
    {
        for (var e in elements)
        {
                if (elements[e].collectionID)
                {
                var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                /*
                if (elements[e].aggregation)
                    elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName+elements[e].aggregation;
                if (elements[e].defaultAggregation)
                    elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName+elements[e].defaultAggregation;
                */
                elements[e].id = elementID;
                }

            if (elements[e].elements)
                calculateIdForAllElements(elements[e].elements);
        }
    }

    $scope.detectLayerJoins = function()
    {
        detectLayerJoins();
    }

    $scope.getQuery = function(queryID)
    {
        for (var q in $scope.queries)
        {
            if ($scope.queries[q].id == queryID)
                return $scope.queries[q]
        }
    }

    function detectLayerJoins()
    {
        checkChoosedElements();

        generateQuery(function(){

            //this function enables and disables elements in the layer if there is a join between the elements in the report and the element in the layer...
            var reportCollections = [];
            var selectableCollections = [];

            for (var i in $scope.query.datasources) {
                for (var c in $scope.query.datasources[i].collections) {
                     reportCollections.push($scope.query.datasources[i].collections[c].collectionID);
                     selectableCollections.push($scope.query.datasources[i].collections[c].collectionID);
                }
            }

            //get the joins for these collections

            for (var j in $scope.selectedLayer.params.joins)
            {
                for (var c in reportCollections)
                {
                    if ($scope.selectedLayer.params.joins[j].sourceCollectionID == reportCollections[c])
                    {
                             if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].sourceCollectionID) == -1)
                                 selectableCollections.push($scope.selectedLayer.params.joins[j].sourceCollectionID);

                             if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].targetCollectionID) == -1)
                                 selectableCollections.push($scope.selectedLayer.params.joins[j].targetCollectionID);
                    }

                    if ($scope.selectedLayer.params.joins[j].targetCollectionID == reportCollections[c])
                    {
                        if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].sourceCollectionID) == -1)
                            selectableCollections.push($scope.selectedLayer.params.joins[j].sourceCollectionID);

                        if (selectableCollections.indexOf($scope.selectedLayer.params.joins[j].targetCollectionID) == -1)
                            selectableCollections.push($scope.selectedLayer.params.joins[j].targetCollectionID);
                    }
                }
            }

            if (selectableCollections.length == 0)
                enableAllElements($scope.rootItem.elements);
            else
                detectLayerJoins4Elements($scope.rootItem.elements,selectableCollections);
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

            if (elements[e].id = undefined)
            {
                var elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName;
                if (elements[e].aggregation)
                  elementID = elements[e].collectionID.toLowerCase()+'_'+elements[e].elementName+elements[e].aggregation;
                elements[e].id = elementID;
            }

            if (elements[e].elements)
                enableAllElements(elements[e].elements);
        }
    }

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };


    $scope.processStructure = function(execute) {
        var execute = (typeof execute !== 'undefined') ? execute : true;
        $scope.wrongFilters = [];
        checkFilters($scope.filters);


            if ($scope.wrongFilters.length == 0)
                {
                    $('#reportLayout').empty();
                    if ($scope.columns.length > 0 && execute)
                        $scope.getDataForPreview();

                } else {
                    //var errorMsg = 'There are incomplete filters'
                    //noty({text: errorMsg,  timeout: 6000, type: 'error'});
                }

    }

    function checkFilters(filters)
    {
            for (var g in filters) {
                            var filter = filters[g];

                            if ((filter.searchValue == undefined || filter.searchValue == '') && filter.filterPrompt == false)
                                $scope.wrongFilters.push(filter);

                            if (filter.group == true)
                            {

                                checkFilters(filter.filters)
                            }

                }


    }

    $scope.getDataForPreview = function()
    {

        bsLoadingOverlayService.start({referenceId: 'reportLayout'});

        $scope.query.id = uuid2.newguid();
        $scope.queries = [];
        $scope.queries.push($scope.query);
        queryModel.getQueryData($scope,$scope.query, function(data){

                $scope.queries[0].data = data;

                grid.simpleGrid($scope.columns,$scope.query.name,$scope.query,false,function(){
                        bsLoadingOverlayService.stop({referenceId: 'reportLayout'});
                });
        });

    }

    $scope.getElementFilterOptions = function(elementType)
    {
        //console.log(' es un '+elementType);

        if (elementType == 'array')
            return  $scope.filterArrayOptions;
        if (elementType == 'string')
           return  $scope.filterStringOptions;
        if (elementType == 'number')
            return  $scope.filterNumberOptions;
        if (elementType == 'date')
            return $scope.filterDateOptions
    }

    var lastDrop = null;
    // Drop handler.
    $scope.onDrop = function (data, event, type, group) {
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
            if (!$scope.columns)
                $scope.columns = [];
                $scope.columns.push(customObjectData);

            //Add to x and y keys to prevent reportType change
            /*if (customObjectData.elementType == 'count' || customObjectData.elementType == 'number')
            {
                if (!$scope.selectedReport.properties.ykeys)
                    $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.ykeys.push(customObjectData);
            } else {
                if (!$scope.selectedReport.properties.xkeys)
                    $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.xkeys.push(customObjectData);
            }*/
        }
        /*if (type == 'xkey') {
            var el = document.getElementById('xkey-zone');
            var theTemplate =  $compile('<div class="column-box">'+customObjectData.objectLabel+'</div>')($scope);
            if (!$scope.columns)
                $scope.columns = [];
            $scope.columns.push(customObjectData);
            if (!$scope.selectedReport.properties.xkeys)
                $scope.selectedReport.properties.xkeys = [];
            $scope.selectedReport.properties.xkeys.push(customObjectData);
        }
        if (type == 'ykey') {
            if (customObjectData.elementType == 'count' || customObjectData.elementType == 'number')
            {
                var el = document.getElementById('ykey-zone');
                var theTemplate =  $compile('<div class="column-box">'+customObjectData.objectLabel+'</div>')($scope);
                if (!$scope.columns)
                    $scope.columns = [];
                $scope.columns.push(customObjectData);
                if (!$scope.selectedReport.properties.ykeys)
                    $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.ykeys.push(customObjectData);
                $scope.onlyNumericValuesAlert = false;
            } else {
                $scope.onlyNumericValuesAlert = true;
            }
        }*/

        if (type == 'order') {
            customObjectData.sortType = -1;
            $scope.order.push(customObjectData);
            console.log($scope.order);
        }
        if (type == 'filter') {
            var el = document.getElementById('filter-zone');
            console.log('the dropped filter',customObjectData);

            //var theTemplate =  $compile('<div class="filter-box">'+customObjectData.objectLabel+'</div>')($scope);;
            $scope.filters.push(customObjectData);
            //console.log('the filters '+JSON.stringify($scope.filters));

            $scope.filtersUpdated();
        }
        if (type == 'group') {
        //This is the real filter...
            //console.log('pushing filter group',customObjectData);
            group.filters.push(customObjectData);
            //console.log('the filters group'+JSON.stringify($scope.filters));

            $scope.filtersUpdated();
        }
        /*generateQuery(function(){
            $scope.processStructure();
        });*/

        detectLayerJoins();
        $scope.processStructure();

        //angular.element(el).append(theTemplate);
        // ...
    };

    $scope.onDropOnFilter = function (data, event, filter) {
        lastDrop = 'onFilter';

        var droppedFilter = data['json/custom-object'];
        //console.log('en filtro');
        console.log(droppedFilter);
        //console.log(filter);

        filter.filters = [jQuery.extend({}, filter), droppedFilter];
        //if (filter.filters == undefined)
          //  filter.filters = [];

        //filter.filters.push(droppedFilter);
        filter.group = true;

        $scope.updateConditions(filter.filters);

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

    $scope.conditionTypes = [
        {conditionType: 'and', conditionLabel: 'AND'},
        {conditionType: 'or', conditionLabel: 'OR'},
        {conditionType: 'andNot', conditionLabel: 'AND NOT'},
        {conditionType: 'orNot', conditionLabel: 'OR NOT'}
    ];

    $scope.updateCondition = function(filter, condition) {
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
        $scope.processStructure();
    };


    $scope.filtersUpdated = function(filters, mainFilters) {
        var filters = (filters) ? filters : $scope.filters;
        var mainFilters = (typeof mainFilters === 'undefined') ? true : mainFilters;

        $scope.updateConditions(filters);
        $scope.updateGroups(filters, mainFilters);

        for (var i in filters) {
            if (filters[i].group) {
                $scope.filtersUpdated(filters[i].filters, false);
            }
        }
    };

    $scope.updateGroups = function(filters, mainFilters) {
        var filters = (filters) ? filters : $scope.filters;

        for (var i in filters) {
            if (filters[i].group && filters[i].filters.length == 0 && !mainFilters) {
                filters.splice(i, 1);
                $scope.updateConditions(filters);
                return $scope.updateGroups(filters, mainFilters);
            }
        }
    };

    $scope.updateConditions = function(filters) {
        var filters = (filters) ? filters : $scope.filters;

        for (var i in filters) {
            if (i%2) { //must be condition
                if (!filters[i].condition) {
                    filters.splice(i, 0, {
                        condition: true,
                        conditionType: 'and',
                        conditionLabel: 'AND'
                    });
                    return $scope.updateConditions(filters);
                }
                else { //is a condition, next is a filter?
                    if (filters[Number(i)+1]) {
                        if (filters[Number(i)+1].condition) { //if next is a condition
                            filters.splice(i, 1);
                            return $scope.updateConditions(filters);
                        }
                    }
                    else {
                        filters.splice(i, 1);
                        return $scope.updateConditions(filters);
                    }
                }
            }
            else { //must not be condition
                if (filters[i].condition) {
                    filters.splice(i, 1);
                    return $scope.updateConditions(filters);
                }
            }
        }

        console.log('updateConditions FINISH',filters);
    };

    // Drag over handler.
    $scope.onDragOver = function (event) {
        // ...
    };

    $scope.setFilterType = function(filter, filterOption)
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

    $scope.remove = function(object,type)
    {
        if (type == 'column')
        {
            if ($scope.columns)
                $scope.removeFromArray($scope.columns, object);
        }

        detectLayerJoins();

    }

    $scope.getDistinctValues = function(filter)
    {
        promptModel.getDistinctValues($scope, filter);
    };


    $scope.selectSearchValue = function(searchValue)
    {
        promptModel.selectSearchValue($scope);
        $scope.processStructure();
    };

    $scope.toggleSelection = function toggleSelection(value)
    {
        promptModel.toggleSelection($scope,value);
    };

    $scope.isValueSelected = function(value)
    {
        promptModel.isValueSelected($scope,value);
    }


    function thereIsAJoinForMe(element)
    {
        var found = 0;
        for (var i in $scope.columns)
        {
             if (element.elementID != $scope.columns[i].elementID)
             {
                 if (joinExists(element.collectionID,$scope.columns[i].collectionID))
                    found = found+1;
             }
        }

        return found;
    }

    function joinExists(collection1,collection2)
    {
        var found = false;

        if (collection1 != collection2)
        {
            for (var j in $scope.selectedLayer.params.joins)
            {
                if (($scope.selectedLayer.params.joins[j].sourceCollectionID == collection1 && $scope.selectedLayer.params.joins[j].targetCollectionID == collection2) ||
                    ($scope.selectedLayer.params.joins[j].sourceCollectionID == collection2 && $scope.selectedLayer.params.joins[j].targetCollectionID == collection1))
                {
                    found = true;
                }
            }
        } else
            found = true;

        return found;
    }


    function checkChoosedElements()
    {
        if ($scope.columns.length > 1)
        {
            for( var e=$scope.columns.length -1;e>=0;e--)
            {
                if (thereIsAJoinForMe($scope.columns[e]) == 0)
                {

                   /*
                   //is this element in the xkeys?
                    if ($scope.selectedReport.properties.xkeys.length > 0)
                    {
                        for( var x=$scope.selectedReport.properties.xkeys.length -1;x>=0;x--)
                        {
                           if ($scope.selectedReport.properties.xkeys[x].elementID == $scope.columns[e].elementID)
                               $scope.selectedReport.properties.xkeys.splice(x,1);
                        }
                    }

                    if ($scope.selectedReport.properties.ykeys.length > 0)
                    {
                        for( var y=$scope.selectedReport.properties.ykeys.length -1;y>=0;y--)
                        {
                            if ($scope.selectedReport.properties.ykeys[y].elementID == $scope.columns[e].elementID)
                                $scope.selectedReport.properties.ykeys.splice(y,1);
                        }
                    }
                    */

                $scope.columns.splice(e,1);
                }
            }
        }


    }

    function generateQuery(done)
    {
       console.log('entering generateQuery');
        $scope.query = {};
        $scope.query.datasources = [];
        $scope.query.order = $scope.order;


        var filters = $scope.filters;

        var datasourcesList = [];
        var layersList = [];

        for (var i in $scope.columns) {
            if (datasourcesList.indexOf($scope.columns[i].datasourceID) == -1)
                datasourcesList.push($scope.columns[i].datasourceID);
            if (layersList.indexOf($scope.columns[i].layerID) == -1)
                layersList.push($scope.columns[i].layerID);
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

            for (var z in $scope.columns) {
                if ($scope.columns[z].datasourceID == datasourcesList[i])
                {
                    if (dtsCollections.indexOf($scope.columns[z].collectionID) == -1)
                        dtsCollections.push($scope.columns[z].collectionID);
                }
            }
            //console.log('these are the filters:',filters);

            getFiltersCollections(filters,dtsCollections,datasourcesList[i], function(){

                        for (var n in dtsCollections) {

                            var collection = {};
                            collection.collectionID = dtsCollections[n];

                            collection.columns = [];

                            for (var n1 in $scope.columns) {
                                if ($scope.columns[n1].collectionID == dtsCollections[n])
                                {
                                    collection.columns.push($scope.columns[n1]);
                                }
                            }

                            collection.order = [];

                            for (var n1 in $scope.order) {
                                if ($scope.order[n1].collectionID == dtsCollections[n])
                                {
                                    collection.order.push($scope.order[n1]);
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
                        $scope.query.datasources.push(dtsObject);
                        $scope.query.layers = layersList;

            });

        }

        $scope.query.groupFilters = $scope.filters;

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

    $scope.setFilterPrompt = function(filter)
    {
        $('#filterPromptsModal').modal('hide');
        if (filter.filterPrompt == true)
            filter.filterPrompt = false;
        else
            filter.filterPrompt = true;
    }

    $scope.getButtonFilterPromptMessage = function(filter)
    {
        if (filter.filterPrompt == true)
            return 'Select to deactivate the prompt for this filter';
            else
            return 'Create a prompt for this filter, the filter will ask for a value each time the report is executed.' + "\n" +' '+ 'Click here to activate the prompt for this filter.';
    }

    $scope.filterPromptsClick = function (filter) {
        $scope.selectedFilter = filter;
        if (!$scope.selectedFilter.promptTitle || $scope.selectedFilter.promptTitle == '')
            $scope.selectedFilter.promptTitle = $scope.selectedFilter.objectLabel;

        $('#filterPromptsModal').modal('show');
    };




});