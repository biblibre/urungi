/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 07/07/16
 * Time: 09:17
 * To change this template use File | Settings | File Templates.
 */

app.controller('report_v2Ctrl', function ($scope, connection, $compile, queryModel, queryService,reportService,  $routeParams,$timeout,$rootScope, bsLoadingOverlayService, grid, uuid2,c3Charts,report_v2Model,widgetsCommon,$location,PagerService) {

    $scope.searchModal = 'partials/report/searchModal.html';
    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.dateModal = 'partials/report/dateModal.html';
    $scope.linkModal = 'partials/report/linkModal.html';
    $scope.repeaterTemplate = 'partials/report/repeater.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.columnFormatModal = 'partials/report/columnFormatModal.html';
    $scope.columnSignalsModal = 'partials/report/columnSignalsModal.html';
    $scope.filterPromptModal = 'partials/query/filter-prompt-modal.html';
    $scope.dropArea = 'partials/report_v2/drop-area.html';
    $scope.reportNameModal = 'partials/report_v2/reportNameModal.html';
    $scope.dashListModal = 'partials/report_v2/dashboardListModal.html';
    $scope.settingsTemplate = 'partials/widgets/common.html';
    $scope.tabs = {selected: 'elements'};


    $scope.fieldsAggregations = queryModel.fieldsAggregations;


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

    $scope.page = 1;


    $scope.gettingData = false;
    $scope.showSQL = false;

    $scope.rows = [];
    $scope.selectedLayerID = queryModel.selectedLayerID;
    $scope.layers = [];
    $scope.mode = 'preview';
    $scope.isForDash = false;
    $scope.showPrompts = true;
    $scope.pager = {};

    $scope.getSelectedLayer = function()
    {
        return queryModel.selectedLayerID;
    }

    //$scope.rootItem = {elementLabel: '', elementRole: 'root', elements: []};

    $scope.rootItem = queryModel.rootItem();

    $scope.fieldsAggregations = queryModel.fieldsAggregations;

    $scope.textAlign = widgetsCommon.textAlign;

    $scope.fontSizes = widgetsCommon.fontSizes;

    $scope.fontWeights = widgetsCommon.fontWeights;

    $scope.fontStyles = widgetsCommon.fontStyles;

    $scope.colors = widgetsCommon.colors;

    $scope.signalOptions = widgetsCommon.signalOptions;

    $scope.queryModel = queryModel;

    $scope.getPrompts = function()
    {
        if ($scope.selectedReport.query)
            return $scope.selectedReport.query.groupFilters;
    }


    var hashCode = function(s){
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    };

    $scope.getSQLPanel = function()
    {
        $scope.showSQL = !$scope.showSQL;
    }

    $scope.onDateSet = function (newDate, oldDate, filter) {
        queryModel.onDateSet(newDate,oldDate,filter);
        $scope.processStructure();
    }

    $scope.onDateEndSet = function (newDate, oldDate, filter) {
        queryModel.onDateEndSet(newDate,oldDate,filter);
        $scope.processStructure();
    }

    $scope.removeItem = function(item, collection)
    {
        var id = collection.indexOf(item);
        collection.splice(id,1);
    }

    $scope.$on("newReport", function (event, args) {
        //$scope.initReport();
    });

    $scope.$on("newReportForDash", function (event, args) {
        $scope.mode = 'add';
        $scope.isForDash = true;

        $scope.selectedReport = {};
        $scope.selectedReport.id = uuid2.newguid();
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
        queryModel.initQuery();


    });

    $scope.$on("loadReportStrucutureForDash", function (event, args) {
        //UNA QUERY SOLO PUEDE PERTENECER A UNA LAYER POR LO QUE EN LUGAR DE LAYERS ES LAYERID
        //VER TB POR QUE HAY MAS DE UNA LAYER EN QUERY Y A NULL
        var report = args.report;
        $scope.isForDash = true;
        $scope.showOverlay('OVERLAY_reportLayout');
        $scope.selectedReport = report;
        $scope.mode = 'edit';
        queryModel.loadQuery(report.query);
        queryModel.detectLayerJoins();
                            report_v2Model.getReport(report,'reportLayout',$scope.mode,function() {
                                $scope.hideOverlay('OVERLAY_reportLayout');
                            });
    });



    $scope.showOverlay = function (referenceId) {
        bsLoadingOverlayService.start({
            referenceId: referenceId
        });
    };

    $scope.hideOverlay = function (referenceId) {
        bsLoadingOverlayService.stop({
            referenceId: referenceId
        });
    };

/*
    $scope.$on("loadQueryStructure", function (event, args) {
        var theQuery = args.query;
        //$scope.query = theQuery.query;
        //$scope.rows = theQuery.rows;
        //$scope.columns = theQuery.columns;
        //$scope.order = theQuery.order;
        //$scope.filters = theQuery.filters;
        //$scope.dataSources = theQuery.dataSources;
        $scope.selectedLayerID = theQuery.selectedLayerID;
        $scope.changeLayer($scope.selectedLayerID);
        //$scope.queries = [];
        queryModel.detectLayerJoins($scope);
        $scope.processStructure();
        console.log('load query strucuture');
    });
*/

    $scope.saveReportStructure = function() {
        var clonedReport = $scope.selectedReport;
        reportService.addReport(clonedReport);
    }
/*
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
*/
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

                $scope.selectedReport = {};
                $scope.selectedReport.draft = true;
                $scope.selectedReport.badgeStatus = 0;
                $scope.selectedReport.exportable = true;
                $scope.selectedReport.badgeMode = 1;
                $scope.selectedReport.properties = {};
                $scope.selectedReport.properties.xkeys = [];
                $scope.selectedReport.properties.ykeys = [];
                $scope.selectedReport.properties.columns = [];
                ///$scope.selectedReport.properties.filters = [];
                $scope.selectedReport.properties.order = [];

                $scope.selectedReport.properties.backgroundColor = "#FFFFFF";
                $scope.selectedReport.properties.height = 400;
                $scope.selectedReport.properties.headerHeight = 60;
                $scope.selectedReport.properties.rowHeight = 35;
                $scope.selectedReport.properties.headerBackgroundColor = "#FFFFFF";
                $scope.selectedReport.properties.headerBottomLineWidth = 4;
                $scope.selectedReport.properties.headerBottomLineColor = "#999999";
                $scope.selectedReport.properties.rowBorderColor = "#CCCCCC";
                $scope.selectedReport.properties.rowBottomLineWidth = 2;
                $scope.selectedReport.properties.columnLineWidht = 0;

                $scope.selectedReport.reportType = 'grid';
                $scope.selectedLayerID = queryModel.selectedLayerID;
                $scope.mode = 'add';
                queryModel.initQuery();


        $scope.mode = 'preview';
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
                            $scope.showOverlay('OVERLAY_reportLayout');
                            $scope.selectedReport = report;
                            $scope.mode = 'edit';
                            queryModel.loadQuery(report.query);
                            queryModel.detectLayerJoins();
                            report_v2Model.getReport(report,'reportLayout',$scope.mode,function() {
                                $scope.hideOverlay('OVERLAY_reportLayout');
                            });


                        } else {
                            //TODO:No report found message
                        }
                });
            }
    };


    $scope.getReports = function(params) {
        var params = (params) ? params : {};


        connection.get('/api/reports/find-all', params, function(data) {
            $scope.reports = data;
        });
    };

    $scope.getReports = function(page, search, fields) {
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

        connection.get('/api/reports/find-all', params, function(data) {
            $scope.reports = data
            //$scope.items = data.items;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.reports.items.length, data.page,10,data.pages);
        });
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
        $scope.selectedLayer = selectedLayerID;
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


        queryModel.processStructure(execute,function(){
            $scope.getDataForPreview();
        });
    }

   /* $scope.getElementFilterOptions = function(elementType)
    {
        return queryModel.getElementFilterOptions(elementType);
    }
    */
    $scope.getDatePatternFilters = function()
    {
        return queryModel.getDatePatternFilters();
    }

    var lastDrop = null;



    // Drop handler.
    $scope.onDrop = function (data, event, type, group) {
        if (!$scope.selectedReport.properties.columns)
                {
                $scope.selectedReport.properties.columns = [];
                }
        var customObjectData = data['json/custom-object'];
        var found = false;

        for (var i in $scope.selectedReport.properties.columns)
            {
               if ($scope.selectedReport.properties.columns[i].elementID == customObjectData.elementID)
                   found = true;
            }
        if (!found)
            {

                $scope.selectedReport.properties.columns.push(customObjectData);
                queryModel.onDrop($scope,data,event,type,group, function(){
                    $scope.getDataForPreview();
                });
            } else {
                noty({text: 'That column already exists',  timeout: 2000, type: 'error'});
            }
    };

    $scope.onDropFilter = function (data, event, type, group) {

        var customObjectData = data['json/custom-object'];
        queryModel.onDrop($scope,data,event,type,group, function(){
                $scope.getDataForPreview();
        });


    }

    $scope.onDropOrder = function (data, event, type, group) {

        if (!$scope.selectedReport.properties.order)
                $scope.selectedReport.properties.order = [];

        var customObjectData = data['json/custom-object'];
        var found = false;

        for (var i in $scope.selectedReport.properties.order)
            {
               if ($scope.selectedReport.properties.order[i].elementID == customObjectData.elementID)
                   found = true;
            }
        if (!found)
            {
                $scope.selectedReport.properties.order.push(customObjectData);
                queryModel.onDrop($scope,data,event,type,group, function(){
                    $scope.getDataForPreview();
                });
            } else {
                noty({text: 'That column order already exists',  timeout: 2000, type: 'error'});
            }





    }

    $scope.filterSortableOptions = {
          stop: function(e, ui)
            {
                reorderFilters();
            }
    };

    function reorderFilters()
    {
       /* for (var i in $scope.selectedReport.properties.filters)
                {
                    if (i == 0)
                        {
                           delete($scope.selectedReport.properties.filters[0].condition);
                           delete($scope.selectedReport.properties.filters[0].conditionLabel);
                        }
                    if (i != 0 && $scope.selectedReport.properties.filters[i].condition == undefined)
                        {
                            $scope.selectedReport.properties.filters[i].condition = 'AND';
                            $scope.selectedReport.properties.filters[i].conditionLabel = 'AND';
                        }
                }
                */
        queryModel.reorderFilters();

    }

    $scope.onDropOnFilterGroup = function (data, event, filter) {
        $scope.gettingData = false;

        var customObjectData = data['json/custom-object'];

        filter.filters = [jQuery.extend({}, filter), customObjectData];

        filter.group = true;

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


        ///$scope.selectedReport.properties.filters.push(filter);

        queryModel.onDropOnFilter(data,event,filter);
    };

    $scope.delete = function (reportID, reportName) {
        $scope.modalOptions = {};
        $scope.modalOptions.headerText = 'Confirm delete report'
        $scope.modalOptions.bodyText = 'Are you sure you want to delete the report:'+' '+reportName;
        $scope.modalOptions.ID = reportID;
        $('#deleteModal').modal('show');
    };

    $scope.deleteConfirmed = function (reportID) {


        connection.post('/api/reports/delete/'+reportID, {id:reportID}, function(result) {
            if (result.result == 1) {
                $('#deleteModal').modal('hide');

                var nbr = -1;
                for (var i in $scope.reports.items)
                {
                    if ($scope.reports.items[i]._id === reportID)
                        nbr = i;
                }

                if (nbr > -1)
                    $scope.reports.items.splice(nbr,1);
            }
        });



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

        if (customObjectData.elementType != 'number')
            {
                customObjectData.aggregation = 'count';
                if (customObjectData.originalLabel == undefined)
                    {
                    customObjectData.originalLabel = customObjectData.elementLabel;
                    }
                customObjectData.elementLabel = customObjectData.originalLabel + ' (count)';
                customObjectData.objectLabel = customObjectData.originalLabel + ' (count)';
            }

        queryModel.onDrop($scope,data,event,type,group, function(){
            $scope.getDataForPreview();
        });
    };
/*
    $scope.conditionTypes = queryModel.conditionTypes;
*/

    $scope.filtersUpdated = function() {
        queryModel.filtersUpdated();
    }

/*
    $scope.updateCondition = function(filter, condition) {
        filter.conditionType = condition.conditionType;
        filter.conditionLabel = condition.conditionLabel;
        queryModel.updateCondition(filter, condition);
    };
*/
    $scope.onDragOver = function (event) {
        // ...
    };
/*
    $scope.setFilterType = function(filter, filterOption)
    {
        queryModel.setFilterType(filter, filterOption);
        console.log('the filter',filter);
        if (filter.filterType == 'null' || filter.filterType == 'notNull')
            $scope.processStructure();
    }
*/


    $scope.filterChanged = function(elementID,values)
    {

        //console.log('the filter has changed...');
        $scope.processStructure();
        /*for (var r in $scope.selectedDashboard.reports)
                {
                    for (var f in $scope.selectedDashboard.reports[r].query.groupFilters)
                        {
                            if ($scope.selectedDashboard.reports[r].query.groupFilters[f].elementID == elementID && $scope.selectedDashboard.reports[r].query.groupFilters[f].filterPrompt == true)
                                {

                                    $scope.selectedDashboard.reports[r].query.groupFilters[f].filterText1 = values.filterText1;
                                    $scope.selectedDashboard.reports[r].query.groupFilters[f].searchValue = values.searchValue;
                                    $scope.selectedDashboard.reports[r].query.groupFilters[f].filterValue = values.filterValue;
                                    $scope.selectedDashboard.reports[r].query.groupFilters[f].dateCustomFilterLabel = values.dateCustomFilterLabel;
                                    $scope.selectedDashboard.reports[r].query.groupFilters[f].filterText2 = values.filterText2;

                                    console.log('the prompt has changed 2...');
                                    getQueryData(r,function(){
                                        rebuildCharts();
                                        rebuildGrids();
                                        rebuildIndicators();

                                    });
                                }
                        }
                }*/


    }

    $scope.remove = function(object,type)
    {

            if (type == 'column')
                {
                    $rootScope.removeFromArray($scope.selectedReport.properties.columns, object);
                }
            if (type == 'filter')
                {

                }
            if (type == 'order')
                {
                    $rootScope.removeFromArray($scope.selectedReport.properties.order, object);
                    for (var i in $scope.selectedReport.properties.order)
                        {
                            if ($scope.selectedReport.properties.order[i].elementID == object.elementID)
                                {

                                    $scope.selectedReport.properties.order.splice(i,1);
                                }
                        }
                }
            if (type == 'ykey')
                {
                    $rootScope.removeFromArray($scope.selectedReport.properties.ykeys, object);
                }
            if (type == 'xkey')
                {
                    $rootScope.removeFromArray($scope.selectedReport.properties.xkeys, object);
                }

            if (type == 'ykey' || type == 'xkey')
                type = 'column';

           queryModel.removeQueryItem(object,type);

           $scope.sql = undefined;
    }




    $scope.removeFilter = function(filter)
    {
        //$rootScope.removeFromArray($scope.selectedReport.properties.filters, filter);
        queryModel.removeQueryItem(filter,'filter');
        reorderFilters();
    }

    $scope.removeOrder = function(order)
    {
        $rootScope.removeFromArray($scope.selectedReport.properties.order, order);
        queryModel.removeQueryItem(order,'order');
    }




    $scope.setHeight = function(element, height, correction) {
        var height = (height == 'full') ? $(document).height() : height;

        if (correction) height = height+correction;

        $('#'+element).css('height', height);
    };

    $scope.setFilterPrompt = function(filter)
    {
        $('#filterPromptsModal').modal('hide');
        if (filter.filterPrompt == true)
            {
            filter.filterPrompt = false;
                console.log('deactivated prompt',filter);
            }
        else
            filter.filterPrompt = true;


    }

    $scope.getButtonFilterPromptMessage = function(filter)
    {
        if (filter.filterPrompt == true)
            return 'Select to deactivate the runtime';
            else
            return 'Make this filter appear in the report interface.';
    }

    $scope.filterPromptsClick = function (filter) {
        $scope.selectedFilter = filter;
        if (!$scope.selectedFilter.promptTitle || $scope.selectedFilter.promptTitle == '')
            $scope.selectedFilter.promptTitle = $scope.selectedFilter.objectLabel;
        $('#filterPromptsModal').modal('show');
    };

    $scope.isfilterComplete = function(filter)
    {
        return queryModel.isfilterComplete(filter);
    }

    $scope.getDataForPreview  = function()
    {



        var query =  queryModel.generateQuery();  //queryModel.query();
        //TODO: clean data query
        $scope.selectedReport.query = query;

        if ($scope.selectedReport.query.columns.length > 0)
            {
                var el = document.getElementById('reportLayout');
                angular.element(el).empty();
                $scope.gettingData == true;
                $scope.showOverlay('OVERLAY_reportLayout');

                if ($scope.selectedReport.reportType == 'grid')
                    {

                        report_v2Model.getReport($scope.selectedReport,'reportLayout',$scope.mode, function(sql){


                            $scope.sql = sql;
                            $scope.hideOverlay('OVERLAY_reportLayout');
                            $scope.gettingData == false;
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
                                report_v2Model.getReport($scope.selectedReport,'reportLayout',$scope.mode, function(sql){

                                    $scope.sql = sql;
                                    $scope.hideOverlay('OVERLAY_reportLayout');
                                    $scope.gettingData == false;
                                });

                            }
                    }
        if ( $scope.selectedReport.reportType == 'gauge')
                    {

                        var theChartID = 'Chart'+uuid2.newguid();
                        $scope.selectedReport.properties.chart = {chartID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300,type:'bar',query:query,queryName:null};
                        $scope.selectedReport.properties.chart.dataColumns = $scope.selectedReport.properties.ykeys;
                        var customObjectData = $scope.selectedReport.properties.xkeys[0];
                        report_v2Model.getReport($scope.selectedReport,'reportLayout',$scope.mode, function(sql){

                            $scope.sql = sql;
                            $scope.hideOverlay('OVERLAY_reportLayout');
                            $scope.gettingData == false;
                        });
                    }

        if ( $scope.selectedReport.reportType == 'indicator')
                    {
                       report_v2Model.getReport($scope.selectedReport,'reportLayout',$scope.mode, function(sql){

                            $scope.sql = sql;
                            $scope.hideOverlay('OVERLAY_reportLayout');
                            $scope.gettingData == false;
                        });
                    }
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
        //$scope.columns = queryModel.columns();
        //$scope.order = queryModel.order();
        //$scope.filters = queryModel.filters();

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

    $scope.changeChartColumnType = function(column,type)
    {
        column.type = type;
        c3Charts.transformChartColumnType($scope.selectedReport.properties.chart,column);
    }

    $scope.changeChartSectorType = function(type)
    {
        if (type == 'pie')
            $scope.selectedReport.reportType = 'chart-pie';
        if (type == 'donut')
            $scope.selectedReport.reportType = 'chart-donut';
        /*
        if (!$scope.selectedReport.reportType == 'chart-donut')
            $scope.selectedReport.reportType = 'chart-donut';
        else
            $scope.selectedReport.reportType = 'chart-pie';
        */


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

        if ($scope.mode == 'add')
            {
               $('#theReportNameModal').modal('show');
            } else {
                $scope.reportNameSave();
            }
    };
    $scope.reportNameSave = function () {
        report_v2Model.saveAsReport($scope.selectedReport,$scope.mode,function(){
            $('#theReportNameModal').modal('hide');
            $('modal-backdrop').visible = false;
            $('modal-backdrop').remove();
            $scope.goBack();
        });



    };

    $scope.pushToDash = function()
    {
        var params = (params) ? params : {};

        connection.get('/api/dashboardsv2/find-all', params, function(data) {
            $scope.dashboards = data;
            $('#dashListModal').modal('show');
        });

    }

    $scope.reportPushed2Dash = function(dashboardID)
    {
        $('modal-backdrop').visible = false;
        $('modal-backdrop').remove();
        $('#dashListModal').modal('hide');
        $scope.saveReportStructure();

        $location.path( '/dashboardsv2/push/'+dashboardID );
    }

    $scope.aggregationChoosed = function(column,variable)
    {

        if (variable.value == 'original')
            {
              delete(column.aggregation);
            } else {
              column.aggregation = variable.value;
            }

        if (column.originalLabel == undefined)
            {
            column.originalLabel = column.elementLabel;
            }

        if (variable.value == 'original')
            {
                column.elementLabel = column.originalLabel;
                column.objectLabel = column.originalLabel;
            } else {
                column.elementLabel = column.originalLabel + ' ('+variable.name+')';
                column.objectLabel = column.originalLabel + ' ('+variable.name+')';
            }

        $scope.getDataForPreview();
    }

    $scope.hideColumn = function(column,hidden)
    {
        console.log('the column',column);
        column['hidden'] = hidden;
        queryModel.hideColumn(column.elementID,hidden);
        $scope.getDataForPreview();
        console.log('the column',column);
    }




    $scope.saveToExcel = function(reportHash)
    {
        report_v2Model.saveToExcel($scope,reportHash) ;
    }

    $scope.setDatePatternFilterType = function(filter,option)
    {
        queryModel.setDatePatternFilterType(filter,option);
        $scope.processStructure();
    }

    $scope.getElementProperties = function(element,elementID)
    {
        $scope.selectedElement = element;
        $scope.tabs.selected = 'settings';
    }

    $scope.onChangeElementProperties = function()
    {
        //console.log('properties changed',$scope.selectedReport);
    }

    $scope.gridGetMoreData = function(reportID)
    {
        $scope.page += 1;
        report_v2Model.getReportDataNextPage($scope.selectedReport,$scope.page);
    }


});
