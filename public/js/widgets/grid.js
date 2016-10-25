app.service('grid' , function () {

    var colClass = '';
    var colWidth = '';
    var hashedID = '';
    var columns = [];
    var report = {};

    function quotedHashedID()
    {
        return "'"+hashedID+"'";
    }

this.refresh = function(columns,id,query,designerMode, properties)
    {
        this.simpleGrid(columns,id,query,designerMode,properties, function(){
        });
    }

function replaceAll(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
}

this.getUIGrid = function(report)
   {
       report = report;
       var id = report.id;
       hashedID = report.query.id;
       columns = report.properties.columns;

       var colDefs = [];

        for (var i in columns)
            {
                var elementName = columns[i].id;
                if (columns[i].aggregation)
                    elementName = elementName+columns[i].aggregation;
                var elementNameAux = elementName;
                if (columns[i].elementType === 'date')
                        elementNameAux = "'"+columns[i].id+'_original'+"'";

                var col = {};
                col.field = elementName;
                col.displayName = columns[i].objectLabel;

                if (columns[i].elementType == 'number')
                    {
                        col.cellFilter = 'number: 2';
                        col.cellClass = 'grid-cell-right';
                    }

               /* col.menuItems = [
          {
            title: 'Outer Scope Alert',
            icon: 'ui-grid-icon-info-circled',
            //action: function($event) {
            //  this.context.blargh(); // $scope.blargh() would work too, this is just an example
            //},
            //context: this
          }];*/
                //This is to be applied for conditional formating ...
                //col.cellTemplate = '<div class="ui-grid-cell-contents" > hola {{grid.getCellValue(row, col)}}</div>';

                colDefs.push(col);
            }

            /* Scroll bars
            enableHorizontalScrollbar = value;
            enableVerticalScrollbar = value;

            value = 0;  NEVER
            value = 1;  ALWAYS
            value = 2;  WHEN_NEEDED

            */

            report.properties.columnDefs = colDefs;
            return '<div ui-grid="{data: getQuery(\''+hashedID+'\').data, columnDefs: getReportColumnDefs(\''+report.id+'\'), enableVerticalScrollbar:0, enableHorizontalScrollbar:0}" class="myGrid"></div>';
   }


   this.blargh = function()
   {
       console.log('blargh');
   }

this.simpleGrid = function(columns,id,query,designerMode,properties,done)
    {
            hashedID = query.id;


            var htmlCode = '<div class="container-fluid repeater-tool-container"></div>';


            if (columns.length == 5 || columns.length > 6)
                colWidth = 'width:'+100/columns.length+'%;float:left;';
            else
                colClass = 'col-xs-'+12/columns.length;

            //header  page-block  ndType="gridHeader"
            htmlCode += '<div page-block ndtype="gridHeader" class="container-fluid" id="HEADER_'+id+'" style="width:100%;padding:2px;background-color:#ccc;">';
            for(var i = 0; i < columns.length; i++)
            {
                    var elementName = "'"+columns[i].id+"'";
                    if (columns[i].aggregation)
                        elementName = "'"+elementName+columns[i].aggregation+"'";

                    var elementNameAux = elementName;
                    if (columns[i].elementType === 'date')
                        elementNameAux = "'"+columns[i].id+'_original'+"'";
                    htmlCode += '<div id="HEADERCOL_'+columns[i].id+'['+i+']"  class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><span class="hand-cursor" >'+columns[i].elementLabel+'</span> </div>';

            }

            htmlCode += '</div>';


            //Body
            htmlCode += '<div page-block ndtype="gridBody" vs-repeat style="max-height:460px;width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;">';

            htmlCode += '<div  class="repeater-data container-fluid" ng-repeat="item in getQuery(\''+hashedID+'\').data" style="width:100%;padding:0px">';

            // POPOVER con HTML https://maxalley.wordpress.com/2014/08/19/bootstrap-3-popover-with-html-content/
            htmlCode += '<div ng-if="getQuery(\''+hashedID+'\').data.length == 0">No data</div>';

            for(var i = 0; i < columns.length; i++)
            {
                var elementName = columns[i].id;
                if (columns[i].aggregation)
                    elementName = elementName+columns[i].aggregation;
                var theValue = '<span>{{item.'+elementName+'}}</span>';

                if (columns[i].elementType === 'number')
                    theValue = '<span>{{item.'+elementName+' | number}}</span>';

                if (columns[i].signals)
                {
                    var theStyle = '<style>';
                    var theClass = '';
                    for (var s in columns[i].signals)
                    {
                        theStyle += ' .customStyle'+s+'_'+i+'{color:'+columns[i].signals[s].color+';background-color:'+columns[i].signals[s]['background-color']+';font-size:'+columns[i].signals[s]['font-size']+';font-weight:'+columns[i].signals[s]['font-weight']+';font-style:'+columns[i].signals[s]['font-style']+';}';
                        var theComma = '';
                        if (s > 0)
                            theComma = ' , ';

                        var operator = '>'

                        switch(columns[i].signals[s].filter) {
                            case "equal":
                                operator = ' == ' + columns[i].signals[s].value1
                                break;
                            case "diferentThan":
                                operator = ' != '  + columns[i].signals[s].value1
                                break;
                            case "biggerThan":
                                operator = ' > '  + columns[i].signals[s].value1
                                break;
                            case "biggerOrEqualThan":
                                operator = ' >= '  + columns[i].signals[s].value1
                                break;
                            case "lessThan":
                                operator = ' < '  + columns[i].signals[s].value1
                                break;
                            case "lessOrEqualThan":
                                operator = ' <= ' + columns[i].signals[s].value1
                                break;
                            case "between":
                                operator = ' >= ' + columns[i].signals[s].value1 + ' && {{item.'+elementName+'}} <= ' + columns[i].signals[s].value2
                                break;
                            case "notBetween":
                                operator = ' < ' + columns[i].signals[s].value1 + ' || {{item.'+elementName+'}}  > ' + columns[i].signals[s].value2
                                break;
                        }




                        theClass += theComma+ 'customStyle'+s+'_'+i+' : {{item.'+elementName+'}} '+operator;
                    }
                    htmlCode += theStyle +'</style>'

                    if (columns[i].elementType === 'number')
                        theValue = '<span ng-class="{'+theClass+'}"  >{{item.'+elementName+' | number}}</span>';
                        else
                        theValue = '<span ng-class="{'+theClass+'}"  >{{item.'+elementName+'}}</span>';

                }





                var columnStyle = '';
                if (columns[i].columnStyle)
                {
                    columnStyle = 'color:'+columns[i].columnStyle.color+';';

                    for (var key in columns[i].columnStyle) {
                        columnStyle += key+':'+columns[i].columnStyle[key]+';';
                    }
                }

                var rowHeight = 20;
                var cellBorderColor = '#000';
                if (properties)
                    rowHeight = properties.rowHeight;
                    cellBorderColor = properties.cellBorderColor;

                var defaultAligment = '';
                if (columns[i].elementType === 'number')
                    defaultAligment = 'text-align: right;';

                var borderRight = 'border-right: 1px solid '+cellBorderColor+';';
                var borderBottom = 'border-bottom: 1px solid '+cellBorderColor+';';
                var borderLeft = '';
                if (i == 0)
                    borderLeft = 'border-left: 1px solid '+cellBorderColor+';';
                var cellHeight = 'height:'+rowHeight+'px;';
                var cellPadding = 'padding:2px;';
                var theCellStyle = columnStyle+colWidth+defaultAligment+cellHeight+'overflow:hidden;'+cellPadding+borderRight+borderBottom+borderLeft;


                    //page-block ndType="gridDataColumn"
                    htmlCode += '<div class="repeater-data-column '+colClass+' popover-primary" style="'+theCellStyle+'" popover-trigger="mouseenter" popover-placement="top" popover-title="'+columns[i].elementLabel+'" popover="{{item.'+elementName+'}}">'+theValue+' </div>';
            }

            htmlCode += '</div>';
            htmlCode += '</div>';

            htmlCode += '<div class="repeater-data">';
                    for(var i in columns)
                    {
                        var elementName = columns[i].id;
                        if (columns[i].aggregation)
                            elementName = elementName+columns[i].aggregation;

                    }
        htmlCode += '</div>';

            var el = document.getElementById(id);

            if (!el)
                el = document.getElementById('reportLayout');


            if (el)
            {
                angular.element(el).empty();
                var $div = $(htmlCode);
                angular.element(el).append($div);
                angular.element(document).injector().invoke(function($compile) {
                    var scope = angular.element($div).scope();
                    $compile($div)(scope);
                });
            }
            done(0);
            return;

    }

this.simpleGridV2 = function(report,designerMode,properties)
    {
            report = report;
            columns = report.properties.columns;
            var id = report.id;

            hashedID = report.query.id;

            var htmlCode = '<div  class="container-fluid repeater-tool-container"></div>';

            if (columns.length == 5 || columns.length > 6)
                colWidth = 'width:'+100/columns.length+'%;float:left;';
            else
                colClass = 'col-xs-'+12/columns.length;

            htmlCode += '<div page-block ndtype="gridHeader" class="container-fluid" id="HEADER_'+id+'" style="width:100%;padding:2px;background-color:#ccc;">';
            for(var i = 0; i < columns.length; i++)
            {
                    var elementName = "'"+columns[i].id+"'";
                    if (columns[i].aggregation)
                        elementName = "'"+elementName+columns[i].aggregation+"'";

                    var elementNameAux = elementName;
                    if (columns[i].elementType === 'date')
                        elementNameAux = "'"+columns[i].id+'_original'+"'";
                    htmlCode += '<div id="HEADERCOL_'+columns[i].id+'['+i+']"  class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><span class="hand-cursor" >'+columns[i].elementLabel+'</span> </div>';

            }

            htmlCode += '</div>';

            //Body
            htmlCode += '<div page-block ndtype="gridBody" vs-repeat style="max-height:460px;width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;">';

            htmlCode += '<div  class="repeater-data container-fluid" ng-repeat="item in getQuery(\''+hashedID+'\').data" style="width:100%;padding:0px">';

            htmlCode += '<div ng-if="getQuery(\''+hashedID+'\').data.length == 0">No data</div>';

            for(var i = 0; i < columns.length; i++)
            {
                var elementName = columns[i].id;
                if (columns[i].aggregation)
                    elementName = elementName+columns[i].aggregation;
                var theValue = '<span>{{item.'+elementName+'}}</span>';

                if (columns[i].elementType === 'number')
                    theValue = '<span>{{item.'+elementName+' | number}}</span>';

                if (columns[i].signals)
                {
                    var theStyle = '<style>';
                    var theClass = '';
                    for (var s in columns[i].signals)
                    {
                        theStyle += ' .customStyle'+s+'_'+i+'{color:'+columns[i].signals[s].color+';background-color:'+columns[i].signals[s]['background-color']+';font-size:'+columns[i].signals[s]['font-size']+';font-weight:'+columns[i].signals[s]['font-weight']+';font-style:'+columns[i].signals[s]['font-style']+';}';
                        var theComma = '';
                        if (s > 0)
                            theComma = ' , ';

                        var operator = '>'

                        switch(columns[i].signals[s].filter) {
                            case "equal":
                                operator = ' == ' + columns[i].signals[s].value1
                                break;
                            case "diferentThan":
                                operator = ' != '  + columns[i].signals[s].value1
                                break;
                            case "biggerThan":
                                operator = ' > '  + columns[i].signals[s].value1
                                break;
                            case "biggerOrEqualThan":
                                operator = ' >= '  + columns[i].signals[s].value1
                                break;
                            case "lessThan":
                                operator = ' < '  + columns[i].signals[s].value1
                                break;
                            case "lessOrEqualThan":
                                operator = ' <= ' + columns[i].signals[s].value1
                                break;
                            case "between":
                                operator = ' >= ' + columns[i].signals[s].value1 + ' && {{item.'+elementName+'}} <= ' + columns[i].signals[s].value2
                                break;
                            case "notBetween":
                                operator = ' < ' + columns[i].signals[s].value1 + ' || {{item.'+elementName+'}}  > ' + columns[i].signals[s].value2
                                break;
                        }

                        theClass += theComma+ 'customStyle'+s+'_'+i+' : {{item.'+elementName+'}} '+operator;
                    }
                    htmlCode += theStyle +'</style>'

                    if (columns[i].elementType === 'number')
                        theValue = '<span ng-class="{'+theClass+'}"  >{{item.'+elementName+' | number}}</span>';
                        else
                        theValue = '<span ng-class="{'+theClass+'}"  >{{item.'+elementName+'}}</span>';

                }

                var columnStyle = '';
                if (columns[i].columnStyle)
                {
                    columnStyle = 'color:'+columns[i].columnStyle.color+';';

                    for (var key in columns[i].columnStyle) {
                        columnStyle += key+':'+columns[i].columnStyle[key]+';';
                    }
                }

                var rowHeight = 20;
                var cellBorderColor = '#000';
                if (properties)
                    rowHeight = properties.rowHeight;
                    cellBorderColor = properties.cellBorderColor;

                var defaultAligment = '';
                if (columns[i].elementType === 'number')
                    defaultAligment = 'text-align: right;';

                var borderRight = 'border-right: 1px solid '+cellBorderColor+';';
                var borderBottom = 'border-bottom: 1px solid '+cellBorderColor+';';
                var borderLeft = '';
                if (i == 0)
                    borderLeft = 'border-left: 1px solid '+cellBorderColor+';';
                var cellHeight = 'height:'+rowHeight+'px;';
                var cellPadding = 'padding:2px;';
                var theCellStyle = columnStyle+colWidth+defaultAligment+cellHeight+'overflow:hidden;'+cellPadding+borderRight+borderBottom+borderLeft;


                    //page-block ndType="gridDataColumn"
                    htmlCode += '<div class="repeater-data-column '+colClass+' popover-primary" style="'+theCellStyle+'" popover-trigger="mouseenter" popover-placement="top" popover-title="'+columns[i].elementLabel+'" popover="{{item.'+elementName+'}}">'+theValue+' </div>';
            }

            htmlCode += '</div>';
            htmlCode += '</div>';

            htmlCode += '<div class="repeater-data">';
                    for(var i in columns)
                    {
                        var elementName = columns[i].id;
                        if (columns[i].aggregation)
                            elementName = elementName+columns[i].aggregation;

                    }
        htmlCode += '</div>';
        return htmlCode;

    }


this.extendedGridV2 = function(report)
    {
            report = report;
            var id = report.id;
            hashedID = report.query.id;

            var htmlCode =  '<div class="container-fluid repeater-tool-container"><button class="btn btn-white pull-left" ng-click="saveToExcel(\''+hashedID+'\')" style="margin-bottom: 2px;"><i class="fa fa-file-excel-o"></i></button><input class="find-input pull-right" type="search" ng-model="theFilter" placeholder="Table filter..." aria-label="Table filter..." /></div>';

            columns = report.properties.columns;

            if (columns.length > 4)
                colWidth = 'width:'+100/columns.length+'%;float:left;';
            else
                colClass = 'col-xs-'+12/columns.length;

            //header
            htmlCode += '<div class="container-fluid" style="width:100%;padding-left:0px;background-color:#ccc;">';
            for(var i = 0; i < columns.length; i++)
            {
                htmlCode += getHeaderColumn(columns[i],i);
            }
            htmlCode += '</div>';

            //Body
            htmlCode += '<div vs-repeat style="width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;height:85%" >';

            //TODO: orderby  ....   | orderBy:[]    orderBy:'+orderBys+'
            //var orderBys = "'-WSTc33d4a83bea446dab99c7feb0f8fe71a_topPerformerRatingavg'";

            htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid" ng-repeat="item in getQuery(\''+hashedID+'\').data | filter:theFilter | orderBy:getReport(\''+hashedID+'\').predicate:getReport(\''+hashedID+'\').reverse  " style="width:100%;padding:0px">';

            // POPOVER con HTML https://maxalley.wordpress.com/2014/08/19/bootstrap-3-popover-with-html-content/

            for(var i = 0; i < columns.length; i++)
            {
                htmlCode += getDataCell(columns[i],id,i);

            }

            htmlCode += '</div>';



            htmlCode += '<div ng-if="getQuery(\''+hashedID+'\').data.length == 0" >No data found</div>';

            htmlCode += '</div>';

            htmlCode += '<div class="repeater-data">';
                    for(var i in columns)
                    {
                        var elementName = columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName;
                        if (columns[i].aggregation)
                            elementName = columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName+columns[i].aggregation;
                        htmlCode += '<div class=" calculus-data-column '+colClass+' " style="'+colWidth+'"> '+calculateForColumn(report,i,elementName)+' </div>';
                    }
            htmlCode += '</div>';
            return htmlCode;

    }



    function getHeaderColumn(column,columnIndex)
    {
          var htmlCode = '';
            var elementName = "'"+column.id+"'";
                    if (column.aggregation)
                        elementName = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+column.aggregation+"'";
                    var elementNameAux = elementName;
                    if (column.elementType === 'date')
                        elementNameAux = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+'_original'+"'";
                    //htmlCode += '<div class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><span class="hand-cursor" ng-click="orderColumn('+elementNameAux+','+quotedHashedID()+')">'+column.objectLabel+'</span><span class="sortorder" ng-show="getReport(\''+hashedID+'\').predicate === '+elementName+'" ng-class="{reverse:getReport(\''+hashedID+'\').reverse}"></span>'+getColumnDropDownHTMLCode(column,columnIndex,elementName,column.elementType)+' </div>';
        htmlCode += '<div class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><table style="table-layout:fixed;width:100%"><tr><td style="overflow:hidden;white-space: nowrap;width:95%;">'+column.objectLabel+'</td><td style="width:34px;>'+getColumnDropDownHTMLCode(column,columnIndex,elementName,column.elementType)+'</td></tr></table> </div>';

        return htmlCode;
    }


    function getDataCell(column,gridID,columnIndex)
    {
            var htmlCode = '';

                var elementName = column.collectionID.toLowerCase()+'_'+column.elementName;
                var elementID = column.elementID;

                if (column.aggregation)
                    elementName = column.collectionID.toLowerCase()+'_'+column.elementName+column.aggregation;


                var theValue = '<span>{{item.'+elementName+'}}</span>';
                if (column.elementType === 'number')
                     theValue = '<span>{{item.'+elementName+' | number}}</span>';

                if (column.signals)
                {
                    //htmlCode += "<style>.customStyle1_"+i+" {color:#FF9944;} .customStyle2_"+i+" {color:blue;}</style>"
                    var theStyle = '<style>';
                    var theClass = '';
                    console.log('signals',column, column.signals);
                    for (var s in column.signals)
                    {

                        theStyle += ' .customStyle'+s+'_'+columnIndex+'{color:'+column.signals[s].color+';background-color:'+column.signals[s]['background-color']+';font-size:'+column.signals[s]['font-size']+';font-weight:'+column.signals[s]['font-weight']+';font-style:'+column.signals[s]['font-style']+';}';
                        var theComma = '';
                        if (s > 0)
                            theComma = ' , ';

                        var operator = '>'

                        switch(column.signals[s].filter) {
                            case "equal":
                                operator = ' == ' + column.signals[s].value1
                                break;
                            case "diferentThan":
                                operator = ' != '  + column.signals[s].value1
                                break;
                            case "biggerThan":
                                operator = ' > '  + column.signals[s].value1
                                break;
                            case "biggerOrEqualThan":
                                operator = ' >= '  + column.signals[s].value1
                                break;
                            case "lessThan":
                                operator = ' < '  + column.signals[s].value1
                                break;
                            case "lessOrEqualThan":
                                operator = ' <= ' + column.signals[s].value1
                                break;
                            case "between":
                                operator = ' >= ' + column.signals[s].value1 + ' && {{item.'+elementName+'}} <= ' + column.signals[s].value2
                                break;
                            case "notBetween":
                                operator = ' < ' + column.signals[s].value1 + ' || {{item.'+elementName+'}}  > ' + column.signals[s].value2
                                break;
                        }

                        theClass += theComma+ 'customStyle'+s+'_'+columnIndex+' : {{item.'+elementName+'}} '+operator;
                    }
                    htmlCode += theStyle +'</style>'

                    if (column.elementType === 'number')
                        theValue = '<span ng-class="{'+theClass+'}"  >{{item.'+elementName+' | number}}</span>';
                    else
                        theValue = '<span ng-class="{'+theClass+'}"  >{{item.'+elementName+'}}</span>';

                }

                if (column.link)
                {
                    if (column.link.type == 'report')
                    {
                       if (column.elementType === 'number')
                       theValue = '<a class="columnLink" href="/#/reports/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+' | number}}</a>'
                       else
                        theValue = '<a class="columnLink" href="/#/reports/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+'}}</a>'
                    }
                    if (column.link.type == 'dashboard')
                    {
                        if (column.elementType === 'number')
                        theValue = '<a class="columnLink" href="/#/dashboards/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+' | number}}</a>'
                        else
                        theValue = '<a class="columnLink" href="/#/dashboards/'+column.link._id+'/'+column.link.promptElementID+'/{{item.'+elementName+'}}">{{item.'+elementName+'}}</a>'
                    }
                }

                var columnStyle = '';
                if (column.columnStyle)
                {
                    columnStyle = 'color:'+column.columnStyle.color+';';

                    for (var key in column.columnStyle) {
                        columnStyle += key+':'+column.columnStyle[key]+';';
                    }
                }

                var defaultAligment = '';
                if (column.elementType === 'number')
                    defaultAligment = 'text-align: right;'

                    htmlCode += '<div id="ROW_'+gridID+'" class="repeater-data-column '+colClass+' popover-primary" style="'+columnStyle+colWidth+defaultAligment+'height:20px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;" popover-trigger="mouseenter" popover-placement="top" popover-title="'+column.objectLabel+'" popover="{{item.'+elementName+'}}" ng-click="cellClick(\''+hashedID+'\',item,'+'\''+elementID+'\''+','+'\''+elementName+'\''+')">'+theValue+' </div>';

        return htmlCode;

    }


    function calculateForColumn(report,columnIndex,elementName)
    {
        var htmlCode = '';

        if (columns[columnIndex].operationSum === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">SUM:</span><span class="calculus-value"> '+numeral(calculateSumForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        if (columns[columnIndex].operationAvg === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">AVG:</span><span class="calculus-value"> '+numeral(calculateAvgForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        if (columns[columnIndex].operationCount === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">COUNT:</span><span class="calculus-value"> '+numeral(calculateCountForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        if (columns[columnIndex].operationMin === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">MIN:</span><span class="calculus-value"> '+numeral(calculateMinimumForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }
        if (columns[columnIndex].operationMax === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">MAX:</span><span class="calculus-value"> '+numeral(calculateMaximumForColumn(columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        return htmlCode;

    }


    function calculateSumForColumn(columnIndex,elementName)
    {
        var value = 0;

        for (var row in $scope.theData[hashedID])
        {
            var theRow = $scope.theData[hashedID][row];

            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                    value += Number(theRow[elementName]);
        }
        return value;
    }

    function calculateCountForColumn(columnIndex,elementName)
    {
        var founded = 0;
        for (var row in $scope.theData[hashedID])
        {
            var theRow = $scope.theData[hashedID][row];
            console.log('el valor',elementName,JSON.stringify(theRow));
            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                {
                    founded += 1;
                }
        }
        return founded;
    }

    function calculateAvgForColumn(columnIndex,elementName)
    {
        var value = 0;
        var founded = 0;

        for (var row in $scope.theData[hashedID])
        {
            var theRow = $scope.theData[hashedID][row];

            console.log('el valor',elementName,JSON.stringify(theRow));
            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                {
                    founded += 1;
                    value += Number(theRow[elementName]);
                }
        }

        return value/founded;

    }

    function calculateMinimumForColumn(columnIndex,elementName)
    {
        var lastValue = undefined;

        for (var row in $scope.theData[hashedID])
        {
            var theRow = $scope.theData[hashedID][row];

            console.log('el valor',elementName,JSON.stringify(theRow));
            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                {
                    if (lastValue == undefined)
                        lastValue = theRow[elementName];

                    if (theRow[elementName] < lastValue)
                        lastValue = theRow[elementName];
                }
        }
        return lastValue;

    }

    function calculateMaximumForColumn($scope,columnIndex,elementName)
    {
        var lastValue = undefined;

        for (var row in $scope.theData[hashedID])
        {
            var theRow = $scope.theData[hashedID][row];

            console.log('el valor',elementName,JSON.stringify(theRow));
            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                {
                    if (lastValue == undefined)
                        lastValue = theRow[elementName];

                    if (theRow[elementName] > lastValue)
                        lastValue = theRow[elementName];
                }
        }
        return lastValue;
    }


    function getColumnDropDownHTMLCode(column, columnIndex,elementName,columnType)
    {
        if (column.elementType == 'date')
        {
            elementName = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+'_original'+"'";
        }

        var columnPropertiesBtn = '<div class="btn-group pull-right" dropdown="" > '
            +'<button type="button" class="btn btn-blue dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="margin-bottom: 0px;">'
            +' <span class="caret"></span>'
            +'</button>'
            +'<ul class="dropdown-menu dropdown-blue multi-level" role="menu">'
            +'<li class="dropdown-submenu">'
            +'      <a href="">Sort</a>'  //ascendente, descendente
            +'      <ul class="dropdown-menu">'
            +'      <li><a ng-click="reverse = true; orderColumn('+columnIndex+',false,'+quotedHashedID()+')">Ascending</a></li>'
            +'      <li><a ng-click="reverse = false; orderColumn('+columnIndex+',true,'+quotedHashedID()+')">Descending</a></li>'
            +'      </ul>'
            +'</li>'
            /*+'<li>'
            +'      <a href="">Filter</a>'
            +'</li>'*/
            +'<li>'
            +'      <a ng-click="changeColumnStyle('+columnIndex+','+quotedHashedID()+')">Format</a>'
            +'</li>'
            /*+'<li>'
            +'      <a href="">Create Section</a>'
            +'</li>'
            +'<li>'
            +'      <a href="">Apply Break</a>'
            +'</li>'*/
            +'<li class="divider"></li>'
            +'<li class="dropdown-submenu">'
            +'      <a tabindex="-1" href="">Calculate</a>' //suma, cuenta, cuenta total, Promedio, mínimo, máximo, porcentaje
            +'      <ul class="dropdown-menu">';



        var sumIcon = '';
        if (column.operationSum == true)
            sumIcon = '<i class="fa fa-check"></i>';
        var avgIcon = '';
        if (column.operationAvg == true)
            avgIcon = '<i class="fa fa-check"></i>';
        var countIcon = '';
        if (column.operationCount == true)
            countIcon = '<i class="fa fa-check"></i>';
        var minIcon = '';
        if (column.operationMin == true)
            minIcon = '<i class="fa fa-check"></i>';
        var maxIcon = '';
        if (column.operationMax == true)
            maxIcon = '<i class="fa fa-check"></i>';

        columnPropertiesBtn += '      <li><a ng-click="columnCalculation(2,'+columnIndex+','+quotedHashedID()+')">'+countIcon+'Count</a></li>';

        if (columnType === 'number')
        {
            columnPropertiesBtn += '      <li> <a  ng-click="columnCalculation(1,'+columnIndex+','+quotedHashedID()+')">'+sumIcon+' Sum</a></li>';
            columnPropertiesBtn += '      <li><a ng-click="columnCalculation(3,'+columnIndex+','+quotedHashedID()+')">'+avgIcon+'Average</a></li>';
            columnPropertiesBtn += '      <li><a ng-click="columnCalculation(4,'+columnIndex+','+quotedHashedID()+')">'+minIcon+'Minimum</a></li>';
            columnPropertiesBtn += '      <li><a ng-click="columnCalculation(5,'+columnIndex+','+quotedHashedID()+')">'+maxIcon+'Maximum</a></li>';
            columnPropertiesBtn += '      <li><a href="#">Percent</a></li>';
        }

        columnPropertiesBtn +=
            '      </ul>'
            +'</li>'
            +'<li>'
            +'      <a ng-click="changeColumnSignals('+columnIndex+','+quotedHashedID()+')">Conditional format</a>'
            +'</li>'
            /*+'<li>'
            +'      <a href="">Hide components</a>'
            +'</li>'*/
            +'</ul>'
            +'</div>';

        return  columnPropertiesBtn;
    }

    this.changeBackgroundColor = function()
    {


    }

    this.savePropertyForGridColumn = function(grids,property,columnID,value)
    {
       // HEADERCOL_'+columns[i].id+'['+i+']"

       for (var g in grids)
           {
               for (var c in gridColumns)
               {
                    grids[g].gridColumns[c].header[property] = value;
               }
           }
    }


});

app.directive('gridProperties',['$compile','colors','grid', function($compile,colors,grid) {
return {
    transclude: true,
    scope: {
        gridID: '@',
        onChange: '=',
        grid: '='
    },

   templateUrl: "partials/widgets/gridProperties.html",
    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
    $scope.colors = colors.colors;



        switch (attrs['type']) {
            case "text":
                // append input field to "template"
            case "select":
                // append select dropdown to "template"
        }


      $scope.getPrompt = function(elementID)
        {
        for (var p in $scope.prompts)
            {
            if ($scope.prompts[p].elementID == elementID)
                return $scope.prompts[p];
            }
        }

      $scope.promptChanged = function(elementId) {
	        $scope.onChange(elementId,$scope.selectedValue);
        };

      $scope.changeHeaderBackgroundColor = function(color) {
        $scope.grid.headerBackgroundColor = color;
        $('#HEADER_'+$scope.grid.id).css({'background-color': color});
      }

      $scope.changeRowHeight = function(newHeight)
      {
        //$('#ROW_'+$scope.grid.id).css({'height': newHeight});
          console.log('applied');

          $scope.grid.properties.rowHeight = newHeight;

          grid.refresh($scope.grid.dataColumns,$scope.grid.id,$scope.grid.queryReference,true,$scope.grid.properties);
      }

      $scope.changeCellBorderColor = function(newColor)
      {
          $scope.grid.properties.cellBorderColor = newColor;
          grid.refresh($scope.grid.dataColumns,$scope.grid.id,$scope.grid.queryReference,true,$scope.grid.properties);
      }
    }
  }



}]);
