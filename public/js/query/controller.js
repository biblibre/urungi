app.controller('queryCtrl', function ($scope, connection, $compile, queryModel, queryService, $routeParams,$timeout,$rootScope,bsLoadingOverlayService, grid, uuid2) {


    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.dateModal = 'partials/report/dateModal.html';
    $scope.linkModal = 'partials/report/linkModal.html';
    $scope.filterPromptModal = 'partials/query/filter-prompt-modal.html';
    $scope.dropArea = 'partials/query/drop-area.html';
    $scope.selectedReport = {reportType: 'grid'};
    $scope.gettingData = false;
    $scope.showSQL = false;
    $scope.rows = [];
    $scope.columns = queryModel.columns();
    $scope.order = queryModel.order();
    $scope.filters = queryModel.filters();
    $scope.dataSources = [];
    $scope.query = queryModel.query();
    $scope.queryStructure = queryService.getQuery;
    $scope.queries = queryModel.queries();
    $scope.selectedLayerID = queryModel.selectedLayerID;
    $scope.layers = [];

    //$scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};

    $scope.rootItem = queryModel.rootItem();

    $scope.fieldsAggregations = queryModel.fieldsAggregations;



    var hashCode = function(s){
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    };

    $scope.initQuery = function() {

        queryModel.initQuery();

    }

    $scope.getSQLPanel = function()
    {
        $scope.showSQL = !$scope.showSQL;
    }

    $scope.onDateSet = function (newDate, oldDate, filter) {
        queryModel.onDateSet(newDate,oldDate,filter);
    }

    $scope.onDateEndSet = function (newDate, oldDate, filter) {
        queryModel.onDateEndSet(newDate,oldDate,filter);
    }

    $scope.removeItem = function(item, collection)
    {
        var id = collection.indexOf(item);
        collection.splice(id,1);
    }

    $scope.$on("newQuery", function (event, args) {
        $scope.initQuery();
    });

    $scope.$on("loadQueryStructure", function (event, args) {
        var theQuery = args.query;
        $scope.query = theQuery.query;
        $scope.rows = theQuery.rows;
        $scope.columns = theQuery.columns;
        $scope.order = theQuery.order;
        $scope.filters = theQuery.filters;
        $scope.dataSources = theQuery.dataSources;
        $scope.selectedLayerID = theQuery.selectedLayerID;
        $scope.changeLayer($scope.selectedLayerID);
        $scope.queries = [];
        queryModel.detectLayerJoins($scope);
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
        queryStructure.selectedLayerID = $scope.selectedLayerID;
        queryService.addQuery(queryStructure);
    }

    $scope.stringVariables = [
        {value:"toUpper",label:"To Upper"},
        {value:"toLower",label:"To Lower"}
    ];

    if ($routeParams.extra == 'intro') {
            $timeout(function(){$scope.showIntro()}, 1000);
        }

    $scope.initForm = function() {
        queryModel.getLayers( function(layers,selectedLayerID){
            $scope.layers = layers;
            $scope.selectedLayerID = selectedLayerID;
        });
    }

    $scope.getLayers = function() {
        queryModel.getLayers();
    };

    $scope.IntroOptions = {
            //IF width > 300 then you will face problems with mobile devices in responsive mode
                steps:[
                    {
                        element: '#dataObjectsIntroBlock',
                        html: '<div><h3>The layer catalog</h3><span style="font-weight:bold;">Access here the different data elements of every layer that you have access on</span><br/><span>Select elements and drag and drop them over the query design zone, depending if the element is going to be used as a column result (columns area), as a filter (filters area) or as an element to order by the results of the query (order by area)</span></div>',
                        width: "300px",
                        height: "250px"
                    },
                    {
                        element: '#selectLayer',
                        html: '<div><h3>The layer selector</h3><span style="font-weight:bold;">Select here the layer where your query will be based on.</span><br/><span>One query can only be baes in just one layer, you can not mix elements from different layers in the same query</span></div>',
                        width: "300px",
                        height: "250px",
                        areaColor: 'transparent',
                        areaLineColor: '#8DC63F'

                    },
                    {
                        element: '#columnsPanel',
                        html: '<div><h3>Columns / results drop zone</h3><span style="font-weight:bold;">Drop here the elements you want to have in the results of the query</span><br/><span>A query must hold at least one element here to be executed</span></div>',
                        width: "300px",
                        height: "180px"
                    },
                    {
                        element: '#orderByPanel',
                        html: '<div><h3>Order By drop zone</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;"> Drop here the elements that you want to use to order the results of the query</span><br/><span> The elements you drop in here do not necessarily have to be in the columns/results area, a query can be ordered by elements that do not appear in the results</span></div>',
                        width: "300px",
                        height: "250px"
                    },
                    {
                        element: '#filtersPanel',
                        html: '<div><h3>Filters drop zone</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Drop here the elements that you want to use to filter the results of the query</span><br/><span> The elements you drop in here do not necessarily have to be in the columns/results area, a query can be filtered by elements that do not appear in the results</span></div>',
                        width: "300px",
                        height: "250px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#reportLayout',
                        html: '<div><h3>Results area</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">As you define the query draging and droping in the areas above, the results of the query will appear here</span><br/><span></span></div>',
                        width: "300px",
                        height: "150px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#queryRefresh',
                        html: '<div><h3>Query refresh</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Use this button to refresh the results</span><br/><span>The query will be sent again to the server an executed to get the most up to date data</span></div>',
                        width: "300px",
                        height: "150px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#saveQueryForPageBtn',
                        html: '<div><h3>Save query for page report</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Once you complete your query, click this button to save the query and back to the page report design</span><br/><span>The results of the query will be then used in the page report to create charts and data grids across the page.</span></div>',
                        width: "300px",
                        height: "200px",
                        horizontalAlign: "right",
                        areaColor: 'transparent',
                        areaLineColor: '#fff'
                    }

                ]
            }

            if ($rootScope.user.pagesCreate || $rootScope.counts.pages > 0)
                {
                $scope.IntroOptions.steps.push({
                        element: '#parentIntro',
                        html: '<div><h3>Next Step</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Page reports</span><br/><br/>See how you can create customized web pages that shows your data using charts and data grids along with HTML components<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/page/intro">Go to pages designer and continue tour</a></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "250px"
                    });
                } else {
                    if ($rootScope.user.reportsCreate || $rootScope.counts.reports > 0)
                        {
                        $scope.IntroOptions.steps.push({
                                element: '#parentIntro',
                                html: '<div><h3>Next Step</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Single query reports</span><br/><br/>See how you can create single query reports that shows your data using charts and data grids<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/report/intro">Go to single query report designer and continue tour</a></span></div>',
                                width: "500px",
                                objectArea: false,
                                verticalAlign: "top",
                                height: "250px"
                            });
                        } else {
                            if ($rootScope.user.dashboardsCreate || $rootScope.counts.dashBoards > 0)
                                {
                                $scope.IntroOptions.steps.push({
                                        element: '#parentIntro',
                                        html: '<div><h3>Next Step</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Dashboards</span><br/><br/>See how to create dashboards composed with a set of single query reports<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/dashboard/intro">Go to dashboards and continue tour</a></span></div>',
                                        width: "500px",
                                        objectArea: false,
                                        verticalAlign: "top",
                                        height: "250px"
                                    });
                                }
                        }

                }

    $scope.changeLayer = function(selectedLayerID)
    {
        queryModel.changeLayer(selectedLayerID);
    }

    $scope.detectLayerJoins = function()
    {
        queryModel.detectLayerJoins();
    }

    $scope.getQuery = function(queryID)
    {
        for (var q in $scope.queries)
        {
            if ($scope.queries[q].id == queryID)
                return $scope.queries[q]
        }
    }

    $scope.getView = function (item) {
        if (item) {
            return 'nestable_item.html';
        }
        return null;
    };

    $scope.processStructure = function(execute) {
        $scope.gettingData = false;

        queryModel.processStructure(execute,function(){
            $scope.getDataForPreview();
        });
    }

    $scope.getElementFilterOptions = function(elementType)
    {
        return queryModel.getElementFilterOptions(elementType);
    }

    var lastDrop = null;
    // Drop handler.
    $scope.onDrop = function (data, event, type, group) {
        $scope.gettingData = false;
        queryModel.onDrop($scope,data,event,type,group, function(){
            $scope.getDataForPreview();
        });
    };

    $scope.onDropOnFilter = function (data, event, filter) {
        $scope.gettingData = false;
        queryModel.onDropOnFilter(data,event,filter);
    };

    $scope.conditionTypes = queryModel.conditionTypes;


    $scope.filtersUpdated = function() {
        queryModel.filtersUpdated();
    }


    $scope.updateCondition = function(filter, condition) {
        queryModel.updateCondition(filter, condition);
    };

    $scope.onDragOver = function (event) {
        // ...
    };

    $scope.setFilterType = function(filter, filterOption)
    {
        queryModel.setFilterType(filter, filterOption);
    }

    $scope.remove = function(object,type)
    {
        queryModel.removeQueryItem(object,type);
        /*
        if (type == 'column')
        {
            if ($scope.columns)
                $scope.removeFromArray($scope.columns, object);
        }

        queryModel.detectLayerJoins();
        */
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
            return 'Select to deactivate the runtime';
            else
            return  'Make this filter appear in the report interface.';
    }

    $scope.filterPromptsClick = function (filter) {
        $scope.selectedFilter = filter;
        if (!$scope.selectedFilter.promptTitle || $scope.selectedFilter.promptTitle == '')
            $scope.selectedFilter.promptTitle = $scope.selectedFilter.objectLabel;

        $('#filterPromptsModal').modal('show');
    };

    $scope.getDataForPreview  = function()
    {

        $scope.gettingData = true;
        bsLoadingOverlayService.start({referenceId: 'reportLayout'});

        if (!$scope.query)
            $scope.query = {};

        $scope.query.id = uuid2.newguid();
        $scope.queries = [];
        $scope.queries.push($scope.query);


        queryModel.getQueryData( function(data,sql){

                $scope.queries[0].data = data;
                $scope.sql = sql;

                var gridProperties = {rowHeight:20,
                                     cellBorderColor:'#000'};

                grid.simpleGrid($scope.columns,$scope.query.name,$scope.query,false,gridProperties,function(){
                        bsLoadingOverlayService.stop({referenceId: 'reportLayout'});
                        $scope.gettingData = false;

                });
        });
    }

});
