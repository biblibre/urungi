app.service('report_v2Model' , function (queryModel,c3Charts,reportHtmlWidgets,grid,bsLoadingOverlayService,connection,$routeParams,verticalGrid) {

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

    this.getReport = function(report,parentDiv,mode,done)
    {
        getReport(report,parentDiv,mode,done);
    }


    function getReport(report,parentDiv,mode,done)
    {
        showOverlay(parentDiv);
        var isLinked = false;
        queryModel.loadQuery(report.query);
        queryModel.detectLayerJoins();
        queryModel.getQueryData(report.query, function(data,sql,query){
                    report.query.data = data;
                    report.parentDiv = parentDiv;
                    repaintReport(report,mode);
                    done(sql);
                    hideOverlay(parentDiv);
            });
    }

    this.getReportDataNextPage = function(report,page)
    {
        getReportDataNextPage(report,page);
    }

    function getReportDataNextPage(report,page)
    {
        queryModel.loadQuery(report.query);
        queryModel.getQueryDataNextPage(page, function(data,sql,query){
                report.query.data.push.apply(report.query.data, data);
            });
    }

    this.repaintReport = function(report,mode)
    {
        repaintReport(report,mode);
    }

    function repaintReport(report,mode)
    {
        var data = report.query.data;

        if (data.length != 0)
            {
        switch(report.reportType)
            {
                case "grid":
                    {
                                var htmlCode = grid.extendedGridV2(report,mode);
                                var el = document.getElementById(report.parentDiv);

                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }
                    }
                    break;
                case "vertical-grid":
                    {
                                var htmlCode = verticalGrid.getVerticalGrid(report,mode);
                                var el = document.getElementById(report.parentDiv);

                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }
                    }
                    break;
                case 'chart-line':
                case 'chart-donut':
                case 'chart-pie':
                case 'gauge':
                    {
                        if (report.reportType == 'chart-donut')
                                    report.properties.chart.type = 'donut';
                                if (report.reportType == 'chart-pie')
                                    report.properties.chart.type = 'pie';
                                if (report.reportType == 'gauge')
                                    report.properties.chart.type = 'gauge';
                        generatec3Chart(report,mode);
                    }
                    break;
                case 'indicator':
                    generateIndicator(report);
                    break;

        }

            } else {
                generateNoDataHTML()
            }
        /*

                if (report.reportType == 'grid')
                            {
                                //var htmlCode = grid.getUIGrid(report);
                                var htmlCode = grid.extendedGridV2(report,mode);
                                var el = document.getElementById(report.parentDiv);

                                        if (el)
                                        {
                                            angular.element(el).empty();
                                            var $div = $(htmlCode);
                                            angular.element(el).append($div);
                                            angular.element(document).injector().invoke(function($compile) {
                                                var scope = angular.element($div).scope();
                                                $compile($div)(scope);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }


                            } else {

        if (data.length != 0)
            {
                    if (report.reportType == 'chart-line' || report.reportType == 'chart-donut' || report.reportType == 'chart-pie' || report.reportType == 'gauge')
                            {

                                        if (report.reportType == 'chart-donut')
                                            report.properties.chart.type = 'donut';
                                        if (report.reportType == 'chart-pie')
                                            report.properties.chart.type = 'pie';
                                        if (report.reportType == 'gauge')
                                            report.properties.chart.type = 'gauge';
                                generatec3Chart(report,mode);
                            }
                    if (report.reportType == 'indicator')
                        {

                            generateIndicator(report);
                        }


            } else {
                 generateNoDataHTML()
            }


                            }
        */

    }

    function generateNoDataHTML()
    {
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
                                                //hideOverlay('OVERLAY_'+report.parentDiv);
                                                hideOverlay(report.parentDiv);
                                            });
                                        }
    }

    this.generateIndicator = function(report)
    {
        generateIndicator(report);
    }

    function generateIndicator(report)
    {

        var htmlCode = reportHtmlWidgets.generateIndicator(report);
        //var el = document.getElementById(report.parentDiv);
        var el = document.getElementById(report.parentDiv);

        console.log('indicator HTML',htmlCode);
        console.log('indicator el',el);

                                if (el)
                                {
                                    angular.element(el).empty();
                                    var $div = $(htmlCode);
                                    angular.element(el).append($div);
                                    angular.element(document).injector().invoke(function($compile) {
                                        var scope = angular.element($div).scope();
                                        $compile($div)(scope);
                                        setTimeout(function() {c3Charts.rebuildChart(report);
                                                               hideOverlay('OVERLAY_'+report.parentDiv);
                                                               }, 500);
                                    });
                                }
    }


    function generatec3Chart(report,mode)
    {

        var reportID = report.id;

        var htmlCode = c3Charts.getChartHTML(report,reportID,mode);

        var el = document.getElementById(report.parentDiv);

                                if (el)
                                {
                                    angular.element(el).empty();
                                    var $div = $(htmlCode);
                                    angular.element(el).append($div);
                                    angular.element(document).injector().invoke(function($compile) {
                                        var scope = angular.element($div).scope();
                                        $compile($div)(scope);
                                        /*setTimeout(function() {c3Charts.rebuildChart(report,report.query,report.properties.chart);
                                                               hideOverlay('OVERLAY_'+report.parentDiv);
                                                               }, 500);*/
                                        setTimeout(function() {c3Charts.rebuildChart(report);
                                                               hideOverlay('OVERLAY_'+report.parentDiv);
                                                               }, 500);
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

        queryModel.getQueryData(report.query, function(data,sql,query){

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

    this.saveToExcel = function($scope,reportHash)
    {
        var wopts = { bookType:'xlsx', bookSST:false, type:'binary' };
        var ws_name = $scope.selectedReport.reportName;

        var wb = new Workbook(), ws = sheet_from_array_of_arrays($scope,reportHash);

        wb.SheetNames.push(ws_name);
        wb.Sheets[ws_name] = ws;




        var wbout = XLSX.write(wb,wopts);

        function s2ab(s) {
            var buf = new ArrayBuffer(s.length);
            var view = new Uint8Array(buf);
            for (var i=0; i!=s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF;
            return buf;
        }

        saveAs(new Blob([s2ab(wbout)],{type:""}), ws_name+".xlsx")


    }


     function Workbook() {
        if(!(this instanceof Workbook)) return new Workbook();
        this.SheetNames = [];
        this.Sheets = {};
    }

    function sheet_from_array_of_arrays($scope,reportHash) {
        var data = $scope.selectedReport.query.data;
        var report = $scope.selectedReport;
        var ws = {};
        var range = {s: {c:10000000, r:10000000}, e: {c:0, r:0 }};
        for(var i = 0; i < report.properties.columns.length; i++)
        {
            if(range.s.r > 0) range.s.r = 0;
            if(range.s.c > i) range.s.c = i;
            if(range.e.r < 0) range.e.r = 0;
            if(range.e.c < i) range.e.c = i;


            var cell = {v: report.properties.columns[i].objectLabel };
            var cell_ref = XLSX.utils.encode_cell({c:i,r:0});
            if(typeof cell.v === 'number') cell.t = 'n';
            else if(typeof cell.v === 'boolean') cell.t = 'b';
            else if(cell.v instanceof Date) {
                cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                cell.v = datenum(cell.v);
            }
            else cell.t = 's';

            ws[cell_ref] = cell;
        }


        for(var R = 0; R != data.length; ++R) {

            for(var i = 0; i < report.properties.columns.length; i++)
            {
                //var elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName;
                var elementID = 'wst'+report.properties.columns[i].elementID.toLowerCase();
                var elementName = elementID.replace(/[^a-zA-Z ]/g,'');

                if (report.properties.columns[i].aggregation)
                    {
                    //elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName+report.properties.columns[i].aggregation;
                    var elementID = 'wst'+report.properties.columns[i].elementID.toLowerCase()+report.properties.columns[i].aggregation;
                    var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                    }
                if(range.s.r > R+1) range.s.r = R+1;
                if(range.s.c > i) range.s.c = i;
                if(range.e.r < R+1) range.e.r = R+1;
                if(range.e.c < i) range.e.c = i;

                if (report.properties.columns[i].elementType == 'number' && data[R][elementName])
                {
                    var cell = {v: Number(data[R][elementName]) };
                } else {
                    var cell = {v: data[R][elementName] };
                }
                var cell_ref = XLSX.utils.encode_cell({c:i,r:R+1});
                if(typeof cell.v === 'number') cell.t = 'n';
                else if(typeof cell.v === 'boolean') cell.t = 'b';
                else if(cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                }
                else cell.t = 's';

                cell.s = {fill: { fgColor: { rgb: "FFFF0000"}}};

                ws[cell_ref] = cell;
            }
        }
        if(range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);

        return ws;

    }

    this.getReportContainerHTML = function(reportID)
    {
        var containerID = 'REPORT_CONTAINER_'+reportID;
/*
        var html = '<div page-block class="container-fluid featurette ndContainer"  ndType="container" style="height:100%">'+
                        '<div page-block class="col-md-12 ndContainer" ndtype="column" style="height:100%">'+
                              '<div class="container-fluid" id="'+containerID+'" ng-init="getRuntimeReport('+"'"+reportID+"'"+')" bs-loading-overlay bs-loading-overlay-reference-id="REPORT_'+reportID+'" style="padding:0pxposition: relative;height: 100%;"></div>';

                        '</div>'+
                    '</div>';
*/
        var html = '<div page-block  class="container-fluid featurette ndContainer"  ndType="container" style="height:100%;padding:0px;">'+
                        '<div page-block class="col-md-12 ndContainer" ndType="column" style="height:100%;padding:0px;">'+
                            '<div page-block class="container-fluid" id="'+containerID+'" ndType="'+reportType+'" ng-init="getRuntimeReport('+"'"+reportID+"'"+')" bs-loading-overlay bs-loading-overlay-reference-id="REPORT_'+reportID+'" style="padding:0px;position: relative;height: 100%;"></div>';

                        '</div>'+
                    '</div>';

        return html;
    }

    this.getPromptHTML = function(prompt)
    {
        var html = '<div id="PROMPT_'+prompt.elementID+'" page-block class="ndContainer" ndType="ndPrompt"><nd-prompt  filter="getFilter('+"'"+prompt.elementID+"'"+')" element-id="'+prompt.elementID+'" label="'+prompt.objectLabel+'" value-field="'+prompt.name+'" show-field="'+prompt.name+'" prompts="prompts" after-get-values="afterPromptGetValues" on-change="promptChanged" ng-model="lastPromptSelectedValue"></nd-prompt></div>';

        return html;
    }


});
