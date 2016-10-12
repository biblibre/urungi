/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 07/07/16
 * Time: 09:17
 * To change this template use File | Settings | File Templates.
 */

app.controller('report_v2Ctrl', function ($scope, connection, $compile, queryModel, queryService, promptModel, $routeParams,$timeout,$rootScope,bsLoadingOverlayService, grid, uuid2,c3Charts,report_v2Model,widgetsCommon) {

    $scope.searchModal = 'partials/report/searchModal.html';
    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.dateModal = 'partials/report/dateModal.html';
    $scope.linkModal = 'partials/report/linkModal.html';
    $scope.repeaterTemplate = 'partials/report/repeater.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.columnFormatModal = 'partials/report/columnFormatModal.html';
    $scope.columnSignalsModal = 'partials/report/columnSignalsModal.html';
    $scope.filterPromptModal = 'partials/query/filter-prompt-modal.html';
    $scope.dropArea = 'partials/query/drop-area.html';
    $scope.reportNameModal = 'partials/report/reportNameModal.html';

    $scope.selectedReport = {};
    $scope.selectedReport.draft = true;
    $scope.selectedReport.badgeStatus = 0;
    $scope.selectedReport.exportable = true;
    $scope.selectedReport.badgeMode = 1;
    $scope.selectedReport.properties = {};
    $scope.selectedReport.properties.xkeys = [];
    $scope.selectedReport.properties.ykeys = [];
    $scope.selectedReport.properties.columns = [];
    $scope.selectedReport.reportType = 'grid';
    $scope.selectedReport.query = {};

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
    $scope.mode = 'add';

    //$scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};

    $scope.rootItem = queryModel.rootItem();

    $scope.fieldsAggregations = queryModel.fieldsAggregations;

    $scope.textAlign = widgetsCommon.textAlign;

    $scope.fontSizes = widgetsCommon.fontSizes;

    $scope.fontWeights = widgetsCommon.fontWeights;

    $scope.fontStyles = widgetsCommon.fontStyles;

    $scope.colors = widgetsCommon.colors;

    $scope.signalOptions = widgetsCommon.signalOptions;


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
        console.log('load query strucuture');
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


        $scope.dataMode = 'preview';
        if ($routeParams.reportID)
            if ($routeParams.reportID == 'true') {
                //New Report
                $scope.selectedReport = {};
                $scope.selectedReport.draft = true;
                $scope.selectedReport.badgeStatus = 0;
                $scope.selectedReport.exportable = true;
                $scope.selectedReport.badgeMode = 1;
                $scope.selectedReport.properties = {};
                $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.columns = [];
                $scope.selectedReport.reportType = 'grid';
                $scope.mode = 'add';
            } else {
                report_v2Model.getReportDefinition($routeParams.reportID,false, function(report) {
                    if (report)
                        {
                            $scope.selectedReport = report;
                            report_v2Model.getReport(report,'reportLayout',function() {
                                //Done
                                $scope.mode = 'edit';
                            });
                        } else {
                            //TODO:No report found message
                        }
                });
            }
        if ($routeParams.queryID)
            if ($routeParams.queryID == 'true') {
                $scope.isQuery = true;
                $scope.selectedReport = {};
                $scope.selectedReport.draft = true;
                $scope.selectedReport.badgeStatus = 0;
                $scope.selectedReport.exportable = true;
                $scope.selectedReport.badgeMode = 1;
                $scope.selectedReport.properties = {};
                $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.columns = [];
                $scope.selectedReport.reportType = 'grid';
                $scope.mode = 'add';
            }



    };

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
        /*
        for (var q in $scope.queries)
        {
            if ($scope.queries[q].id == queryID)
                return $scope.queries[q]
        }
        */
        return queryModel.query();
    }

    $scope.getReport = function(hashedID)
    {
        return $scope.selectedReport;
    }

    $scope.getReportColumnDefs = function(reportID)
    {
        return $scope.selectedReport.properties.columnDefs;
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
        console.log('the filter in controller',filter);
        queryModel.onDropOnFilter(data,event,filter);
    };

    $scope.onDropOnDims = function (data, event, type, group) {
        $scope.gettingData = false;
        // Get custom object data.
        var customObjectData = data['json/custom-object']; // {foo: 'bar'}
        if (!$scope.selectedReport.properties.xkeys)
                $scope.selectedReport.properties.xkeys = [];
        $scope.selectedReport.properties.xkeys.push(customObjectData);

        queryModel.onDrop($scope,data,event,type,group, function(){
            $scope.getDataForPreview();
        });
    };

    $scope.onDropOnMetrics = function (data, event, type, group) {
        $scope.gettingData = false;
        // Get custom object data.
        var customObjectData = data['json/custom-object']; // {foo: 'bar'}
        if (!$scope.selectedReport.properties.ykeys)
                $scope.selectedReport.properties.ykeys = [];
        $scope.selectedReport.properties.ykeys.push(customObjectData);

        queryModel.onDrop($scope,data,event,type,group, function(){
            $scope.getDataForPreview();
        });
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

        //if (type == 'column')
        //{  //Is included in a previous xkey or ykey
           $scope.removeFromArray($scope.selectedReport.properties.xkeys, object);
           $scope.removeFromArray($scope.selectedReport.properties.ykeys, object);
        //}

        //if (type == 'xkey')
        //{
          // $scope.removeFromArray($scope.selectedReport.properties.xkeys, object);
          // type = 'column'; //this is for the query to update
        //}

        //if (type == 'ykey')
        //{
          // $scope.removeFromArray($scope.selectedReport.properties.ykeys, object);
           type = 'column'; //this is for the query to update
        //}



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

    $scope.getDataForPreview  = function()
    {

        var el = document.getElementById('reportLayout');
        angular.element(el).empty();


        var query = queryModel.query();
        $scope.selectedReport.query = query;


                if ($scope.selectedReport.reportType == 'grid')
                    {
                        var clonedColumns = clone(queryModel.columns());
                        $scope.selectedReport.properties.columns = clonedColumns;
                        report_v2Model.getReport($scope.selectedReport,'reportLayout', function(sql){


                            $scope.sql = sql;
                        });
                    }

                if ($scope.selectedReport.reportType == 'chart-line' || $scope.selectedReport.reportType == 'chart-donut' || $scope.selectedReport.reportType == 'chart-pie')
                    {

                        if ($scope.selectedReport.properties.xkeys.length > 0 && $scope.selectedReport.properties.ykeys.length > 0)
                            {
                                var theChartID = 'Chart'+uuid2.newguid();
                                $scope.selectedReport.properties.chart = {chartID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300,type:'bar',query:query,queryName:null};
                                //$scope.selectedReport.properties.chart.query = query;
                                $scope.selectedReport.properties.chart.dataColumns = $scope.selectedReport.properties.ykeys;


                                var customObjectData = $scope.selectedReport.properties.xkeys[0];
                                $scope.selectedReport.properties.chart.dataAxis = {elementName:customObjectData.elementName,
                                                                        queryName:'query1',
                                                                        elementLabel:customObjectData.objectLabel,
                                                                        id:customObjectData.id,
                                                                        type:'bar',
                                                                        color:'#000000'}
                                report_v2Model.getReport($scope.selectedReport,'reportLayout', function(sql){

                                    $scope.sql = sql;
                                });

                            }
                    }
        if ( $scope.selectedReport.reportType == 'gauge')
                    {

                        var theChartID = 'Chart'+uuid2.newguid();
                        $scope.selectedReport.properties.chart = {chartID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300,type:'bar',query:query,queryName:null};
                        //$scope.selectedReport.properties.chart.query = query;
                        $scope.selectedReport.properties.chart.dataColumns = $scope.selectedReport.properties.ykeys;
                        var customObjectData = $scope.selectedReport.properties.xkeys[0];
                        report_v2Model.getReport($scope.selectedReport,'reportLayout', function(sql){

                            $scope.sql = sql;
                        });
                    }
    }


    $scope.changeReportType = function(newReportType)
    {
        //If there are no xkeys and y keys move from columns

        //Clean all previous
        $scope.selectedReport.properties.xkeys = [];
        $scope.selectedReport.properties.ykeys = [];
        //$scope.selectedReport.properties.columns = [];
        //$scope.columns = queryModel.columns();
        queryModel.initQuery();
        $scope.columns = queryModel.columns();
        $scope.order = queryModel.order();
        $scope.filters = queryModel.filters();

        if (!$scope.selectedReport.properties.xkeys)
         {
            for (var c in $scope.selectedReport.properties.columns)
            {

            if ($scope.selectedReport.properties.columns[c].elementType == 'count' || $scope.selectedReport.properties.columns[c].elementType == 'number')
                {
                    if (!$scope.selectedReport.properties.ykeys)
                        $scope.selectedReport.properties.ykeys = [];
                    $scope.selectedReport.properties.ykeys.push($scope.selectedReport.properties.columns[c]);
                } else {
                    if (!$scope.selectedReport.properties.xkeys)
                        $scope.selectedReport.properties.xkeys = [];
                    $scope.selectedReport.properties.xkeys.push($scope.selectedReport.properties.columns[c]);
                }
            }
        }

        if (newReportType == 'grid')
        {
            $scope.selectedReport.reportType = 'grid';
        }
        if (newReportType == 'chart-bar')
        {
            $scope.selectedReport.reportType = 'chart-bar';
        }
        if (newReportType == 'chart-line')
        {
            $scope.selectedReport.reportType = 'chart-line';
        }
        if (newReportType == 'chart-area')
        {
            $scope.selectedReport.reportType = 'chart-area';
        }
        if (newReportType == 'chart-donut')
        {
            $scope.selectedReport.reportType = 'chart-donut';
        }
        if (newReportType == 'pivot')
        {
            $scope.selectedReport.reportType = 'pivot';
        }
        if (newReportType == 'indicator')
        {
            $scope.selectedReport.reportType = 'indicator';
            if (!$scope.selectedReport.properties.style)
                $scope.selectedReport.properties.style = 'style1';
            if (!$scope.selectedReport.properties.backgroundColor)
                $scope.selectedReport.properties.backgroundColor = '#68b828';
            if (!$scope.selectedReport.properties.reportIcon)
                $scope.selectedReport.properties.reportIcon = 'fa-bolt';
            if (!$scope.selectedReport.properties.mainFontColor)
                $scope.selectedReport.properties.mainFontColor = '#000000';
            if (!$scope.selectedReport.properties.descFontColor)
                $scope.selectedReport.properties.descFontColor = '#CCCCCC';

        }
        if (newReportType == 'vectorMap')
        {
            $scope.selectedReport.reportType = 'vectorMap';
        }

        if (newReportType == 'gauge')
        {
            $scope.selectedReport.reportType = 'gauge';

            if (!$scope.selectedReport.properties.lines)
                $scope.selectedReport.properties.lines = 20; // The number of lines to draw    12
            if (!$scope.selectedReport.properties.angle)
                $scope.selectedReport.properties.angle = 15; // The length of each line
            if (!$scope.selectedReport.properties.lineWidth)
                $scope.selectedReport.properties.lineWidth = 44; // The line thickness
            if (!$scope.selectedReport.properties.pointerLength)
                $scope.selectedReport.properties.pointerLength = 70;
            if (!$scope.selectedReport.properties.pointerStrokeWidth)
                $scope.selectedReport.properties.pointerStrokeWidth = 35;
            if (!$scope.selectedReport.properties.pointerColor)
                $scope.selectedReport.properties.pointerColor =  '#000000';
            if (!$scope.selectedReport.properties.limitMax)
                $scope.selectedReport.properties.limitMax = 'false';   // If true, the pointer will not go past the end of the gauge
            if (!$scope.selectedReport.properties.colorStart)
                $scope.selectedReport.properties.colorStart = '#6FADCF';   // Colors
            if (!$scope.selectedReport.properties.colorStop)
                $scope.selectedReport.properties.colorStop = '#8FC0DA';    // just experiment with them
            if (!$scope.selectedReport.properties.strokeColor)
                $scope.selectedReport.properties.strokeColor = '#E0E0E0';   // to see which ones work best for you
            if (!$scope.selectedReport.properties.generateGradient)
                $scope.selectedReport.properties.generateGradient = true;
            if (!$scope.selectedReport.properties.minValue)
                $scope.selectedReport.properties.minValue = 0;
            if (!$scope.selectedReport.properties.maxValue)
                $scope.selectedReport.properties.maxValue = 100;
            if (!$scope.selectedReport.properties.animationSpeed)
                $scope.selectedReport.properties.animationSpeed = 32;
        }

        //$scope.processStructure();
    }

    $scope.changeChartColumnType = function(column)
    {
        c3Charts.changeChartColumnType($scope.selectedReport.properties.chart,column);
    }

    $scope.changeChartSectorType = function()
    {
        if (!$scope.selectedReport.reportType == 'chart-donut')
            $scope.selectedReport.reportType = 'chart-donut';
        else
            $scope.selectedReport.reportType = 'chart-pie';



        $scope.processStructure();
    }

    function clone(obj) {
    var copy;

    // Handle the 3 simple types, and null or undefined
    if (null == obj || "object" != typeof obj) return obj;

    // Handle Date
    if (obj instanceof Date) {
        copy = new Date();
        copy.setTime(obj.getTime());
        return copy;
    }

    // Handle Array
    if (obj instanceof Array) {
        copy = [];
        for (var i = 0, len = obj.length; i < len; i++) {
            copy[i] = clone(obj[i]);
        }
        return copy;
    }

    // Handle Object
    if (obj instanceof Object) {
        copy = {};
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = clone(obj[attr]);
        }
        return copy;
    }

    throw new Error("Unable to copy obj! Its type isn't supported.");
}

$scope.changeColumnStyle = function(columnIndex ,hashedID)
    {
        report_v2Model.changeColumnStyle($scope.selectedReport,columnIndex,hashedID);
        $scope.selectedColumn = report_v2Model.selectedColumn();
        $scope.selectedColumnHashedID  = report_v2Model.selectedColumnHashedID();
        $scope.selectedColumnIndex  = report_v2Model.selectedColumnIndex();
    }

$scope.changeColumnSignals = function(columnIndex ,hashedID)
    {

        report_v2Model.changeColumnSignals($scope.selectedReport,columnIndex,hashedID);
        $scope.selectedColumn = report_v2Model.selectedColumn();
        $scope.selectedColumnHashedID  = report_v2Model.selectedColumnHashedID();
        $scope.selectedColumnIndex  = report_v2Model.selectedColumnIndex();
    /*
        $scope.selectedColumn = $scope.selectedReport.properties.columns[columnIndex];
        $scope.selectedColumnHashedID  = hashedID;
        $scope.selectedColumnIndex  = columnIndex;

        if (!$scope.selectedColumn.signals)
            $scope.selectedColumn.signals = [];


        $('#columnSignalsModal').modal('show');
*/

    }


$scope.changeColumnColor = function(color)
    {
        if ($scope.selectedColumn.columnStyle)
        $scope.selectedColumn.columnStyle.color = color;
    }

    $scope.changeColumnBackgroundColor = function(color)
    {
        if ($scope.selectedColumn.columnStyle)
        $scope.selectedColumn.columnStyle['background-color'] = color;
    }

    $scope.setColumnFormat = function()
    {
        report_v2Model.repaintReport($scope.selectedReport);
    }

    $scope.orderColumn = function(columnIndex,desc,hashedID) {
        report_v2Model.orderColumn($scope.selectedReport,columnIndex,desc,hashedID);
    };

    $scope.reportName = function () {
        $('#theReportNameModal').modal('show');
    };
    $scope.reportNameSave = function () {
        report_v2Model.saveAsReport($scope.selectedReport,$scope.mode,function(){
            $('#theReportNameModal').modal('hide');
            $scope.goBack();
        });

        $('modal-backdrop').remove();

    };


});
