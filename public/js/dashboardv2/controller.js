app.controller('dashBoardv2Ctrl', function ($scope, reportService, connection, $routeParams,report_v2Model, queryModel,  c3Charts,uuid2, icons,colors,htmlWidgets,dashboardv2Model, grid,bsLoadingOverlayService,$timeout,$rootScope,PagerService ) {
    $scope.reportModal = 'partials/report_v2/edit.html';
    $scope.chartModal = 'partials/pages/chartModal.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.settingsHtml = 'partials/pages/settings.html';
    $scope.queriesHtml = 'partials/pages/queries.html';
    $scope.settingsTemplate = 'partials/widgets/inspector.html';
    $scope.filterWidget = 'partials/report_v2/filterWidget.html';
    $scope.promptModal = 'partials/widgets/promptModal.html';

    $scope.selectedDashboard = {reports:[],containers:[],prompts:[]};
    $scope.dashboardID = $routeParams.dashboardID;
    $scope.lastElementID = 0;
    $scope.dataPool = [];
    //$scope.faList = icons.faList;
    //$scope.colors = colors.colors;
    $scope.hiddenXS = false;
    $scope.hiddenSM = false;
    $scope.hiddenMD = false;
    $scope.hiddenLG = false;
    $scope.hiddenPrint = false;
    $scope.canMoveSelectedElement = false;
    //$scope.imageFilters = [];
    //$scope.imageFilters.opacity = 10;
    $scope.theData = [];
    $scope.mode = 'preview';
    $scope.pager = {};


    $scope.textAlign = [
        {name: 'left', value: 'left'},
        {name: 'right', value: 'right'},
        {name: 'center', value: 'center'}
    ];

    $scope.fontSizes = [
        {name: '8px', value: '8px'},
        {name: '9px', value: '9px'},
        {name: '10px', value: '10px'},
        {name: '11px', value: '11px'},
        {name: '12px', value: '12px'},
        {name: '13px', value: '13px'},
        {name: '14px', value: '14px'},
        {name: '15px', value: '15px'},
        {name: '16px', value: '16px'},
        {name: '17px', value: '17px'},
        {name: '18px', value: '18px'},
        {name: '19px', value: '19px'},
        {name: '20px', value: '20px'}
    ];

    $scope.fontWeights = [
        {name: 'normal', value: 'normal'},
        {name: 'bold', value: 'bold'},
        {name: 'bolder', value: 'bolder'},
        {name: 'lighter', value: 'lighter'}
    ];

    $scope.fontStyles = [
        {name: 'normal', value: 'normal'},
        {name: 'italic', value: 'italic'},
        {name: 'oblique', value: 'oblique'}
    ];

    $scope.newReport = function() {
        $scope.reportInterface = true;
        $scope.editingReport = null;
        $scope.$broadcast("newReportForDash",{});
    }


    $scope.$on("cancelReport", function (event, args) {

        $scope.reportInterface = false;
    });

    var hashCode = function(s) {
        return s.split("").reduce(function(a,b){a=((a<<5)-a)+b.charCodeAt(0);return a&a},0);
    };

    if ($routeParams.extra == 'intro') {
            $timeout(function(){$scope.showIntro()}, 1000);
    }


    $scope.IntroOptions = {
            //IF width > 300 then you will face problems with mobile devices in responsive mode
                steps:[
                    {
                        element: '#parentIntro',
                        html: '<div><h3>Dashboards</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">In here you can create and execute dashboards like web pages.</span><br/><br/><span>Define several reports using filters and dragging and dropping from different layers.</span><br/><br/><span>After you define the report/s to get and visualize your data, you can drag and drop different html layout elements, and put your report in, using different formats to show it.</span><br/><br/><span></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "300px"
                    },
                    {
                        element: '#newReportBtn',
                        html: '<div><h3>New Dashboard</h3><span style="font-weight:bold;">Click here to create a new dashboard.</span><br/><span></span></div>',
                        width: "300px",
                        height: "150px",
                        areaColor: 'transparent',
                        horizontalAlign: "right",
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#reportList',
                        html: '<div><h3>Dashboards list</h3><span style="font-weight:bold;">Here all your dashboards are listed.</span><br/><span>Click over a dashboard\'s name to execute it.<br/><br/>You can also modify or drop the dashboard, clicking into the modify or delete buttons.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: "top",
                        height: "180px"

                    },
                    {
                        element: '#reportListItem',
                        html: '<div><h3>Dashboard</h3><span style="font-weight:bold;">This is one of your dashboards.</span><br/><span>On every line (dashboard) you can edit or drop it. If the dashboard is published a green "published" label will be shown.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#72A230',
                        height: "180px"

                    },
                    {
                        element: '#reportListItemName',
                        html: '<div><h3>Dashboard name</h3><span style="font-weight:bold;">The name for the dashboard.</span><br/><br/><span>You can setup the name you want for your dashboard, but think about make it descriptive enought, and take care about not duplicating names across the company, specially if the dashboard is going to be published.</span><br/><br/><span>You can click here to execute the dashboard.</span></div>',
                        width: "400px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "250px"

                    },
                    {
                        element: '#reportListItemDetails',
                        html: '<div><h3>Dashboard description</h3><span style="font-weight:bold;">Use the description to give your users more information about the data or kind of data they will access using this dashboard.</span><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "180px"

                    },
                    {
                        element: '#reportListItemEditBtn',
                        html: '<div><h3>Dashboard edit</h3><span style="font-weight:bold;">Click here to modify the dashboard.</span><br/><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#reportListItemDeleteBtn',
                        html: '<div><h3>Dashboard delete</h3><span style="font-weight:bold;">Click here to delete the dashboard.</span><br/><br/><span>Once deleted the dashboard will not be recoverable again.</span><br/><br/><span>Requires 2 step confirmation.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#reportListItemPublished',
                        html: '<div><h3>Dashboard published</h3><span style="font-weight:bold;">This label indicates that this dashboard is public.</span><br/><br/><span>If you drop or modify a published dashboard, it will have and impact on other users, think about it before making any updates on the dashboard.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    }
                ]
            }


            if ($rootScope.user.reportsCreate || $rootScope.counts.reports > 0)
                {
                $scope.IntroOptions.steps.push({
                        element: '#parentIntroReports',
                        html: '<div><h3>Next Step</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">Reports </span><br/><br/>See how you can create reports that shows your data using charts and data grids<br/><br/><br/><span> <a class="btn btn-info pull-right" href="/#/report/intro">Go to report designer and continue tour</a></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "250px"
                    });
                }



    $scope.initForm = function() {
        $scope.mode = 'preview';

        if ($routeParams.newDashboard == 'true') {
            $scope.selectedDashboard = {dashboardName:"New Dashboard", backgroundColor:"#999999" ,reports:[],items:[],properties:{},dashboardType:'DEFAULT'};
            $scope.mode = 'add';

        };
        if ($routeParams.mode == 'edit')
        { //editing
            if ($scope.dashboardID)
            {
                $scope.mode = 'edit';

                connection.get('/api/dashboardsv2/get/'+$scope.dashboardID, {id: $scope.dashboardID}, function(data) {
                    $scope.selectedDashboard = data.item;

                    if ($scope.selectedDashboard.backgroundColor)
                        $('#designArea').css({ 'background-color': $scope.selectedDashboard.backgroundColor}) ;

                    if ($scope.selectedDashboard.backgroundImage  && $scope.selectedDashboard.backgroundImage != 'none')
                            {

                                $('#designArea').css({ 'background-image': "url('"+$scope.selectedDashboard.backgroundImage+"')" });
                                $('#designArea').css({ '-webkit-background-size': 'cover'});
                                $('#designArea').css({ '-moz-background-size': 'cover'});
                                $('#designArea').css({ '-o-background-size': 'cover'});
                                $('#designArea').css({ 'background-size': 'cover'});

                            }

                    getQueryData(0,function(){
                        rebuildCharts();
                        rebuildGrids();

                    });

                    //getAllPageColumns();


                    var $div = $($scope.selectedDashboard.properties.designerHTML);
                    var el = angular.element(document.getElementById('designArea'));
                    el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

                    cleanAllSelected();

                    $scope.getPrompts();
                });
            }
        }

        if ($routeParams.mode == 'push')
        { //editing
            if ($scope.dashboardID)
            {
                if ($scope.dashboardID == 'new')
                    {
                        $scope.selectedDashboard = {dashboardName:"New Dashboard", backgroundColor:"#999999" ,reports:[],items:[],properties:{},dashboardType:'DEFAULT'};
                        $scope.mode = 'add';

                        var qstructure = reportService.getReport();
                            qstructure.reportName = 'report_'+($scope.selectedDashboard.reports.length +1);
                            qstructure.id = uuid2.newguid();
                            $scope.selectedDashboard.reports.push(qstructure);
                            $('modal-backdrop').remove();
                    } else {
                        connection.get('/api/dashboardsv2/get/'+$scope.dashboardID, {id: $scope.dashboardID}, function(data) {
                            $scope.selectedDashboard = data.item;
                            var qstructure = reportService.getReport();
                            qstructure.reportName = 'report_'+($scope.selectedDashboard.reports.length +1);
                            qstructure.id = uuid2.newguid();
                            $scope.selectedDashboard.reports.push(qstructure);

                            if ($scope.selectedDashboard.backgroundColor)
                                $('#designArea').css({ 'background-color': $scope.selectedDashboard.backgroundColor}) ;

                            if ($scope.selectedDashboard.backgroundImage  && $scope.selectedDashboard.backgroundImage != 'none')
                            {

                                $('#designArea').css({ 'background-image': "url('"+$scope.selectedDashboard.backgroundImage+"')" });
                                $('#designArea').css({ '-webkit-background-size': 'cover'});
                                $('#designArea').css({ '-moz-background-size': 'cover'});
                                $('#designArea').css({ '-o-background-size': 'cover'});
                                $('#designArea').css({ 'background-size': 'cover'});

                            }

                            getQueryData(0,function(){
                                rebuildCharts();
                                rebuildGrids();

                            });

                            //getAllPageColumns();


                            var $div = $($scope.selectedDashboard.properties.designerHTML);
                            var el = angular.element(document.getElementById('designArea'));
                            el.append($div);
                            angular.element(document).injector().invoke(function($compile) {
                                var scope = angular.element($div).scope();
                                $compile($div)($scope);
                            });

                            cleanAllSelected();

                            $scope.getPrompts();
                        });
                    }
            }
        }

    };

    $scope.loadHTML = function() {
        $scope.mode = 'preview';

        connection.get('/api/dashboardsv2/get/'+$scope.dashboardID, {id: $scope.dashboardID}, function(data) {
                    $scope.selectedDashboard = data.item;
                    if (!$scope.selectedDashboard.containers)
                            $scope.selectedDashboard.containers = [];

                    getQueryData(0,function(){
                        rebuildCharts();
                        rebuildGrids();
                    });

                    if ($scope.selectedDashboard.backgroundColor)
                        $('#pageViewer').css({ 'background-color': $scope.selectedDashboard.backgroundColor}) ;

                    if ($scope.selectedDashboard.backgroundImage && $scope.selectedDashboard.backgroundImage != 'none')
                        {

                            $('#pageViewer').css({ 'background-image': "url('"+$scope.selectedDashboard.backgroundImage+"')" });
                            $('#pageViewer').css({ '-webkit-background-size': 'cover'});
                            $('#pageViewer').css({ '-moz-background-size': 'cover'});
                            $('#pageViewer').css({ '-o-background-size': 'cover'});
                            $('#pageViewer').css({ 'background-size': 'cover'});

                        }

                    //getAllPageColumns();

                    var theHTML = $scope.selectedDashboard.html;

                    //var theHTML = $scope.selectedDashboard.properties.designerHTML;

                    var $div = $(theHTML);
                    var el = angular.element(document.getElementById('pageViewer'));
                    el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });
                    $scope.getPrompts();
                    //cleanAll('pageViewer');


    });
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
  /*
    $scope.getDashboards = function(params) {

        dashboardv2Model.getDashboards(params, function(data){
            $scope.dashboards = data;
        })
    };

  */
    $scope.getDashboards = function(page, search, fields) {
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



        dashboardv2Model.getDashboards(params, function(data){
            $scope.dashboards = data;
            $scope.page = data.page;
            $scope.pages = data.pages;
            $scope.pager = PagerService.GetPager($scope.dashboards.items.length, data.page,10,data.pages);
        })
    };

    $scope.cancelReport = function(report) {
        $scope.reportInterface = false;
    }

    $scope.saveReport4Dashboard = function(isMode)
    {
        //first clean the results area for not to create a conflict with other elements with same ID
        var el = document.getElementById('reportLayout');
        angular.element(el).empty();

        var qstructure = reportService.getReport();

        if ($scope.editingReport == null)
        {

            qstructure.reportName = 'report_'+($scope.selectedDashboard.reports.length +1);
            qstructure.id = uuid2.newguid();
            $scope.selectedDashboard.reports.push(qstructure);
        } else {

            var updatedReport = angular.copy(qstructure);
            $scope.selectedDashboard.reports.splice($scope.editingReportIndex,1,updatedReport);
            report_v2Model.getReport(updatedReport,'REPORT_'+qstructure.id,$scope.mode, function(sql){});
        }
        $scope.reportInterface = false;
        //getAllPageColumns();
        $scope.getPrompts();
    }




    $scope.getQuery = function(queryID)
    {
        for (var r in $scope.selectedDashboard.reports)
        {
            if ($scope.selectedDashboard.reports[r].query.id == queryID)
                {
                return $scope.selectedDashboard.reports[r].query;
                }
        }
    }

    var reportBackup = undefined;
    $scope.loadReport = function(report)
    {
        $scope.reportInterface = true;
        $scope.editingReport = report.id;
        //reportBackup = clone(report);
        reportBackup = angular.copy(report);
        for (var i in $scope.selectedDashboard.reports)
            {
                if ($scope.selectedDashboard.reports[i].id == report.id)
                    {
                       // $scope.selectedDashboard.reports.splice(i,1);
                        $scope.editingReportIndex = i;
                    }
            }
        $scope.$broadcast("loadReportStrucutureForDash", {report: reportBackup});
    }

    $scope.onDrop = function (data, event, type, group) {
         //DROP OVER THE DASHBOARD PARENT DIV


        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        if (customObjectData.objectType == 'jumbotron') {
            var html = getJumbotronHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == '4colscta') {
            var html = get4colsctaHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == '3colscta') {
            var html = get3colsctaHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == '2colscta') {
            var html = get2colsctaHTML();
            createOnDesignArea(html,function(){});
        }


        if (customObjectData.objectType == 'divider') {
            var html = htmlWidgets.getDivider();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'imageTextLarge') {
            var html = getImageTextLargeHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'textImageLarge') {
            var html = getTextImageLargeHTML();
            createOnDesignArea(html,function(){});
        }


        if (customObjectData.objectType == 'report') {

            for (var i in $scope.selectedDashboard.reports)
                    {
                        if ($scope.selectedDashboard.reports[i].id == customObjectData.reportID)
                            {

                                if ( angular.element('#REPORT_'+$scope.selectedDashboard.reports[i].id).length ){
                                        noty({text: 'Sorry, that report is already on the dash',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = report_v2Model.getReportContainerHTML(customObjectData.reportID);
                                        createOnDesignArea(html,function(){});
                                    }
                            }
                    }

        }

        if (customObjectData.objectType == 'queryFilter') {

            for (var i in $scope.prompts)
                    {
                        if ($scope.prompts[i].elementID == customObjectData.promptID)
                            {
                                if ( angular.element('#PROMPT_'+$scope.prompts[i].elementID).length ){ // || angular.element('#CHART_'+$scope.selectedDashboard.reports[i].id).length ) {
                                    noty({text: 'Sorry, that filter is already on the dash',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = report_v2Model.getPromptHTML($scope.prompts[i])
                                        createOnDesignArea(html,function(){});
                                    }
                            }
                    }
        }

        if (customObjectData.objectType == 'tabs') {
            var theid = 'TABS_'+uuid2.newguid();
            var theTabs = [{label:'tab1',active:true,id:uuid2.newguid()},{label:'tab2',active:false,id:uuid2.newguid()},{label:'tab3',active:false,id:uuid2.newguid()},{label:'tab4',active:false,id:uuid2.newguid()}]
            var tabsElement = {id:theid,type:'tabs',properties:{tabs:theTabs}};
            if (!$scope.selectedDashboard.containers)
                $scope.selectedDashboard.containers = [];
            $scope.selectedDashboard.containers.push(tabsElement);

            var html = getTabsHTML(theid,theTabs);
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'image') {
            $rootScope.openGalleryModal(function(url) {
                var html = htmlWidgets.getImage(url);
                createOnDesignArea(html,function(){});
            });
        }

        if (customObjectData.objectType == 'video') {
            var html = htmlWidgets.getVideo();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'paragraph') {
            var html = htmlWidgets.getParagraph();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'heading') {
            var html = htmlWidgets.getHeading();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'pageHeader') {
            var html = htmlWidgets.getPageHeader();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'definitionList') {
            var html = htmlWidgets.getDefinitionList();
            createOnDesignArea(html,function(){});
        }


        /*
            if (customObjectData.objectType == 'image')
            {
               angular.element(event.target).css("background-image","url('"+ $(src).attr("data-id") +"')");
            }
        */

    };

    $scope.onDropObject = function (data, event, type, group) {
        //DROP OVER AN HTML CONTAINER

        event.stopPropagation();
        var customObjectData = data['json/custom-object'];


        if (customObjectData.objectType == 'queryFilter') {
            for (var i in $scope.prompts)
                    {
                        if ($scope.prompts[i].elementID == customObjectData.promptID)
                            {
                                if ( angular.element('#PROMPT_'+$scope.prompts[i].elementID).length ){
                                    noty({text: 'Sorry, that filter is already on the board',  timeout: 6000, type: 'error'});
                                    } else {

                                        var html = report_v2Model.getPromptHTML($scope.prompts[i])

                                    }
                            }
                    }
        }

        /*
        if (customObjectData.objectType == 'image') {

        }
        */



        if (customObjectData.objectType == 'report') {

            for (var i in $scope.selectedDashboard.reports)
                    {
                        if ($scope.selectedDashboard.reports[i].id == customObjectData.reportID)
                            {

                                if ( angular.element('#REPORT_'+$scope.selectedDashboard.reports[i].id).length ){
                                        noty({text: 'Sorry, that report is already on the board',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = report_v2Model.getReportContainerHTML(customObjectData.reportID);
                                        //createOnDesignArea(html,function(){});
                                    }
                            }
                    }

            }


        if (html)
        {
            var $div = $(html);
            var el = angular.element(event.target);
            el.append($div);
            angular.element(document).injector().invoke(function($compile) {
                var scope = angular.element($div).scope();
                $compile($div)(scope);
            });
        }
    };






    function defaultGridProperties()
    {
        return {
                rowHeight:20,
                cellBorderColor:'#000'
        };

    }

    $scope.getPromptAsArray = function(promptID)
    {
        for (var p in $scope.prompts)
            {
                if ($scope.prompts[p].elementID == promptID)
                    {
                        var theResult = [];
                        theResult.push($scope.prompts[p]);
                        return theResult;
                    }
            }
    }

    $scope.getFilter = function(elementID)
    {
        for (var p in $scope.prompts)
        {
            if ($scope.prompts[p].elementID == elementID)
                return $scope.prompts[p];
        }


    }



    $scope.getPrompt = function(elementID)
    {
    for (var p in $scope.prompts)
        {
        if ($scope.prompts[p].elementID == elementID)
            return $scope.prompts[p];
        }
    }

    $scope.afterPromptGetValues = function(filter,data)
    {
        $scope.selectedfilter = filter;
    }

    $scope.promptChanged = function(elementID,values)
    {
        for (var r in $scope.selectedDashboard.reports)
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

                                    getQueryData(r,function(){
                                        rebuildCharts();
                                        rebuildGrids();
                                        rebuildIndicators();

                                    });
                                }
                        }
                }


    }


    function createOnDesignArea(html, done)
    {
        var $div = $(html);
            $('#designArea').append($div);
            angular.element(document).injector().invoke(function($compile) {
                var scope = angular.element($div).scope();
                $compile($div)(scope);
            });
            done();
    }


 $scope.getElementProperties = function(element,elementID)
    {
     if (elementID)
         if (elementID.substr(0,7) == 'REPORT_')
             {

                 var reportID = elementID.substr(7,elementID.length);
                 for (var i in $scope.selectedDashboard.reports)
                     {
                         if ($scope.selectedDashboard.reports[i].id == reportID)
                             {

                                 $scope.selectedReport = $scope.selectedDashboard.reports[i];
                             }
                     }
             }

        $scope.selectedElement = element;
        $scope.tabs.selected = 'settings';

    }

    $scope.onChangeElementProperties = function()
    {

    }


    $scope.deleteChartColumn = function(chart,column)
    {
        c3Charts.deleteChartColumn(chart,column)
    }




    $scope.changeChartColumnType = function(chart,column)
    {
        c3Charts.changeChartColumnType(chart,column)
    }

    $scope.changeChartColumnColor = function(chart,column,color)
    {
        c3Charts.changeChartColumnColor(chart,column,hexToRgb(color));
    }

    $scope.overChartDragging = function ()
    {

    }

    $scope.savePage = function()
    {
        savePage();
    }

    function getJumbotronHTML()
    {
        return htmlWidgets.getJumbotronHTML();
    }

    function get4colsctaHTML()
    {
        return htmlWidgets.get4colsctaHTML();
    }

    function get3colsctaHTML()
    {
        return htmlWidgets.get3colsctaHTML();
    }

    function get2colsctaHTML()
    {
        return htmlWidgets.get2colsctaHTML();
    }

    function getImageTextLargeHTML()
    {
        return htmlWidgets.getImageTextLargeHTML();
    }

    function getTextImageLargeHTML()
    {
        return htmlWidgets.getTextImageLargeHTML();
    }

    function getTabsHTML(id,tabs)
    {
        return htmlWidgets.getTabsHTML(id,tabs);
    }

    $scope.getTabs = function(id)
    {
        for (var c in $scope.selectedDashboard.containers)
            {
            if ($scope.selectedDashboard.containers[c].id == id)
                {
                    return $scope.selectedDashboard.containers[c].properties.tabs;
                }
            }
    }
/* TABS Component
    $scope.selectThisTab = function(tabsID,id)
    {

      for (var t in $scope.selectedDashboard.containers)
      {
        if ($scope.selectedDashboard.containers[t].id == tabsID)
            {
            var actualSelectedTab = $scope.selectedDashboard.containers[t].actualSelectedTab;
            var actualHeaderID = '#'+actualSelectedTab+'_HEADER';
            var actualBodyID = '#'+actualSelectedTab+'_BODY';
            $(actualHeaderID).removeClass('active');
            $(actualBodyID).removeClass('active');

            $scope.selectedDashboard.containers[t].actualSelectedTab = id;

            setTimeout(function () {
                //jQuery(window).trigger('resize');
                $(actualBodyID).trigger('resize');
                }, 5);
            }
      }

      var headerID = '#'+id+'_HEADER';
      var bodyID = '#'+id+'_BODY';
        $(headerID).removeClass('disabled');
        $(headerID).addClass('active');

        $(bodyID).addClass('active');

    }

    $scope.deleteTab = function(id)
    {
        var headerID = '#'+id+'_HEADER';
        var bodyID = '#'+id+'_BODY';
        $(headerID).remove();
        $(bodyID).remove();
    }

    $scope.addNewTab = function()
    {
        var id = $scope.selectedTabContainer.id;
        var tabID = uuid2.newguid();
        $scope.selectedTabContainer.properties.tabs.push({label:'new tab',active:false,id:tabID})
        var headerID = '#'+id+'_HEADER';
        var bodyID = '#'+id+'_BODY';
                    var theHeaderHTML = '<li id="'+tabID+'_HEADER" heading="Home" class="ng-isolate-scope" >'+
                                        '<a id="'+tabID+'_LABEL" ng-click="selectThisTab(\''+id+'\',\''+tabID+'\')"  class="ng-binding">new tab</a>'+
                                    '</li>';

                    var theBodyHTML = '<div id="'+tabID+'_BODY" class="tab-pane Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="min-Height:150px;padding:5px;"></div>';

                    var $div = $(theHeaderHTML);
                    $(headerID).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

                    var $div = $(theBodyHTML);
                    $(bodyID).append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });


    }

    $scope.changeTabLabel = function(id,newLabel)
    {
        var labelID = '#'+id+'_LABEL';
        $(labelID).text(newLabel);
    }*/

    $scope.getRuntimeReport = function(reportID)
    {
        if ($scope.mode != 'preview')
            {
                for (var i in $scope.selectedDashboard.reports)
                    {
                        if ($scope.selectedDashboard.reports[i].id == reportID)
                            {
                                var theHTML = report_v2Model.getReport($scope.selectedDashboard.reports[i],'REPORT_CONTAINER_'+reportID, $scope.mode, function(sql){
                                });

                            }
                    }
            }
    }

/* CHART PROPERTIES
    $scope.isChartCompleted = function(chartID)
    {
        var found = false;
        for (var i in $scope.charts)
            {
                if ($scope.charts[i].chartID == chartID)
                    {
                        if ($scope.charts[i].dataAxis && $scope.charts[i].dataColumns)
                            if ($scope.charts[i].dataAxis && $scope.charts[i].dataColumns.length >0)
                                {
                                    found = true;
                                }
                    }
            }
        return found;
    }

    $scope.getChartDataAxis = function(chartID)
    {
        var result = false;

        for (var c in $scope.charts)
             {
                if ($scope.charts[c].chartID == chartID)
                    {
                    if ($scope.charts[c].dataAxix != undefined)
                        result = true;
                    }
             }
    return result;
    }

    $scope.getChartDataColumns = function(chartID)
    {
    var result = false;

        for (var c in $scope.charts)
             {
                if ($scope.charts[c].chartID == chartID)
                    {
                    if ($scope.charts[c].dataColumns != undefined && $scope.charts[c].dataColumns.length > 0)
                        result = true;

                    }

             }
    return result;

    }

    $scope.applyChartSettings = function()
    {
        c3Charts.applyChartSettings($scope);
    }

    $scope.onChartSelectedObjectChanged = function(datacolumn)
    {
         //dataColumn.object = $scope.selectedObject;
    }

    $scope.onChartPropertiesChanged = function(object)
    {
        c3Charts.onChartPropertiesChanged($scope,object);
    }

*/
    function getQueryFilterHTML()
    {


    }

    $scope.elementDblClick = function(theElement)
    {
        var elementType = theElement.attr('ndType');
    }

    /*

    $scope.changeBackgroundFilter = function() {

        var theElement = $scope.selectedElement;


        var styleValue = '';

        if ($scope.imageFilters.opacity != 0)
            styleValue = styleValue + " opacity("+$scope.imageFilters.opacity+"%) ";


        theElement.css("filter",styleValue);
        theElement.css("webkitFilter",styleValue);
        theElement.css("mozFilter",styleValue);
        theElement.css("oFilter",styleValue);
        theElement.css("msFilter",styleValue);

    }
*/


    $scope.dashboardName = function () {
        if ($scope.mode == 'add')
            {
              $('#dashboardNameModal').modal('show');
            } else {
              saveDashboard();
            }
    };

    $scope.dashboardNameSave = function () {

        $('#dashboardNameModal').modal('hide');
        $('.modal-backdrop').hide();
        saveDashboard();
        //$scope.mode = 'edit';
        $scope.goBack();

    };

    function cleanAll(theContainer) {

        var root = document.getElementById(theContainer);

        if (root != undefined)
        {
            cleanElement(root);

        }
    }

    function cleanElement(theElement) {

        for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
            $(theElement.childNodes[i]).removeAttr('page-block');
            $(theElement.childNodes[i]).removeAttr('contenteditable');
            $(theElement.childNodes[i]).removeAttr('drop');
            $(theElement.childNodes[i]).removeAttr('drop-effect');
            $(theElement.childNodes[i]).removeAttr('drop-accept');
            $(theElement.childNodes[i]).removeClass('editable');
            $(theElement.childNodes[i]).removeClass('selected');
            $(theElement.childNodes[i]).removeClass('Block500');
            $(theElement.childNodes[i]).removeAttr('vs-repeat');

            var elementType = $(theElement.childNodes[i]).attr('ndType');

            if (elementType == 'ndPrompt')
                {
                $(theElement.childNodes[i]).children().remove();
                }

            if (theElement.childNodes[i].hasChildNodes() == true)
                  cleanElement(theElement.childNodes[i]);
        }
    }

    function cleanAllSelected() {

        var root = document.getElementById('designArea');

        if (root != undefined)
        {
            cleanSelectedElement(root);
        }
    }

    function cleanSelectedElement(theElement) {

        for (var i = 0, len = theElement.childNodes.length; i < len; ++i) {
            $(theElement.childNodes[i]).removeClass('selected');
            if (theElement.childNodes[i].hasChildNodes() == true)
                  cleanSelectedElement(theElement.childNodes[i]);
        }
    }




    function saveDashboard()
    {
        //Put all reports in loading mode...


        cleanAllSelected();

        var dashboard = $scope.selectedDashboard;

        for (var i in $scope.selectedDashboard.reports)
        {
           if ($scope.selectedDashboard.reports[i].properties != undefined)
            {
                if ($scope.selectedDashboard.reports[i].properties.chart != undefined)
                {
                    var theChart = clone($scope.selectedDashboard.reports[i].properties.chart);
                    theChart.chartCanvas = undefined;
                    theChart.data = undefined;
                    theChart.query = undefined;

                    //var targetChart = document.getElementById(theChart.chartID);

                    //if (targetChart != undefined)
                        $scope.selectedDashboard.reports[i].properties.chart = theChart;
                }
            }
        }



        var container = $('#designArea');

        clearPrompts();

        var theHTML = container.html();

        theHTML = theHTML.replace('vs-repeat',' ');

        getPromptsWidget();

        $scope.selectedDashboard.properties.designerHTML = theHTML;

        var previewContainer = $('#previewContainer');

            $('#previewContainer').children().remove();

                    var $div = $(theHTML);
                    previewContainer.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

        cleanAll('previewContainer');

        $scope.selectedDashboard.html = previewContainer.html();


        if ($scope.mode == 'add') {
            connection.post('/api/dashboardsv2/create', dashboard, function(data) {
                if (data.result == 1) {

                }
            });

        } else {

            connection.post('/api/dashboardsv2/update/'+dashboard._id, dashboard, function(result) {
                if (result.result == 1) {

                }
            });
        }


    }

    function getQueryData(index,done)
    {
        if (!$scope.selectedDashboard.reports[index])
            {
            done();
            return;
            }


            $scope.selectedDashboard.reports[index].loadingData= true;
            $scope.showOverlay('OVERLAY_'+$scope.selectedDashboard.reports[index].id);

            queryModel.getQueryData($scope.selectedDashboard.reports[index].query, function(data)
            {
                $scope.selectedDashboard.reports[index].query.data = data;
                    $scope.selectedDashboard.reports[index].loadingData= false;
                $scope.hideOverlay('OVERLAY_'+$scope.selectedDashboard.reports[index].id);
                getQueryData(index+1,done);
            });
    }

    function rebuildCharts()
    {
        if ($scope.selectedDashboard)
            {
                for (var i in $scope.selectedDashboard.reports)
                {

                    if ($scope.selectedDashboard.reports[i].properties != undefined)
                        {
                             if ($scope.selectedDashboard.reports[i].properties.chart != undefined)
                               {
                                var theChart = $scope.selectedDashboard.reports[i].properties.chart;
                                $scope.showOverlay('OVERLAY_'+theChart.chartID);
                                c3Charts.rebuildChart($scope.selectedDashboard.reports[i]);
                                $scope.hideOverlay('OVERLAY_'+theChart.chartID);
                                }
                        }
                }
            }
    }

    function rebuildIndicators()
    {
        if ($scope.selectedDashboard)
            {
                for (var i in $scope.selectedDashboard.reports)
                {

                    if ($scope.selectedDashboard.reports[i].reportType == 'indicator')
                        {
                            report_v2Model.generateIndicator($scope.selectedDashboard.reports[i]);
                        }
                }
            }
    }

    function rebuildGrids()
    {

        if ($scope.selectedDashboard)
            {
                for (var i in $scope.selectedDashboard.reports)
                {

                    if ($scope.selectedDashboard.reports[i].reportType == 'grid')
                        {
                            report_v2Model.repaintReport($scope.selectedDashboard.reports[i],$scope.mode);
                        }
                }
            }



    }



    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }


//Function to convert hex format to a rgb color

    var hexDigits = new Array
        ("0","1","2","3","4","5","6","7","8","9","a","b","c","d","e","f");

    function rgb2hex(rgb) {
        if (rgb)
        {
            rgb = rgb.match(/^rgb\((\d+),\s*(\d+),\s*(\d+)\)$/);
            return "#" + hex(rgb[1]) + hex(rgb[2]) + hex(rgb[3]);
        }

    }

    function hex(x) {
        return isNaN(x) ? "00" : hexDigits[(x - x % 16) / 16] + hexDigits[x % 16];
    }

    $scope.publishDashboard = function()
    {
        $scope.objectToPublish = $scope.selectedDashboard;
        $('#publishModal').modal('show');
    }

    $scope.unPublish = function()
    {
        connection.post('/api/dashboardsv2/unpublish', {_id:$scope.selectedDashboard._id}, function(data) {
            $scope.selectedDashboard.isPublic = false;
            $('#publishModal').modal('hide');
        });
    }

    $scope.selectThisFolder = function(folderID)
    {
        connection.post('/api/dashboardsv2/publish-page', {_id:$scope.selectedDashboard._id,parentFolder:folderID}, function(data) {
            $scope.selectedDashboard.parentFolder = folderID;
            $scope.selectedDashboard.isPublic = true;
            $('#publishModal').modal('hide');
        });
    }

    $scope.delete = function (dashboardID, dashboardName) {
        $scope.modalOptions = {};
        $scope.modalOptions.headerText = 'Confirm delete dashboard'
        $scope.modalOptions.bodyText = 'Are you sure you want to delete the dashboard:'+' '+dashboardName;
        $scope.modalOptions.ID = dashboardID;
        $('#deleteModal').modal('show');
    };

    $scope.deleteReport = function (reportID,reportName)
    {
        for (var i in $scope.selectedDashboard.reports)
            {
                if ($scope.selectedDashboard.reports[i].id == reportID)
                    {
                        $scope.selectedDashboard.reports.splice(i,1);

                        $('#REPORT_'+reportID).remove();
                    }
            }
    }

    $scope.editReport = function (reportID,reportName)
    {

    }

    $scope.deleteConfirmed = function (dashboardID) {
        connection.post('/api/dashboardsv2/delete/'+dashboardID, {id:dashboardID}, function(result) {
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

    $scope.getPrompts = function()
    {


        $scope.prompts = [];

        for (var r in $scope.selectedDashboard.reports)
        {

            for (var f in $scope.selectedDashboard.reports[r].query.groupFilters)
                {
                    if ($scope.selectedDashboard.reports[r].query.groupFilters[f].filterPrompt == true)
                        {
                             $scope.prompts.push($scope.selectedDashboard.reports[r].query.groupFilters[f]);
                        }
                }
        }
        getPromptsWidget();
    }


    function clearPrompts()
    {

        for (var r in $scope.selectedDashboard.reports)
        {

            for (var f in $scope.selectedDashboard.reports[r].query.groupFilters)
                {
                    if ($scope.selectedDashboard.reports[r].query.groupFilters[f].filterPrompt == true)
                        {
                             var targetPrompt = document.getElementById('PROMPT_'+$scope.selectedDashboard.reports[r].query.groupFilters[f].elementID);

                            $(targetPrompt).children().remove();

                        }
                }
        }

    }





    function getPromptsWidget()
    {

        for (var p in $scope.prompts)
        {
            var thePrompt = $scope.prompts[p];

            var targetPrompt = document.getElementById('PROMPT_'+thePrompt.elementID);

            if (targetPrompt != undefined)
            {

                if (thePrompt.name == undefined)
                    thePrompt.name = thePrompt.collectionID.toLowerCase()+'_'+thePrompt.elementName

                $(targetPrompt).children().remove();
                var html = '<nd-prompt  filter="getFilter('+"'"+thePrompt.elementID+"'"+')"  element-id="'+thePrompt.elementID+'" label="'+thePrompt.objectLabel+'" description="'+thePrompt.promptInstructions+'" value-field="'+thePrompt.name+'" show-field="'+thePrompt.name+'" selected-value="'+thePrompt.filterText1+'" prompts="prompts" on-change="promptChanged" after-get-values="afterPromptGetValues" ng-model="lastPromptSelectedValue"></nd-prompt>';

                var $div = $(html);
                            $(targetPrompt).append($div);
                            angular.element(document).injector().invoke(function($compile) {
                                var scope = angular.element($div).scope();
                                $compile($div)(scope);
                            });


            } else {
                console.log('no target prompt found');
            }

        }

    }

    $scope.getReportColumnDefs = function(reportID)
    {
        for (var i in $scope.selectedDashboard.reports)
            {
                if ($scope.selectedDashboard.reports[i].id == reportID)
                    {
                        return $scope.selectedDashboard.reports[i].properties.columnDefs;
                    }
            }


    }

    $scope.gridGetMoreData = function(reportID)
    {
        for (var i in $scope.selectedDashboard.reports)
            {
                if ($scope.selectedDashboard.reports[i].id == reportID)
                    {
                        if (!$scope.selectedDashboard.reports[i].lastLoadedPage)
                            $scope.selectedDashboard.reports[i].lastLoadedPage = 2;
                            else
                            $scope.selectedDashboard.reports[i].lastLoadedPage += 1;

                        report_v2Model.getReportDataNextPage($scope.selectedDashboard.reports[i],$scope.selectedDashboard.reports[i].lastLoadedPage);
                    }
            }
    }

    $scope.$on('element.reselected', function(e, node) {
        $scope.tabs.selected = 'settings';
    });







});
