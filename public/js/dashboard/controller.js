/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 09/01/15
 * Time: 13:05
 * To change this template use File | Settings | File Templates.
 */

'use strict';

app.controller('dashBoardCtrl', ['$scope', 'reportModel', '$timeout', '$routeParams' ,'connection', 'promptModel','dashboardModel', 'bsLoadingOverlayService', function ($scope, reportModel ,$timeout ,$routeParams, connection,promptModel,dashboardModel,bsLoadingOverlayService) {
    $scope.searchModal = 'partials/report/searchModal.html';
    $scope.promptsBlock = 'partials/report/promptsBlock.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.columnFormatModal = 'partials/report/columnFormatModal.html';
    $scope.columnSignalsModal = 'partials/report/columnSignalsModal.html';

    $scope.queryInterface = false;
    $scope.designMode = false;
    $scope.selectedElement != null;
    $scope.reportsModel = reportModel;
    $scope.rowPadding = "10px";
    $scope.orderNbr = 0;
    $scope.quote = "'";
    $scope.dashboardID = $routeParams.dashboardID;
    /*
    $scope.gridsterOpts = {
        columns: 6, // the width of the grid, in columns
        pushing: true, // whether to push other items out of the way on move or resize
        floating: true, // whether to automatically float items up so they stack (you can temporarily disable if you are adding unsorted items with ng-repeat)
        swapping: false, // whether or not to have items of the same size switch places instead of pushing down if they are the same size
        width: 'auto', // can be an integer or 'auto'. 'auto' scales gridster to be the full width of its containing element
        colWidth: 'auto', // can be an integer or 'auto'.  'auto' uses the pixel width of the element divided by 'columns'
        rowHeight: 'match', // can be an integer or 'match'.  Match uses the colWidth, giving you square widgets.
        margins: [10, 10], // the pixel distance between each widget
        outerMargin: true, // whether margins apply to outer edges of the grid
        isMobile: false, // stacks the grid items if true
        mobileBreakPoint: 600, // if the screen is not wider that this, remove the grid layout and stack the items
        mobileModeEnabled: true, // whether or not to toggle mobile mode when screen width is less than mobileBreakPoint
        minColumns: 1, // the minimum columns the grid must have
        minRows: 2, // the minimum height of the grid, in rows
        maxRows: 100,
        defaultSizeX: 2, // the default width of a gridster item, if not specifed
        defaultSizeY: 1, // the default height of a gridster item, if not specified
        minSizeX: 1, // minimum column width of an item
        maxSizeX: null, // maximum column width of an item
        minSizeY: 1, // minumum row height of an item
        maxSizeY: null, // maximum row height of an item
        resizable: {
            enabled: false,
            handles: ['n', 'e', 's', 'w', 'ne', 'se', 'sw', 'nw'],
            start: function(event, $element, widget) {}, // optional callback fired when resize is started,
            resize: function(event, $element, widget) {}, // optional callback fired when item is resized,
            stop: function(event, $element, widget) {} // optional callback fired when item is finished resizing
        },
        draggable: {
            enabled: false, // whether dragging items is supported
            handle: '.my-class', // optional selector for resize handle
            start: function(event, $element, widget) {}, // optional callback fired when drag is started,
            drag: function(event, $element, widget) {}, // optional callback fired when item is moved,
            stop: function(event, $element, widget) {} // optional callback fired when item is finished dragging
        }
    }; */

    if ($routeParams.extra == 'intro') {
            $timeout(function(){$scope.showIntro()}, 1000);
    }


    $scope.IntroOptions = {
            //IF width > 300 then you will face problems with mobile devices in responsive mode
                steps:[
                    {
                        element: '#parentIntro',
                        html: '<div><h3>Dashboards</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">In here you can create and execute dashboards using different single query reports together.</span><br/><br/><span>Just add the single query reports you want to use for your dashboard and resize and place them appropriately.</span><br/><br/><span></span><br/><br/><span></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "300px"
                    },
                    {
                        element: '#newDashboardBtn',
                        html: '<div><h3>New Dashboard</h3><span style="font-weight:bold;">Click here to create a new dashboard.</span><br/><span></span></div>',
                        width: "300px",
                        height: "150px",
                        areaColor: 'transparent',
                        horizontalAlign: "right",
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#dashboardList',
                        html: '<div><h3>Dashboards list</h3><span style="font-weight:bold;">Here all your dashboards are listed.</span><br/><span>Click over a dashboard\'s name to execute it.<br/><br/>You can also modify or drop the dashboard.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: "top",
                        height: "180px"

                    },
                    {
                        element: '#dashboardListItem',
                        html: '<div><h3>Dashboard</h3><span style="font-weight:bold;">This is one of your dashboards.</span><br/><span>On every line (dashboard) you can edit or drop it. If the dashboard is published a label with the word "published" will appear.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#72A230',
                        height: "180px"

                    },
                    {
                        element: '#dashboardListItemName',
                        html: '<div><h3>Dashboard name</h3><span style="font-weight:bold;">The name for the dashboard.</span><br/><br/><span>You can setup the name you want for your dashboard, but think about make it descriptive enought, and take care about not duplicating names across the company, specially if the dashboard is going to be published.</span><br/><br/><span>You can click here to execute the dashboard.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "250px"

                    },
                    {
                        element: '#dashboardListItemDetails',
                        html: '<div><h3>Dashboard description</h3><span style="font-weight:bold;">Use the description to give your users more information about the data or kind of data they will access using this dashboard.</span><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "180px"

                    },
                    {
                        element: '#dashboardListItemEditBtn',
                        html: '<div><h3>Dashboard edit</h3><span style="font-weight:bold;">Click here to modify the dashboard.</span><br/><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#dashboardListItemDeleteBtn',
                        html: '<div><h3>Dashboard delete</h3><span style="font-weight:bold;">Click here to delete the dashboard.</span><br/><br/><span>Once deleted, the dashboard will not be recoverable again.</span><br/><br/><span>Requires 2 step confirmation.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#dashboardListItemPublished',
                        html: '<div><h3>Dashboard published</h3><span style="font-weight:bold;">This label indicates that this dashboard is public.</span><br/><br/><span>If you drop or modify a published dashboard, it will have and impact on other users, think about it before making any updates on this dashboard.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#parentIntro',
                        html: '<div><h3>THE END</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Single query reports</span><br/><br/>Single query reports allows you to create a simple report based on just one single query.<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/public-space/intro">Go to single query reports and continue tour</a></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "250px"
                    }
                ]
            }

    $scope.gridsterOpts = {resizable:{enabled:false},draggable:{enabled:false}};

    $scope.getDashboards = function(params) {
        var params = (params) ? params : {};

        connection.get('/api/dashboards/find-all', params, function(data) {
            $scope.dashboards = data;
        });
    };



    $scope.initForm = function() {
        $scope.dataMode = 'preview';
        if ($routeParams.newDashboard == 'true') {
            $scope.dashBoardDefinitition = {dashboardName:"New Dashboard", backgroundColor:"#ccc" ,items:[]};
            $scope.mode = 'add';
        }
    };
    
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

    $scope.setDesignMode = function() {
        if ($scope.designMode)
        {
            $scope.designMode = false;
            $scope.rowPadding = "10px";
        }else {
            $scope.designMode = true;
            $scope.rowPadding = "10px";
        }
    }

    $scope.setColumnSignals = function()
    {
        reportModel.changeColumnSignals($scope,$scope.selectedColumnIndex ,$scope.selectedColumnHashedID);
    }

    $scope.changeColumnSignals = function(columnIndex ,hashedID)
    {
        //TODO: Error $scope.selectedReport = undefined
        $scope.selectedColumn = $scope.selectedReport.properties.columns[columnIndex];
        $scope.selectedColumnHashedID  = hashedID;
        $scope.selectedColumnIndex  = columnIndex;

        if (!$scope.selectedColumn.signals)
            $scope.selectedColumn.signals = [];
        $('#columnSignalsModal').modal('show');
    }

    $scope.selectReport = function()
    {
        if (!$scope.reports)
        {
            var params = (params) ? params : {};

            connection.get('/api/reports/find-all', params, function(data) {
                $scope.reports = data;
                $('#reportListModal').modal('show');
            });

        } else {
            $('#reportListModal').modal('show');
        }
    }

    $scope.reportSelected = function(reportID,report)
    {
        $('#reportListModal').modal('hide');

        var theItem = {};
        theItem.itemType = "reportBlock";
        theItem.size  = { x: 3, y: 1 };
        theItem.position = [0,0];
        theItem.title = 'titulo';
        theItem.reportID = reportID;
        theItem.overflowy = "hidden";
        theItem.overflowx = "hidden";



        $scope.dashBoardDefinitition.items.push(theItem);
        $scope.getReport(reportID);

        var index = $scope.reports.items.indexOf(report);
        $scope.reports.items.splice(index, 1);
    }

    $scope.cellClick = function(hashID,value)
    {

    }

    $scope.closePromptsBlock = function()
    {
        $scope.showPrompts = false;
    }

    $scope.openPromptsBlock = function()
    {

        $scope.showPrompts = true;
    }

    $scope.publishDashboard = function()
    {
        $scope.objectToPublish = $scope.dashBoardDefinitition;
        $('#publishModal').modal('show');
    }

    $scope.unPublish = function()
    {
        connection.post('/api/dashboards/unpublish', {_id:$scope.dashBoardDefinitition._id}, function(data) {
            $scope.dashBoardDefinitition.isPublic = false;
            $('#publishModal').modal('hide');
        });
    }

    $scope.selectThisFolder = function(folderID)
    {
        connection.post('/api/dashboards/publish-dashboard', {_id:$scope.dashBoardDefinitition._id,parentFolder:folderID}, function(data) {
            $scope.dashBoardDefinitition.parentFolder = folderID;
            $scope.dashBoardDefinitition.isPublic = true;
            $('#publishModal').modal('hide');
        });
    }

    $scope.generateDashBoard = function() {
        $scope.orderNbr = 0;
        var generatedHTML = '';

        if ($scope.dashboardID)
        {
            var isLinked = false;
            //is called by another report using a link
            if ($routeParams.elementID && $routeParams.elementValue)
                isLinked = true;

            dashboardModel.getDashBoard($scope.dashboardID, isLinked, function(dashboard){
                $scope.dashBoardDefinitition = dashboard;

                $scope.$apply;

                $scope.prompts = [];

                getPromptsForDashboard($scope.dashBoardDefinitition,0,function(){
                    if ($routeParams.elementID && $routeParams.elementValue)
                    {
                        for (var p in $scope.prompts)
                        {
                            if ($scope.prompts[p].elementID == $routeParams.elementID)
                            {
                                $scope.prompts[p].filterText1 = $routeParams.elementValue;
                            }
                        }
                        $scope.checkPrompts();
                    } else {

                        if ($scope.prompts.length > 0)
                        {
                            $scope.showPrompts = true;
                        } else {
                            paintReports($scope.dashBoardDefinitition);
                        }
                    }
                });

            });


        }

        $scope.$watch('dashBoardDefinitition.items', function(items){
            $(window).trigger('resize');
        }, true);


    }

    function paintReports(dashboard)
    {
        for (var r in dashboard.items) {
            if (dashboard.items[r].itemType == 'reportBlock')
            {
                $scope.getReport2(dashboard.items[r].reportDefinition);
            }
        }
    }


    function getPromptsForDashboard(dashboard,index, done)
    {
        if (!dashboard.items[index])
        {
            done();
            return;
        }

            if (dashboard.items[index].itemType == 'reportBlock')
            {
                promptModel.getPrompts($scope,dashboard.items[index].reportDefinition, function(){
                    getPromptsForDashboard(dashboard,index+1, done);
                });
            }  else {
                getPromptsForDashboard(dashboard,index+1, done);
            }

    }

    $scope.selectFilterArrayValue = function(type, filter)
    {
        reportModel.selectFilterArrayValue(type, filter);
    }


    $scope.reportClicked = function(reportID,parameters)
    {
        
    }



    $scope.getVerticalScroll = function(isVertical)
    {
        var vscroll = 'overflow-y: hidden;';
        if (isVertical == 'yes')
            vscroll = 'overflow-y: scroll;';

        return vscroll;
    }

    $scope.getHorizontalScroll = function(isHorizontal)
    {
        var hscroll = 'overflow-x: hidden;';
        if (isHorizontal == 'yes')
            hscroll = 'overflow-x: scroll;';

        return vscroll;
    }


    $scope.getReport2 = function(report)
    {
        $scope.showOverlay('OVERLAY_'+report._id);
            
        reportModel.executeReport($scope,report._id, report, function (errorCode){
         

            if (errorCode != 0)
            {
                var el = document.getElementById(reportID);

                var theHTML = '';
                if (errorCode == 1)
                    theHTML = '<div class="alert">Report not found!</div>';
                if (errorCode == 2)
                    theHTML = '<div class="alert">Chart type not found!</div>';
                if (errorCode == 3)
                    theHTML = '<div class="alert">No data Found!</div>';

                if (el)
                {
                    var $div = $(theHTML);
                    angular.element(el).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)(scope);
                    });
                }
            }
            
             $scope.hideOverlay('OVERLAY_'+report._id);
        });
    }


    $scope.getReport = function(reportID)
    {
        reportModel.getReportBlock($scope,reportID, function(errorCode) {

            if (errorCode != 0)
            {
             var el = document.getElementById(reportID);

             var theHTML = '';
             if (errorCode == 1)
                 theHTML = '<div class="alert">Report not found!</div>';
             if (errorCode == 2)
                 theHTML = '<div class="alert">Chart type not found!</div>';
             if (errorCode == 3)
                 theHTML = '<div class="alert">No data Found!</div>';

             if (el)
             {
                 var $div = $(theHTML);
                 angular.element(el).append($div);
                 angular.element(document).injector().invoke(function($compile) {
                     var scope = angular.element($div).scope();
                     $compile($div)(scope);
                 });
             }
            }
        });
    }


    $scope.saveDashboard = function()
    {
        if ($scope.mode == 'add') {
            connection.post('/api/dashboards/create', $scope.dashBoardDefinitition, function(data) {
                if (data.result == 1) {
                    $scope.goBack();
                }
            });
        } else {
            connection.post('/api/dashboards/update/'+$scope.dashBoardDefinitition._id, $scope.dashBoardDefinitition, function(result) {
                if (result.result == 1) {
                    $scope.goBack();
                }
            });
        }
    }

    $scope.getTabBlock = function(blockItem)
    {
        var theHTML = '<tabset>';

        for (var r in blockItem.items) {
                theHTML += '<tab heading="'+blockItem.items[r].title+'"><div id="'+blockItem.items[r].reportID+'"></div></tab>';
        }
        theHTML += '</tabset>';

        var el = document.getElementById(blockItem.reportID);

        var $div = $(theHTML);
        angular.element(el).append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });


        $timeout(function(){
            for (var r in blockItem.items) {
                    $scope.getReport(blockItem.items[r].reportID);
            }
        },1000);

    }


    $scope.selected = function(selectedEl) {

        return true;

    }

    $scope.onReportAction = function(actionType,targetID,targetFilters,sourceID)
    {
        if (actionType == 'goToDashBoard')
        {
            window.location.hash = '/dashboards/'+targetID;
        }

    }

    $scope.getDistinctValues = function(filter)
    {
        promptModel.getDistinctValues($scope, filter);
    }

    $scope.toggleSelection = function(value)
    {
        promptModel.toggleSelection($scope, value);
    }

    $scope.isValueSelected = function(value)
    {
        promptModel.isValueSelected($scope,value);
    }

    $scope.selectSearchValue = function(searchValue)
    {
        promptModel.selectSearchValue($scope);
    }

    $scope.setHeight = function(element, height, correction) {
        var height = (height == 'full') ? $(document).height() : height;

        if (correction) height = height+correction;

        $('#'+element).css('height', height);
    };

    $scope.checkPrompts = function()
    {
        promptModel.checkPrompts($scope, function (){
            paintReports($scope.dashBoardDefinitition);
        });
    }

    $scope.changeColumnFormat = function(columnIndex ,hashedID)
    {
        reportModel.changeColumnFormat($scope,columnIndex ,hashedID);
    }

    $scope.orderColumn = function(predicate,hashedID) {

        reportModel.orderColumn($scope, predicate,hashedID);

    };

    $scope.saveToExcel = function(reportHash)
    {
        reportModel.saveToExcel($scope,reportHash) ;
    }

    $scope.delete = function (dashboardID, dashboardName) {
        $scope.modalOptions = {};
        $scope.modalOptions.headerText = 'Confirm delete dashboard'
        $scope.modalOptions.bodyText = 'Are you sure you want to delete the dashboard:'+' '+dashboardName;
        $scope.modalOptions.ID = dashboardID;
        $('#deleteModal').modal('show');
    };

    $scope.deleteConfirmed = function (dashboardID) {
        connection.post('/api/dashboards/delete/'+dashboardID, {id:dashboardID}, function(result) {
            if (result.result == 1) {
                $('#deleteModal').modal('hide');
                var nbr = -1;
                for (var i in $scope.dashboards.items)
                {
                    if ($scope.dashboards.items[i]._id === dashboardID)
                        nbr = i;
                }
                if (nbr > -1)
                    $scope.dashboards.items.splice(nbr,1);
            }
        });
    };

}]);
