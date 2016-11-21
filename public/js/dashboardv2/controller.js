app.controller('dashBoardv2Ctrl', function ($scope, reportService, connection, $routeParams,report_v2Model, queryModel, grid, c3Charts,uuid2, icons,colors,htmlWidgets,dashboardv2Model, grid,bsLoadingOverlayService,$timeout,$rootScope ) {
    $scope.reportModal = 'partials/report_v2/edit.html';
    $scope.chartModal = 'partials/pages/chartModal.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.settingsHtml = 'partials/pages/settings.html';
    $scope.queriesHtml = 'partials/pages/queries.html';
    $scope.settingsTemplate = 'partials/widgets/common.html';
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
                        html: '<div><h3>Page reports</h3><span style="font-weight:bold;color:#8DC63F"></span> <span style="font-weight:bold;">In here you can create and execute reports like html web pages.</span><br/><br/><span>Define several queries using filters and dragging and dropping from different layers.</span><br/><br/><span>After you define the query/es to get the data, you can drag and drop different html elements, and put your data in, using different formats to show it.</span><br/><br/><span></span></div>',
                        width: "500px",
                        objectArea: false,
                        verticalAlign: "top",
                        height: "300px"
                    },
                    {
                        element: '#newReportBtn',
                        html: '<div><h3>New Page Report</h3><span style="font-weight:bold;">Click here to create a new page report.</span><br/><span></span></div>',
                        width: "300px",
                        height: "150px",
                        areaColor: 'transparent',
                        horizontalAlign: "right",
                        areaLineColor: '#fff'
                    },
                    {
                        element: '#reportList',
                        html: '<div><h3>Reports list</h3><span style="font-weight:bold;">Here all your reports are listed.</span><br/><span>Click over a report\'s name to execute it.<br/><br/>You can also modify or drop the report.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        verticalAlign: "top",
                        height: "180px"

                    },
                    {
                        element: '#reportListItem',
                        html: '<div><h3>Report</h3><span style="font-weight:bold;">This is one of your reports.</span><br/><span>On every line (report) you can edit or drop it. If the report is published a label with the word "published" will appear.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#72A230',
                        height: "180px"

                    },
                    {
                        element: '#reportListItemName',
                        html: '<div><h3>Report name</h3><span style="font-weight:bold;">The name for the report.</span><br/><br/><span>You can setup the name you want for your report, but think about make it descriptive enought, and take care about not duplicating names across the company, specially if the report is going to be published.</span><br/><br/><span>You can click here to execute the report.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "250px"

                    },
                    {
                        element: '#reportListItemDetails',
                        html: '<div><h3>Report description</h3><span style="font-weight:bold;">Use the description to give your users more information about the data or kind of data they will access using this report.</span><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        height: "180px"

                    },
                    {
                        element: '#reportListItemEditBtn',
                        html: '<div><h3>Report edit</h3><span style="font-weight:bold;">Click here to modify the report.</span><br/><br/><span></span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#reportListItemDeleteBtn',
                        html: '<div><h3>Report delete</h3><span style="font-weight:bold;">Click here to delete the report.</span><br/><br/><span>Once deleted the report will not be recoverable again.</span><br/><br/><span>Requires 2 step confirmation.</span></div>',
                        width: "300px",
                        areaColor: 'transparent',
                        areaLineColor: '#fff',
                        horizontalAlign: "right",
                        height: "200px"

                    },
                    {
                        element: '#reportListItemPublished',
                        html: '<div><h3>Report published</h3><span style="font-weight:bold;">This label indicates that this report is public.</span><br/><br/><span>If you drop or modify a published report, it will have and impact on other users, think about it before making any updates on the report.</span></div>',
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



    $scope.initForm = function() {
        $scope.dataMode = 'preview';
        if ($routeParams.newDashboard == 'true') {
            $scope.selectedDashboard = {dashboardName:"New Dashboard", backgroundColor:"#999999" ,reports:[],items:[],properties:{},dashboardType:'DEFAULT'};
            $scope.mode = 'add';
        };
        if ($routeParams.mode == 'edit')
        { //editing
            if ($scope.dashboardID)
            {
                connection.get('/api/dashboardsv2/get/'+$scope.dashboardID, {id: $scope.dashboardID}, function(data) {
                    $scope.selectedDashboard = data.item;

                    if ($scope.selectedDashboard.backgroundColor)
                        $('#designArea').css({ 'background-color': $scope.selectedDashboard.backgroundColor}) ;

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

                    //getAllPageColumns();

                    var $div = $($scope.selectedDashboard.html);
                    var el = angular.element(document.getElementById('pageViewer'));
                    el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });
                    $scope.getPrompts();

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

    $scope.getDashboards = function(params) {

        dashboardv2Model.getDashboards(params, function(data){
            $scope.dashboards = data;
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
            console.log('aving  report',$scope.editingReportIndex);
            $scope.selectedDashboard.reports.splice($scope.editingReportIndex,1,updatedReport);
            report_v2Model.getReport(updatedReport,'REPORT_'+qstructure.id, function(sql){});
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

        if (customObjectData.objectType == 'chart') {

            var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                            '<div page-block class="col-md-12 ndContainer" ndtype="column">'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" >'+getChartHTML("normal")+'</div>'
                            '</div>'+
                        '</div>';

            //var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+ getChartHTML("normal")

            //+'</div>';
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'pieChart') {

            var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                            '<div page-block class="col-md-12 ndContainer" ndtype="column">'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" >'+getChartHTML("pie")+'</div>'
                            '</div>'+
                        '</div>';

            //var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getChartHTML("pie")+'</div>';
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'donutChart') {
            var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                            '<div page-block class="col-md-12 ndContainer" ndtype="column">'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" >'+getChartHTML("donut")+'</div>'
                            '</div>'+
                        '</div>';

            //var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getChartHTML("donut")+'</div>';
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'report') {

            var containerID = 'REPORT_'+customObjectData.reportID; //uuid2.newguid();

            for (var i in $scope.selectedDashboard.reports)
                    {
                        if ($scope.selectedDashboard.reports[i].id == customObjectData.reportID)
                            {

                                if ( angular.element('#REPORT_'+$scope.selectedDashboard.reports[i].id).length ){ // || angular.element('#CHART_'+$scope.selectedDashboard.reports[i].id).length ) {
                                    noty({text: 'Sorry, that report is already on the board',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                                                        '<div page-block class="col-md-12 ndContainer" ndtype="column">'+
                                                           // '<div page-block class="Block500" ndType="reportBlock" id="'+containerID+'">'+getReportHTML($scope.selectedDashboard.reports[i],containerID)+'</div>'
                                                              '<div page-block class="container-fluid" ndType="ndReportContainer" id="'+containerID+'" ng-init="getRuntimeReport('+"'"+$scope.selectedDashboard.reports[i].id+"'"+')" bs-loading-overlay bs-loading-overlay-reference-id="REPORT_'+$scope.selectedDashboard.reports[i].id+'"></div>';

                                                        '</div>'+
                                                    '</div>';


                                        //var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getChartHTML("donut")+'</div>';
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
                                    noty({text: 'Sorry, that filter is already on the board',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = '<div id="PROMPT_'+$scope.prompts[i].elementID+'" page-block class="container-fluid ndContainer" ndType="ndPrompt" ng-init="getDistinctValues('+$scope.prompts[i].elementID+')"><nd-prompt element-id="'+$scope.prompts[i].elementID+'" label="'+$scope.prompts[i].objectLabel+'" value-field="'+$scope.prompts[i].name+'" show-field="'+$scope.prompts[i].name+'" prompts="prompts" after-get-values="afterPromptGetValues" on-change="promptChanged" ng-model="lastPromptSelectedValue"></nd-prompt></div>';
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

        if (customObjectData.objectType == 'image')
        {
           angular.element(event.target).css("background-image","url('"+ $(src).attr("data-id") +"')");
        }

        if (customObjectData.objectType == 'queryColumn') {
            $scope.lastElementID = $scope.lastElementID + 1;

            var repeater = {id:'repeater'+$scope.lastElementID,dataColumns:[],query:undefined,properties:defaultGridProperties()};

            var gridProperties =

            $scope.repeaters.push(repeater);

            var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getRepeaterHTML(repeater.id)+'</div>'
            createOnDesignArea(html,function(){
            $scope.onDropOnRepeater(data, event, repeater.id);
            });

        }

        if (customObjectData.objectType == 'repeaterGrid') {
            $scope.lastElementID = $scope.lastElementID + 1;
            var repeater = {id:'repeater'+$scope.lastElementID,dataColumns:[],query:undefined,properties:defaultGridProperties()}
            $scope.repeaters.push(repeater);

            var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                            '<div page-block class="col-md-12 ndContainer" ndtype="column">'+
                                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" >'+getRepeaterHTML(repeater.id)+'</div>'
                            '</div>'+
                        '</div>';

            //var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getRepeaterHTML(repeater.id)+'</div>';
            createOnDesignArea(html,function(){});
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

    $scope.getDistinctValues = function(elementID)
    {
        /*for (var p in $scope.prompts)
        {
        if ($scope.prompts[p].elementID == elementID)
            queryModel.getDistinct($scope,$scope.prompts[p]);
        }*/
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

                                    console.log('the prompt has changed 2...');
                                    getQueryData(r,function(){
                                        rebuildCharts();
                                        rebuildGrids();
                                        rebuildIndicators();

                                    });
                                }
                        }
                }


    }

    $scope.onDropOverContainer = function()
    {
            if (customObjectData.objectType == 'image')
                {
                    var dropID = $(src).attr("data-id");
                    var destType = $(dest).attr("ndType");

                    if (destType == 'ndContainer')
                    {
                        var destiny =  $(dest)[0];
                        var theElement = $($(dest).children()[0]);
                        theElement.css("background-image","url('"+ $(src).attr("data-id") +"')");

                    } else {
                        if (destType == 'homeFull')
                        {
                            dest.style.backgroundImage = "url('"+ $(src).attr("data-id") +"')";

                        } else {
                            if (destType == 'image')
                            {
                                theTemplate = $compile($(dest).attr("src", $(src).attr("data-id")))(scope);

                            } else {
                                if (destType == 'carousell')
                                {

                                } else
                                theTemplate = $compile('<div class="container-fluid image ndContainer" x-lvl-draggable="false" x-lvl-drop-target="true" ndType="container" x-on-select="selected(selectedEl)" > <div class="embed-responsive embed-responsive-16by9 ndContainer" ndType="none" ><img  x-lvl-draggable="false" x-lvl-drop-target="true" ndType="image" x-on-select="selected(selectedEl)" src="'+dropID+'"  allowfullscreen></img></div></div>')(scope);
                            }
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

    $scope.onDropObject = function (data, event, type, group) {


        event.stopPropagation();
        var customObjectData = data['json/custom-object'];
        if (customObjectData.objectType == 'chart') {
            var html = getChartHTML("chart");
        }

        if (customObjectData.objectType == 'pieChart') {
            var html = getChartHTML("pie");
        }

        if (customObjectData.objectType == 'donutChart') {
            var html = getChartHTML("donut");
        }

        if (customObjectData.objectType == 'repeaterGrid') {
            $scope.lastElementID = $scope.lastElementID + 1;
            var repeater = {id:'repeater'+$scope.lastElementID,dataColumns:[],query:undefined,properties:defaultGridProperties()}
            $scope.repeaters.push(repeater);

            var html = getRepeaterHTML(repeater.id);
        }

        if (customObjectData.objectType == 'queryFilter') {
            for (var i in $scope.prompts)
                    {
                        if ($scope.prompts[i].elementID == customObjectData.promptID)
                            {
                                if ( angular.element('#PROMPT_'+$scope.prompts[i].elementID).length ){ // || angular.element('#CHART_'+$scope.selectedDashboard.reports[i].id).length ) {
                                    noty({text: 'Sorry, that filter is already on the board',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = '<div id="PROMPT_'+$scope.prompts[i].elementID+'" page-block class="container-fluid ndContainer" ndType="ndPrompt" ng-init="getDistinctValues('+$scope.prompts[i].elementID+')"><nd-prompt element-id="'+$scope.prompts[i].elementID+'" label="'+$scope.prompts[i].objectLabel+'" value-field="'+$scope.prompts[i].name+'" show-field="'+$scope.prompts[i].name+'" prompts="prompts" after-get-values="afterPromptGetValues" on-change="promptChanged" ng-model="lastPromptSelectedValue"></nd-prompt></div>';
                                    }
                            }
                    }
        }

        if (customObjectData.objectType == 'image') {

        }

        if (customObjectData.objectType == 'report') {
           /* var containerID = 'REPORT_'+customObjectData.reportID; // uuid2.newguid();
            for (var i in $scope.selectedDashboard.reports)
                    {
                        if ($scope.selectedDashboard.reports[i].id == customObjectData.reportID)
                            {

                                if ( angular.element('#REPORT_'+$scope.selectedDashboard.reports[i].id).length ){//||  angular.element('#CHART_'+$scope.selectedDashboard.reports[i].id).length ) {
                                    noty({text: 'Sorry, that report is already on the board',  timeout: 6000, type: 'error'});
                                    } else {
                                    var html = '<div page-block class="container-fluid" ndType="ndReportContainer" id="'+containerID+'" ng-init="getRuntimeReport('+"'"+$scope.selectedDashboard.reports[i].id+"'"+')" bs-loading-overlay bs-loading-overlay-reference-id="REPORT_'+$scope.selectedDashboard.reports[i].id+'"></div>';

                                    }
                            }
                    }*/
            var containerID = 'REPORT_'+customObjectData.reportID; //uuid2.newguid();

            for (var i in $scope.selectedDashboard.reports)
                    {
                        if ($scope.selectedDashboard.reports[i].id == customObjectData.reportID)
                            {

                                if ( angular.element('#REPORT_'+$scope.selectedDashboard.reports[i].id).length ){ // || angular.element('#CHART_'+$scope.selectedDashboard.reports[i].id).length ) {
                                    noty({text: 'Sorry, that report is already on the board',  timeout: 6000, type: 'error'});
                                    } else {
                                        var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                                                        '<div page-block class="col-md-12 ndContainer" ndtype="column">'+
                                                           // '<div page-block class="Block500" ndType="reportBlock" id="'+containerID+'">'+getReportHTML($scope.selectedDashboard.reports[i],containerID)+'</div>'
                                                              '<div page-block class="container-fluid" ndType="ndReportContainer" id="'+containerID+'" ng-init="getRuntimeReport('+"'"+$scope.selectedDashboard.reports[i].id+"'"+')" bs-loading-overlay bs-loading-overlay-reference-id="REPORT_'+$scope.selectedDashboard.reports[i].id+'"></div>';

                                                        '</div>'+
                                                    '</div>';

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

    function setBackgroundImage()
    {

    }

    $scope.onDropQueryElement = function (data, event, chartCode) {
        event.stopPropagation();
        var customObjectData = data['json/custom-object'];


        if (customObjectData.objectType == 'queryColumn') {
                for (var i in $scope.charts)
                {
                    if ($scope.charts[i] != undefined)
                      if ($scope.charts[i].chartID == chartCode)
                        {
                        if ((!$scope.charts[i].dataColumns || $scope.charts[i].dataColumns.length == 0))
                            {
                                $scope.charts[i].dataColumns = [];

                                for (var q in $scope.queries)
                                    {
                                    var theQuery = $scope.queries[q];
                                    if (theQuery.name == customObjectData.queryName)
                                        {
                                        $scope.charts[i].query = theQuery;
                                        $scope.charts[i].queryName = customObjectData.queryName;
                                        }
                                    }
                            }

                            if ($scope.charts[i].queryName == customObjectData.queryName)
                            {
                                    if (customObjectData.elementType == 'number')
                                        $scope.charts[i].dataColumns.push({elementName:customObjectData.elementName,
                                                                        queryName:customObjectData.queryName,
                                                                        elementLabel:customObjectData.objectLabel,
                                                                        id:customObjectData.name,
                                                                        type:'line',
                                                                        color:'#000000'});
                                    if (customObjectData.elementType == 'string')
                                        $scope.charts[i].dataAxis = {elementName:customObjectData.elementName,
                                                                        queryName:customObjectData.queryName,
                                                                        elementLabel:customObjectData.objectLabel,
                                                                        id:customObjectData.name,
                                                                        type:'line',
                                                                        color:'#000000'}
                                    c3Charts.rebuildChart($scope.charts[i]);
                            } else {
                                var errorMsg = 'This element is not allowed here...is not in the same query, please select an element that belongs to the same query or reinit the chart prior to assign this element.';
                                noty({text: errorMsg,  timeout: 6000, type: 'error'});

                            }
                        }
                }
        }
    };
/*
    $scope.onDropOnRepeater = function (data, event, repeaterCode) {
        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        if (customObjectData.objectType == 'queryColumn') {

                for (var i in $scope.repeaters)
                {
                    if ($scope.repeaters[i].id == repeaterCode)
                        {

                        if ($scope.repeaters[i].query == undefined)
                            $scope.repeaters[i].query = customObjectData.queryName;

                            for (var q in $scope.queries)
                            {
                                if ($scope.queries[q].name == customObjectData.queryName)
                                    //var queryScopeReference = 'queries['+q+'].data';
                                    {
                                    var queryScopeReference = $scope.queries[q];
                                    $scope.repeaters[i].queryReference = $scope.queries[q];
                                    }
                            }

                                if ($scope.repeaters[i].query == customObjectData.queryName)
                                {

                                        $scope.repeaters[i].dataColumns.push({elementName:customObjectData.elementName,
                                                            queryName:customObjectData.queryName,
                                                            elementLabel:customObjectData.objectLabel,
                                                            id:customObjectData.name,
                                                            type:'line',
                                                            color:'#000000'});


                                        grid.simpleGrid($scope.repeaters[i].dataColumns,repeaterCode,queryScopeReference,true,$scope.repeaters[i].properties,function(){


                                        });

                                }
                        }
                }

        }

    }
*/
/*
    $scope.changeHeight = function(newHeight)
    {
        if ($scope.selectedElementType  == 'c3Chart')
           {
            if ($scope.selectedChart)
            {
            $scope.selectedChart.chartCanvas.resize({height:newHeight});
            $scope.selectedChart.height = newHeight;
            }
            } else {
                    if (newHeight == '')
                        $scope.selectedElement.css("height","");
                        else
                        $scope.selectedElement.css("height",newHeight);

            }
    }

    $scope.changePadding = function(newPadding)
    {
            if (newPadding == '')
                        $scope.selectedElement.css("padding","");
                        else
                        $scope.selectedElement.css("padding",newPadding);
    }

    $scope.changeMargin = function(newMargin)
    {
            if (newMargin == '')
                        $scope.selectedElement.css("margin","");
                        else
                        $scope.selectedElement.css("margin",newMargin);
    }

    $scope.changeCSS = function(cssProperty,value)
    {
                if (cssProperty == '')
                        $scope.selectedElement.css(cssProperty,"");
                        else
                        $scope.selectedElement.css(cssProperty,value);
    }


    $scope.getElementProperties = function(theElement)
    {
        $scope.tabs.selected = 'settings';
        $scope.selectedElementType = '';

        $scope.selectedElement = theElement;

        if ($scope.selectedElement)
            {
                if ($scope.selectedElement.css('background-color') != 'rgba(0, 0, 0, 0)') {
                        $scope.BackgroundColor = rgb2hex($scope.selectedElement.css('background-color'));
                    } else {
                        $scope.BackgroundColor = 'Transparent';
                    }

                if ($scope.selectedElement.css('color') != 'rgba(0, 0, 0, 0)') {
                        $scope.FontColor = rgb2hex($scope.selectedElement.css('color'));
                    } else {
                        $scope.FontColor = 'Transparent';
                    }


                $scope.objectHeight = parseInt($scope.selectedElement.css('height'));

                $scope.objectMargin = parseInt($scope.selectedElement.css('margin'));
                $scope.objectMarginLeft = parseInt($scope.selectedElement.css('margin-left'));
                $scope.objectMarginRight= parseInt($scope.selectedElement.css('margin-right'));
                $scope.objectMarginTop = parseInt($scope.selectedElement.css('margin-top'));
                $scope.objectMarginBottom = parseInt($scope.selectedElement.css('margin-bottom'));

                $scope.objectPadding = parseInt($scope.selectedElement.css('padding'));
                $scope.objectPaddingLeft = parseInt($scope.selectedElement.css('padding-left'));
                $scope.objectPaddingRight= parseInt($scope.selectedElement.css('padding-right'));
                $scope.objectPaddingTop = parseInt($scope.selectedElement.css('padding-top'));
                $scope.objectPaddingBottom = parseInt($scope.selectedElement.css('padding-bottom'));




                var elementType = theElement.attr('ndType');

                $scope.selectedElementType = elementType;

                //visibility Properties
                    if ($scope.selectedElement.hasClass('hidden-lg') == true )
                    {
                        $scope.hiddenLG = true;
                    } else {
                        $scope.hiddenLG = false;
                    }
                    if ($scope.selectedElement.hasClass('hidden-md') == true )
                    {
                        $scope.hiddenMD = true;
                    } else {
                        $scope.hiddenMD = false;
                    }
                    if ($scope.selectedElement.hasClass('hidden-sm') == true )
                    {
                        $scope.hiddenSM = true;
                    } else {
                        $scope.hiddenSM = false;
                    }
                    if ($scope.selectedElement.hasClass('hidden-xs') == true )
                    {
                        $scope.hiddenXS = true;
                    } else {
                        $scope.hiddenXS = false;
                    }
                    if ($scope.selectedElement.hasClass('hidden-print') == true )
                    {
                        $scope.hiddenPrint = true;
                    } else {
                        $scope.hiddenPrint = false;
                    }

                if (elementType == 'ndContainer' || elementType == 'ndPrompt' || elementType == 'tabsContainer' || elementType == 'container' || elementType == 'jumbotron')
                {
                    $scope.canMoveSelectedElement = true;
                } else
                    $scope.canMoveSelectedElement = false;

                if (elementType === 'page')
                {


                }

                if (elementType === 'c3Chart')
                {

                    var chartID = theElement.attr('bindto-id');
                    for (var i in $scope.charts)
                    {
                        if ($scope.charts[i] != undefined)
                            if ($scope.charts[i].chartID == chartID)
                                {
                                    $scope.selectedChart = $scope.charts[i];
                                    $scope.objectHeight = $scope.selectedChart.height;
                                }
                    }
                }

                if (elementType === 'tabsContainer')
                {

                    var tabsContainerID = theElement.attr('id');

                    for (var i in $scope.selectedDashboard.containers)
                    {
                        if ($scope.selectedDashboard.containers[i].id == tabsContainerID)
                            {
                                $scope.selectedTabContainer = $scope.selectedDashboard.containers[i];
                                $scope.objectHeight = $scope.selectedTabContainer.height;

                            }
                    }
                }

                if (elementType == 'repeaterGrid')
                {
                    var gridID = theElement.attr('id');




                }

                $scope.$apply();
            }
    }*/

    $scope.deleteChartColumn = function(chart,column)
    {
        c3Charts.deleteChartColumn(chart,column)
    }
/*
    $scope.changeBackgroundColor = function(color)
    {
        var elementID = $scope.selectedElement.attr('id');

        var alpha = $scope.imageFilters.opacity /10;
        var hex = hexToRgb(color);
        if (hex)
        {
            var r = hex.r;
            var g = hex.g;
            var b = hex.b;
            $scope.selectedElement.css({'background-color': 'rgba('+r+','+g+','+b+',' + alpha + ')'});
        }
        $scope.BackgroundColor = color;

        if ($scope.selectedElementType == 'page')
            $scope.selectedDashboard.backgroundColor = color;

        if ($scope.selectedElementType == 'gridHeaderColumn')
            grid.savePropertyForGridColumn($scope.repeaters,'backgroundColor',elementID,'rgba('+r+','+g+','+b+',' + alpha + ')');

    } */

/*

    $scope.changeOpacity = function()
    {
        var alpha = $scope.imageFilters.opacity /10;
        var hex = hexToRgb($scope.BackgroundColor);
        var r = hex.r;
        var g = hex.g;
        var b = hex.b;
        $scope.selectedElement.css({'background-color': 'rgba('+r+','+g+','+b+',' + alpha + ')'});
    }

    function hexToRgb(hex) {
        var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;

        //alert( hexToRgb("#0033ff").g );
    }

    $scope.changeFontColor = function(color)
    {
        $scope.selectedElement.css({ 'color': color }) ;
        $scope.FontColor = color;
    }

    */

    $scope.changeChartColumnType = function(chart,column)
    {
        c3Charts.changeChartColumnType(chart,column)
    }

    $scope.changeChartColumnColor = function(chart,column,color)
    {
        c3Charts.changeChartColumnColor(chart,column,hexToRgb(color));
    }
/*
    $scope.deleteSelected = function()
    {
        var elementID = $scope.selectedElement.attr('id');

        if ($scope.selectedElementType == 'container' || $scope.selectedElementType == 'tabsContainer')
            {
            var containerNbr = -1;

            for (var c in $scope.selectedDashboard.containers)
                if ($scope.selectedDashboard.containers[c].id == elementID)
                    containerNbr = c;

            if (containerNbr > -1)
               $scope.selectedDashboard.containers.splice(containerNbr,1);

            }

        $scope.selectedElement.remove();

        $scope.tabs.selected = 'data';
    }
*/
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
       // $(headerID).append(theHeaderHTML);
                    var theBodyHTML = '<div id="'+tabID+'_BODY" class="tab-pane Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="min-Height:150px;padding:5px;"></div>';

       // $(bodyID).append(theBodyHTML);


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
    }
/*
    function getRepeaterHTML(theRepeaterID)
    {
        return  '<div page-block ndType="repeaterGrid" id="'+theRepeaterID+'" drop="onDropOnRepeater($data, $event, \''+theRepeaterID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="height:500px;overflow:hidden;padding:2px;">'+
        '<div style="position: relative; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.7);" class="ng-scope" >'+
        '<h1 class="absolute-center" style=" height: 100%;text-align: center;font-weight: bold;color: gainsboro;">DROP HERE THE DATA COLUMNS</h1>'
        '</div>'
        '</div>';
    }

    function getChartHTML(chartType)
    {
        var theChartID = 'Chart'+uuid2.newguid();
        $scope.charts.push({chartID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300,type:chartType,query:null,queryName:null});
        var htmlCode = '<div ng-if="!isChartCompleted(\''+theChartID+'\')" style="position: absolute; width: 100%; height: 100%; top: 0; left: 0; background-color: rgba(255,255,255,0.9);z-index: 400;border: 5px dotted #000;" class="ng-scope" drop="onDropQueryElement($data, $event, \''+theChartID+'\')">'+
        '<h1 class="absolute-center" style=" height: 100%;text-align: center;font-weight: bold;color: gainsboro;">DROP HERE THE DATA CATEGORIES TO BE COMPARED</h1>'+
        '</div>';
        return htmlCode + c3Charts.getChartHTML(theChartID);
    }

    function getReportHTML(report,containerID)
    {

         report_v2Model.getReport(report,containerID, function(sql){});

    }
*/
    $scope.getRuntimeReport = function(reportID)
    {
        for (var i in $scope.selectedDashboard.reports)
            {
                if ($scope.selectedDashboard.reports[i].id == reportID)
                    {

                        var theHTML = report_v2Model.getReport($scope.selectedDashboard.reports[i],'REPORT_'+reportID, function(sql){

                            //var grid = document.getElementById('REPORT_'+reportID);
                            //cleanElement(grid)



                        });

                    }
            }
    }


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

    function getQueryFilterHTML()
    {


    }

    $scope.elementDblClick = function(theElement)
    {
        var elementType = theElement.attr('ndType');
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
/*
    $scope.getCatalogImages = function()
    {
        $scope.catalogImages = [];
        for (var i = 1; i <= 100; ++i) {
            var image = {};
            var imgnbr = '';
            if (i < 10)
                imgnbr = '0'+i;
            else
                imgnbr = i;

            image.url = '/resources/images/tumbnails100/JPEG/photo-'+imgnbr+'_1.jpg';
            image.source1400 = '/resources/images/width1400/JPEG/photo-'+imgnbr+'_1.jpg';
            image.source700 = '/resources/images/width700/JPEG/photo-'+imgnbr+'_1.jpg';
            $scope.catalogImages.push(image);
        }
    }

    $scope.changeBackgroundImage = function(backgroundImage)
    {
            var theElement = $scope.selectedElement;
            theElement.css({ 'background-image': "url('"+backgroundImage.source1400+"')" });
            theElement.css({ '-webkit-background-size': 'cover'});
            theElement.css({ '-moz-background-size': 'cover'});
            theElement.css({ '-o-background-size': 'cover'});
            theElement.css({ 'background-size': 'cover'});


        if ($scope.selectedElementType == 'page')
            $scope.selectedDashboard.backgroundImage = backgroundImage.source1400;



    }
*/
    $scope.changeBackgroundFilter = function() {

        var theElement = $scope.selectedElement;


        var styleValue = '';
/*
        if ($scope.imageFilters.blur != 0)
            styleValue =  " blur("+$scope.imageFilters.blur+"px) ";
        if ($scope.imageFilters.grayscale != 0)
            styleValue = styleValue + " grayscale("+$scope.imageFilters.grayscale+"%) ";
        if ($scope.imageFilters.sepia != 0)
            styleValue = styleValue + " sepia("+$scope.imageFilters.sepia+"%) ";
        if ($scope.imageFilters.brightness != 0)
            styleValue = styleValue + " brightness("+$scope.imageFilters.brightness+"%) ";
        if ($scope.imageFilters.contrast != 0)
            styleValue = styleValue + " contrast("+$scope.imageFilters.contrast+"%) ";
  */
        if ($scope.imageFilters.opacity != 0)
            styleValue = styleValue + " opacity("+$scope.imageFilters.opacity+"%) ";


        theElement.css("filter",styleValue);
        theElement.css("webkitFilter",styleValue);
        theElement.css("mozFilter",styleValue);
        theElement.css("oFilter",styleValue);
        theElement.css("msFilter",styleValue);

    }
/*
$scope.changeVisibility = function() {

    if($scope.selectedElementType != 'page')
    {

    if ($scope.visibleXS == true)
        {
            $scope.selectedElement.addClass('visible-xs');
        } else {
        $scope.selectedElement.removeClass('visible-xs');
        }

    if ($scope.visibleSM == true)
        {
            $scope.selectedElement.addClass('visible-sm');
        } else {
        $scope.selectedElement.removeClass('visible-sm');
        }
    if ($scope.visibleMD == true)
        {
            $scope.selectedElement.addClass('visible-md');
        } else {
        $scope.selectedElement.removeClass('visible-md');
        }
    if ($scope.visibleLG == true)
        {
            $scope.selectedElement.addClass('visible-lg');
        } else {
        $scope.selectedElement.removeClass('visible-lg');
        }
    if ($scope.visiblePrint == true)
        {
            $scope.selectedElement.addClass('visible-print');
        } else {
        $scope.selectedElement.removeClass('visible-print');
        }

        if ($scope.hiddenXS == true)
        {
            $scope.selectedElement.addClass('hidden-xs');
        } else {
            $scope.selectedElement.removeClass('hidden-xs');
        }

        if ($scope.hiddenSM == true)
        {
            $scope.selectedElement.addClass('hidden-sm');
        } else {
            $scope.selectedElement.removeClass('hidden-sm');
        }
        if ($scope.hiddenMD == true)
        {
            $scope.selectedElement.addClass('hidden-md');
        } else {
            $scope.selectedElement.removeClass('hidden-md');
        }
        if ($scope.hiddenLG == true)
        {
            $scope.selectedElement.addClass('hidden-lg');
        } else {
            $scope.selectedElement.removeClass('hidden-lg');
        }
        if ($scope.hiddenPrint == true)
        {
            $scope.selectedElement.addClass('hidden-print');
        } else {
            $scope.selectedElement.removeClass('hidden-print');
        }

        }
    }*/


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
        saveDashboard();

    };

    function cleanAll() {

        var root = document.getElementById('previewContainer');

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
/*
            if (elementType == 'ndReportContainer')
                {
                    $(theElement.childNodes[i]).children().remove();
                }*/



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

/*
    function getAllPageColumns()
    {
        $scope.allPageColumns = [];
        $scope.allPageMetricColumns = [];

        for (var i in  $scope.queries)
            {
          for (var c in  $scope.queries[i].columns)
                {
                  $scope.allPageColumns.push({label: $scope.queries[i].name +'.'+$scope.queries[i].columns[c].objectLabel,object:$scope.queries[i].columns[c],query:$scope.queries[i]});
                    if ($scope.queries[i].columns[c].elementType == 'number' || $scope.queries[i].columns[c].elementType == 'count')
                        $scope.allPageMetricColumns.push({label: $scope.queries[i].name +'.'+$scope.queries[i].columns[c].objectLabel,object:$scope.queries[i].columns[c],query:$scope.queries[i]});
                }
            }

    }
*/
/*
    function preparePageToSave()
    {

        //Put all charts in loading mode...
        for (var c in $scope.charts)
            {
                if ($scope.charts[c] != undefined)
                    $scope.showOverlay('OVERLAY_'+$scope.charts[c].chartID);
            }

        cleanAllSelected();
        var page = $scope.selectedDashboard;

        page.properties.queries = $scope.queries;
        var cleanedCharts = [];

        for (var i in $scope.charts)
        {
            if ($scope.charts[i] != undefined)
            {
            var theChart = clone($scope.charts[i]);
            theChart.chartCanvas = undefined;
            theChart.data = undefined;
            theChart.query = undefined;

            var targetChart = document.getElementById(theChart.chartID);

            if (targetChart != undefined)
                cleanedCharts.push(theChart);
            }
        }

        for (var i in $scope.queries)
        {
        $scope.queries[i].data = undefined;
        }

        page.properties.charts = cleanedCharts;

        var container = $('#designArea');

        var theHTML = container.html();

        page.properties.designerHTML = theHTML;

        var previewContainer = $('#previewContainer');

            $('#previewContainer').children().remove();

                    var $div = $(theHTML);
                    previewContainer.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

        cleanAll();

        page.html = previewContainer.html();

        return page;
    }*/
/*
    $scope.copyPage = function()
    {
        //var page = preparePageToSave;

        //Put all charts in loading mode...
        for (var c in $scope.charts)
        {
                if ($scope.charts[c] != undefined)
                    $scope.showOverlay('OVERLAY_'+$scope.charts[c].chartID);
        }

        cleanAllSelected();
        var page = $scope.selectedDashboard;

        page.properties.queries = $scope.queries;
        var cleanedCharts = [];

        for (var i in $scope.charts)
        {
            if ($scope.charts[i] != undefined)
            {
            var theChart = clone($scope.charts[i]);
            theChart.chartCanvas = undefined;
            theChart.data = undefined;
            theChart.query = undefined;

            var targetChart = document.getElementById(theChart.chartID);

            if (targetChart != undefined)
                cleanedCharts.push(theChart);
            }
        }

        for (var i in $scope.queries)
        {
        $scope.queries[i].data = undefined;
        }

        page.properties.charts = cleanedCharts;

        var container = $('#designArea');

        var theHTML = container.html();

        page.properties.designerHTML = theHTML;

        var previewContainer = $('#previewContainer');

            $('#previewContainer').children().remove();

                    var $div = $(theHTML);
                    previewContainer.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

        cleanAll();

        page.html = previewContainer.html();

            connection.post('/api/pages/duplicate', page, function(data) {
                if (data.result == 1) {

                }
            });
    }*/

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


/*
        var cleanedCharts = [];

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

                    var targetChart = document.getElementById(theChart.chartID);

                    if (targetChart != undefined)
                        cleanedCharts.push(theChart);
                }
            }
        }

        page.properties.repeaters = $scope.repeaters;

        for (var i in $scope.queries)
        {
        $scope.queries[i].data = undefined;
        }

        page.properties.charts = cleanedCharts;
*/
        var container = $('#designArea');

        var theHTML = container.html();

        theHTML = theHTML.replace('vs-repeat',' ');

        $scope.selectedDashboard.properties.designerHTML = theHTML;

        var previewContainer = $('#previewContainer');

            $('#previewContainer').children().remove();

                    var $div = $(theHTML);
                    previewContainer.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

        cleanAll();

        $scope.selectedDashboard.html = previewContainer.html();


        if ($scope.mode == 'add') {
            connection.post('/api/dashboardsv2/create', dashboard, function(data) {
                if (data.result == 1) {

                }
            });

        } else {

            connection.post('/api/dashboardsv2/update/'+dashboard._id, dashboard, function(result) {
                if (result.result == 1) {
                    /*
                    for (var c in $scope.charts)
                        {
                           if ($scope.charts[c] != undefined)
                           $scope.hideOverlay('OVERLAY_'+$scope.charts[c].chartID);
                        }
                        */
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
                            report_v2Model.repaintReport($scope.selectedDashboard.reports[i]);
                        }
                }
            }


        /*for (var rp in $scope.repeaters)
                    {

                        for (var q in $scope.queries)
                            {
                                if ($scope.queries[q].name == $scope.repeaters[rp].query)
                                    {
                                    var queryScopeReference = $scope.queries[q];

                                    }
                            }

                        grid.simpleGrid($scope.repeaters[rp].dataColumns,$scope.repeaters[rp].id,queryScopeReference,true,$scope.repeaters[rp].properties,function(){

                        });
                    }*/
    }

   /* function rebuildCharts4Query(queryID)
    {
        for (var i in $scope.charts)
        {
            if ($scope.charts[i] != undefined)
            {
            var theChart = $scope.charts[i];
                if (queryID == theChart.query.id)
                    {
                    //c3Charts.rebuildChart(theChart)
                    c3Charts.refreshChartData(theChart);
                    }

           // c3Charts.rebuildChart(theChart)
            c3Charts.refreshChartData(theChart);
            }
        }
    } */

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
        connection.post('/api/pages/publish-page', {_id:$scope.selectedDashboard._id,parentFolder:folderID}, function(data) {
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
                var html = '<nd-prompt element-id="'+thePrompt.elementID+'" label="'+thePrompt.objectLabel+'" description="'+thePrompt.promptInstructions+'" value-field="'+thePrompt.name+'" show-field="'+thePrompt.name+'" selected-value="'+thePrompt.filterText1+'" prompts="prompts" on-change="promptChanged" after-get-values="afterPromptGetValues" ng-model="lastPromptSelectedValue"></nd-prompt>';

                var $div = $(html);
                            $(targetPrompt).append($div);
                            angular.element(document).injector().invoke(function($compile) {
                                var scope = angular.element($div).scope();
                                $compile($div)(scope);
                            });


            }

        }

    }

    $scope.moveElementUp = function()
    {
       var theElement = $scope.selectedElement;

       var selected = $(theElement).index();

       var parent = $(theElement).parent();

       $(parent).children().eq(selected-1).before($(parent).children().eq(selected));
    }

    $scope.moveElementDown = function()
    {
       var theElement = $scope.selectedElement;

       var selected = $(theElement).index();

       var parent = $(theElement).parent();

       $(parent).children().eq(selected+1).after($(parent).children().eq(selected));
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






});
