
app.service('grid' , function () {

this.simpleGrid = function(columns,id,query,designerMode,done)
    {
            var hashedID = query.id;


            var htmlCode = '<div class="container-fluid repeater-tool-container"></div>';

            var colClass = '';
            var colWidth = '';

            if (columns.length == 5 || columns.length > 6)
                colWidth = 'width:'+100/columns.length+'%;float:left;';
            else
                colClass = 'col-xs-'+12/columns.length;

            //header
            htmlCode += '<div page-block ndType="gridHeader" class="container-fluid" style="width:100%;padding:2px;background-color:#ccc;">';
            for(var i = 0; i < columns.length; i++)
            {
                    var elementName = "'"+columns[i].id+"'";
                    if (columns[i].aggregation)
                        elementName = "'"+elementName+columns[i].aggregation+"'";

                    var elementNameAux = elementName;
                    if (columns[i].elementType === 'date')
                        elementNameAux = "'"+columns[i].id+'_original'+"'"; //"'"+columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName+'_original'+"'";


                    htmlCode += '<div page-block ndType="gridHeaderColumn" class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><span class="hand-cursor" >'+columns[i].elementLabel+'</span> </div>';

            }

            htmlCode += '</div>';


            //Body
            htmlCode += '<div vs-repeat style="max-height:500px;width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;">';

                //TODO: orderby  ....   | orderBy:[]    orderBy:'+orderBys+'
            //var orderBys = "'-WSTc33d4a83bea446dab99c7feb0f8fe71a_topPerformerRatingavg'";

            htmlCode += '<div class="repeater-data container-fluid" ng-repeat="item in getQuery(\''+hashedID+'\').data" style="width:100%;padding:0px">';

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

                var defaultAligment = '';
                if (columns[i].elementType === 'number')
                    defaultAligment = 'text-align: right;'

                    htmlCode += '<div page-block ndType="gridDataColumn" class="repeater-data-column '+colClass+' popover-primary" style="'+columnStyle+colWidth+defaultAligment+'height:20px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;" popover-trigger="mouseenter" popover-placement="top" popover-title="'+columns[i].objectLabel+'" popover="{{item.'+elementName+'}}">'+theValue+' </div>';
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



function repaintRepeater($scope,id,report,done)
    {
            var hashedID = report.hashedID;
            var htmlCode = '<div class="container-fluid repeater-tool-container"><button class="btn btn-white pull-left" ng-click="saveToExcel(\''+hashedID+'\')" style="margin-bottom: 2px;"><i class="fa fa-file-excel-o"></i></button><input class="find-input pull-right" type="search" ng-model="theFilter" placeholder="Table filter..." aria-label="Table filter..." /></div>';

            var colClass = '';
            var colWidth = '';

            if (report.properties.columns.length == 5 || report.properties.columns.length > 6)
                colWidth = 'width:'+100/report.properties.columns.length+'%;float:left;';
            else
                colClass = 'col-xs-'+12/report.properties.columns.length;

            //header
            htmlCode += '<div class="container-fluid" style="width:100%;padding-left:0px;background-color:#ccc;">';
            for(var i = 0; i < report.properties.columns.length; i++)
            {
                getHeaderColumn(report.properties.columns[i]);
            }
            htmlCode += '</div>';

            //Body
            htmlCode += '<div vs-repeat style="width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;">';

             //TODO: orderby  ....   | orderBy:[]    orderBy:'+orderBys+'
            //var orderBys = "'-WSTc33d4a83bea446dab99c7feb0f8fe71a_topPerformerRatingavg'";

            htmlCode += '<div class="repeater-data container-fluid" ng-repeat="item in theData[\''+hashedID+'\'] | filter:theFilter | orderBy:reports[\''+hashedID+'\'].predicate:reports[\''+hashedID+'\'].reverse  " style="width:100%;padding:0px">';

            //console.log(htmlCode);
            // POPOVER con HTML https://maxalley.wordpress.com/2014/08/19/bootstrap-3-popover-with-html-content/

            for(var i = 0; i < report.properties.columns.length; i++)
            {
                htmlCode += getDataCell(report.properties.columns[i]);

            }

            htmlCode += '</div>';
            htmlCode += '</div>';

            htmlCode += '<div class="repeater-data">';
                    for(var i in report.properties.columns)
                    {
                        var elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName;
                        if (report.properties.columns[i].aggregation)
                            elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName+report.properties.columns[i].aggregation;
                        htmlCode += '<div class=" calculus-data-column '+colClass+' " style="'+colWidth+'"> '+calculateForColumn($scope,report,i,elementName)+' </div>';
                    }
            htmlCode += '</div>';

            var el = document.getElementById(id);

            if (!el)
                el = document.getElementById('XXXXXXXXXX');  //this is for the report designer...


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


    function getHeaderColumn(column)
    {
          var htmlCode = '';
            var elementName = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+"'";
                    if (column.aggregation)
                        elementName = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+column.aggregation+"'";
                    var elementNameAux = elementName;
                    if (column.elementType === 'date')
                        elementNameAux = "'"+column.collectionID.toLowerCase()+'_'+column.elementName+'_original'+"'";
                    htmlCode += '<div class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><span class="hand-cursor" ng-click="orderColumn('+elementNameAux+',\''+hashedID+'\')">'+column.objectLabel+'</span><span class="sortorder" ng-show="reports[\''+hashedID+'\'].predicate === '+elementName+'" ng-class="{reverse:reports[\''+hashedID+'\'].reverse}"></span>'+getColumnDropDownHTMLCode(report,column,i,elementName,hashedID,column.elementType)+' </div>';
          return htmlCode;

    }


    function getDataCell(column)
    {
            var htmlCode = '';

                var elementName = column.collectionID.toLowerCase()+'_'+column.elementName;
                var elementID = column.elementID;

                if (column.aggregation)
                    elementName = column.collectionID.toLowerCase()+'_'+column.elementName+column.aggregation;


                var theValue = '<span>{{item.'+elementName+'}}</span>';
                if (report.properties.columns[i].elementType === 'number')
                     theValue = '<span>{{item.'+elementName+' | number}}</span>';

                if (column.signals)
                {
                    //htmlCode += "<style>.customStyle1_"+i+" {color:#FF9944;} .customStyle2_"+i+" {color:blue;}</style>"
                    var theStyle = '<style>';
                    var theClass = '';
                    for (var s in column.signals)
                    {
                        theStyle += ' .customStyle'+s+'_'+i+'{color:'+column.signals[s].color+';background-color:'+column.signals[s]['background-color']+';font-size:'+column.signals[s]['font-size']+';font-weight:'+column.signals[s]['font-weight']+';font-style:'+column.signals[s]['font-style']+';}';
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

                        theClass += theComma+ 'customStyle'+s+'_'+i+' : {{item.'+elementName+'}} '+operator;
                    }
                    htmlCode += theStyle +'</style>'

                    if (report.properties.columns[i].elementType === 'number')
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

                    htmlCode += '<div class="repeater-data-column '+colClass+' popover-primary" style="'+columnStyle+colWidth+defaultAligment+'height:20px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;" popover-trigger="mouseenter" popover-placement="top" popover-title="'+column.objectLabel+'" popover="{{item.'+elementName+'}}" ng-click="cellClick(\''+hashedID+'\',item,'+'\''+elementID+'\''+','+'\''+elementName+'\''+')">'+theValue+' </div>';

        return htmlCode;

    }


    function calculateForColumn($scope,report,columnIndex,elementName)
    {

        var htmlCode = '';


        if (report.properties.columns[columnIndex].operationSum === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">SUM:</span><span class="calculus-value"> '+numeral(calculateSumForColumn($scope,report,columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        if (report.properties.columns[columnIndex].operationAvg === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">AVG:</span><span class="calculus-value"> '+numeral(calculateAvgForColumn($scope,report,columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        if (report.properties.columns[columnIndex].operationCount === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">COUNT:</span><span class="calculus-value"> '+numeral(calculateCountForColumn($scope,report,columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        if (report.properties.columns[columnIndex].operationMin === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">MIN:</span><span class="calculus-value"> '+numeral(calculateMinimumForColumn($scope,report,columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }
        if (report.properties.columns[columnIndex].operationMax === true)
        {
            htmlCode += '<div  style=""><span class="calculus-label">MAX:</span><span class="calculus-value"> '+numeral(calculateMaximumForColumn($scope,report,columnIndex,elementName)).format('0,0.00')+'</span> </div>';
        }

        return htmlCode;

    }


    function calculateSumForColumn($scope,report,columnIndex,elementName)
    {
        var value = 0;

        for (var row in $scope.theData[report.hashedID])
        {
            var theRow = $scope.theData[report.hashedID][row];

            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                    value += Number(theRow[elementName]);
        }

        return value;
    }

    function calculateCountForColumn($scope,report,columnIndex,elementName)
    {
        var founded = 0;

        for (var row in $scope.theData[report.hashedID])
        {
            var theRow = $scope.theData[report.hashedID][row];

            console.log('el valor',elementName,JSON.stringify(theRow));
            if (theRow[elementName])
                if (theRow[elementName] != undefined)
                {
                    founded += 1;
                }
        }
        return founded;
    }

    function calculateAvgForColumn($scope,report,columnIndex,elementName)
    {
        var value = 0;
        var founded = 0;

        for (var row in $scope.theData[report.hashedID])
        {
            var theRow = $scope.theData[report.hashedID][row];

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

    function calculateMinimumForColumn($scope,report,columnIndex,elementName)
    {
        var lastValue = undefined;

        for (var row in $scope.theData[report.hashedID])
        {
            var theRow = $scope.theData[report.hashedID][row];

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

    function calculateMaximumForColumn($scope,report,columnIndex,elementName)
    {
        var lastValue = undefined;

        for (var row in $scope.theData[report.hashedID])
        {
            var theRow = $scope.theData[report.hashedID][row];

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


    function getColumnDropDownHTMLCode(report,columnObject, column,elementName,hashedID,columnType)
    {
        if (columnObject.elementType == 'date')
        {
            elementName = "'"+columnObject.collectionID.toLowerCase()+'_'+columnObject.elementName+'_original'+"'";
        }

        var columnPropertiesBtn = '<div class="btn-group pull-right" dropdown="" > '
            +'<button type="button" class="btn btn-blue dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="margin-bottom: 0px;">'
            +' <span class="caret"></span>'
            +'</button>'
            +'<ul class="dropdown-menu dropdown-blue multi-level" role="menu">'
            +'<li class="dropdown-submenu">'
            +'      <a href="">Sort</a>'  //ascendente, descendente
            +'      <ul class="dropdown-menu">'
            +'      <li><a ng-click="reverse = true; orderColumn('+elementName+','+hashedID+')">Ascending</a></li>'
            +'      <li><a ng-click="reverse = false; orderColumn('+elementName+','+hashedID+')">Descending</a></li>'
            +'      </ul>'
            +'</li>'
            /*+'<li>'
            +'      <a href="">Filter</a>'
            +'</li>'*/
            +'<li>'
            +'      <a ng-click="changeColumnStyle('+column+','+hashedID+')">Format</a>'
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
        if (report.properties.columns[column].operationSum == true)
            sumIcon = '<i class="fa fa-check"></i>';
        var avgIcon = '';
        if (report.properties.columns[column].operationAvg == true)
            avgIcon = '<i class="fa fa-check"></i>';
        var countIcon = '';
        if (report.properties.columns[column].operationCount == true)
            countIcon = '<i class="fa fa-check"></i>';
        var minIcon = '';
        if (report.properties.columns[column].operationMin == true)
            minIcon = '<i class="fa fa-check"></i>';
        var maxIcon = '';
        if (report.properties.columns[column].operationMax == true)
            maxIcon = '<i class="fa fa-check"></i>';

        columnPropertiesBtn += '      <li><a ng-click="columnCalculation(2,'+column+','+hashedID+')">'+countIcon+'Count</a></li>';

        if (columnType === 'number')
        {
            columnPropertiesBtn += '      <li> <a  ng-click="columnCalculation(1,'+column+','+hashedID+')">'+sumIcon+' Sum</a></li>';
            columnPropertiesBtn += '      <li><a ng-click="columnCalculation(3,'+column+','+hashedID+')">'+avgIcon+'Average</a></li>';
            columnPropertiesBtn += '      <li><a ng-click="columnCalculation(4,'+column+','+hashedID+')">'+minIcon+'Minimum</a></li>';
            columnPropertiesBtn += '      <li><a ng-click="columnCalculation(5,'+column+','+hashedID+')">'+maxIcon+'Maximum</a></li>';
            columnPropertiesBtn += '      <li><a href="#">Percent</a></li>';
        }

        columnPropertiesBtn +=
            '      </ul>'
            +'</li>'
            +'<li>'
            +'      <a ng-click="changeColumnSignals('+column+','+hashedID+')">Conditional format</a>'
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

});

app.directive('gridProperties',['$compile','colors', function($compile,colors) {
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


    }
  }



}]);