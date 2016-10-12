app.service('report_v2Model' , function (queryModel,c3Charts,grid,bsLoadingOverlayService,connection,$routeParams,promptModel) {

    var report = {};

    this.getReportDefinition = function(id,isLinked,done)
    {
        connection.get('/api/reports/get-report/'+id, {id: id, mode: 'preview', linked:isLinked}, function(data) {
            if (data.item)
            {
                //report = data.item;
                done(data.item);
            } else {
                done(null);
            }
        });
    }

    this.getReport = function(report,parentDiv,done)
    {
        getReport(report,parentDiv,done);
    }


    function getReport(report,parentDiv,done)
    {
    showOverlay('OVERLAY_'+parentDiv);

        var isLinked = false;
/*
        if ($routeParams.elementID && $routeParams.elementValue)
               isLinked = true;

        promptModel.getPrompts($scope,report, function(){
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


                    }  else {
                        if ($scope.prompts.length > 0)
                        {
                            $scope.showPrompts = true;
                        } else {
                            setReportDiv($routeParams.reportID);
                        }
                    }
                });

    */

    queryModel.loadQuery(report.query);

    queryModel.getQueryData( function(data,sql,query){
                console.log('the report data',data);
                report.query.data = data;
                report.parentDiv = parentDiv;
                repaintReport(report);
                done(sql);

        });
    }


    /*
    $scope.getReportDiv = function()
    {
        var isLinked = false;

        if ($routeParams.elementID && $routeParams.elementValue)
               isLinked = true;


        reportModel.getReport($scope, $routeParams.reportID,'execute',isLinked, function(report) {
            if (report)
            {
                promptModel.getPrompts($scope,report, function(){
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


                    }  else {
                        if ($scope.prompts.length > 0)
                        {
                            $scope.showPrompts = true;
                        } else {
                            setReportDiv($routeParams.reportID);
                        }
                    }
                });
            }
        });

    }

    $scope.checkPrompts = function()
    {
        promptModel.checkPrompts($scope, function (){
            setReportDiv();
        });
    }


    */


    this.repaintReport = function(report)
    {
        repaintReport(report);
    }

    function repaintReport(report)
    {
        if (report.query.data.length != 0)
            {
                if (report.reportType == 'grid')
                            {
                                    var gridProperties = {rowHeight:20,
                                                         cellBorderColor:'#000'};
                                //var htmlCode = grid.simpleGridV2(report,false,gridProperties);
                                var htmlCode = grid.extendedGridV2(report);
                                //var htmlCode = grid.getUIGrid(report);

                                    var el = document.getElementById(report.parentDiv);

                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay('OVERLAY_'+report.parentDiv);
                                            });
                                        }


                            }


                    if (report.reportType == 'chart-line' || report.reportType == 'chart-donut' || report.reportType == 'chart-pie' || report.reportType == 'gauge')
                            {
                                        if (report.reportType == 'chart-donut')
                                            report.properties.chart.type = 'donut';
                                        if (report.reportType == 'chart-pie')
                                            report.properties.chart.type = 'pie';
                                        if (report.reportType == 'gauge')
                                            report.properties.chart.type = 'gauge';
                                generatec3Chart(report);
                            }
            } else {

                                var htmlCode = '<span style="font-size: small;color: darkgrey;padding: 5px;">'+report.reportName+'</span><div style="width: 100%;height: 100%;display: flex;align-items: center;"><span style="color: darkgray; font-size: initial; width:100%;text-align: center";><img src="/images/empty.png">No data for this report</span></div>';
                                var el = document.getElementById(report.parentDiv);
                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay('OVERLAY_'+report.parentDiv);
                                            });
                                        }
            }
    }


    function generatec3Chart(report)
    {
            var htmlCode = c3Charts.getChartHTML(report.properties.chart.chartID);
                                var el = document.getElementById(report.parentDiv);

                                if (el)
                                {
                                    angular.element(el).empty();
                                    var $div = $(htmlCode);
                                    angular.element(el).append($div);
                                    angular.element(document).injector().invoke(function($compile) {
                                        var scope = angular.element($div).scope();
                                        $compile($div)(scope);
                                        setTimeout(function() {c3Charts.rebuildChart(report.query,report.properties.chart);
                                                               hideOverlay('OVERLAY_'+report.parentDiv);
                                                               }, 500);
                                        //$scope.gettingData = false;
                                    });
                                }

    }

    function showOverlay(referenceId) {
        bsLoadingOverlayService.start({
            referenceId: referenceId
        });
    };

    function hideOverlay(referenceId) {
        bsLoadingOverlayService.stop({
            referenceId: referenceId
        });
    };

    var selectedColumn = undefined;

    this.selectedColumn = function()
    {
        return selectedColumn;
    }

    var selectedColumnHashedID = undefined;

    this.selectedColumnHashedID = function()
    {
        return selectedColumnHashedID;
    }

    var selectedColumnIndex = undefined;

    this.selectedColumnIndex = function()
    {
        return selectedColumnIndex;
    }


    this.changeColumnStyle = function(report,columnIndex ,hashedID)
    {
        selectedColumn = report.properties.columns[columnIndex];
        selectedColumnHashedID  = hashedID;
        selectedColumnIndex  = columnIndex;

        if (!selectedColumn.columnStyle)
             selectedColumn.columnStyle = {color:'#000','background-color':'#EEEEEE','text-align':'left','font-size':"12px",'font-weight':"normal",'font-style':"normal"};

        $('#columnFormatModal').modal('show');

    }

    this.changeColumnSignals = function(report,columnIndex ,hashedID)
    {

        selectedColumn = report.properties.columns[columnIndex];
        selectedColumnHashedID  = hashedID;
        selectedColumnIndex  = columnIndex;

        if (!selectedColumn.signals)
            selectedColumn.signals = [];


        $('#columnSignalsModal').modal('show');


    }

    this.orderColumn = function(report,columnIndex, desc,hashedID) {

        var theColumn = report.query.columns[columnIndex];
        if (desc == true)
            theColumn.sortType = 1;
        else
            theColumn.sortType = -1;
        report.query.order = [];
        report.query.order.push(theColumn);
        showOverlay('OVERLAY_'+hashedID);
        console.log('overlay','OVERLAY_'+hashedID);
        queryModel.getQueryData( function(data,sql,query){

                report.query.data = data;
                hideOverlay('OVERLAY_'+hashedID);
        });


        //get the column index, identify the report.query.column by  index, then add to query.order taking care about the sortType -1 / 1
    };

    function clone(obj) {
        if (null == obj || "object" != typeof obj) return obj;
        var copy = obj.constructor();
        for (var attr in obj) {
            if (obj.hasOwnProperty(attr)) copy[attr] = obj[attr];
        }
        return copy;
    }


    this.saveAsReport = function(report,mode,done) {

                //Cleaning up the report object
                var clonedReport = clone(report);
                if (clonedReport.properties.chart)
                    {
                    clonedReport.properties.chart.chartCanvas = undefined;
                    clonedReport.properties.chart.data = undefined;
                    //clonedReport.properties.chart.query = undefined;
                    }
                if (clonedReport.query.data)
                    clonedReport.query.data = undefined;
                clonedReport.parentDiv = undefined;

                if (mode == 'add') {
                    connection.post('/api/reports/create', clonedReport, function(data) {
                        if (data.result == 1) {
                           setTimeout(function () {
                            done();
                            }, 400);
                        }
                    });
                }
                else {
                    connection.post('/api/reports/update/'+report._id, clonedReport, function(result) {
                        if (result.result == 1) {
                            setTimeout(function () {
                            done();
                            }, 400);
                        }
                    });
        }


    };


});
