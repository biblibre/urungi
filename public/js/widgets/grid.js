
app.service('grid' , function () {

this.repaintRepeater = function (columns,id,queryScopeReference,done)
    {
            var hashedID = id; //query.hashedID;



            var htmlCode = '<div class="container-fluid repeater-tool-container"></div>';

            var colClass = '';
            var colWidth = '';

            if (columns.length == 5 || columns.length > 6)
                colWidth = 'width:'+100/columns.length+'%;float:left;';
            else
                colClass = 'col-xs-'+12/columns.length;

            //header
            htmlCode += '<div class="container-fluid" style="width:100%;padding-left:0px;background-color:#ccc">';
            for(var i = 0; i < columns.length; i++)
            {

                    var elementName = "'"+columns[i].id+"'";
                    var elementNameAux = elementName;
                    if (columns[i].elementType === 'date')
                        elementNameAux = "'"+columns[i].id+'_original'+"'";


               htmlCode += '<div class="'+colClass+' report-repeater-column-header" style="'+colWidth+'"><span class="hand-cursor" ng-click="orderColumn('+elementNameAux+','+hashedID+')">'+columns[i].elementLabel+'</span><span class="sortorder" ng-show="'+queryScopeReference+'.predicate === '+elementName+'" ng-class="{reverse:'+queryScopeReference+'.reverse}"></span> </div>';

            }
            htmlCode += '</div>';

            //Body
            htmlCode += '<div vs-repeat style="width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;height: 100%;height: -webkit-calc(100% - 30px);height: -moz-calc(100% - 30px);height: calc(100% - 30px)">';

                //TODO: orderby  ....   | orderBy:[]    orderBy:'+orderBys+'
            //var orderBys = "'-WSTc33d4a83bea446dab99c7feb0f8fe71a_topPerformerRatingavg'";

            htmlCode += '<div class="repeater-data container-fluid" ng-repeat="item in '+queryScopeReference+' | filter:theFilter | orderBy:'+queryScopeReference+'.predicate:'+queryScopeReference+'.reverse  " style="width:100%;padding:0px">';

            // POPOVER con HTML https://maxalley.wordpress.com/2014/08/19/bootstrap-3-popover-with-html-content/

            for(var i = 0; i < columns.length; i++)
            {
                var elementName = columns[i].id;


                var theValue = '<span>{{item.'+elementName+'}}</span>';

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

                    htmlCode += '<div class="repeater-data-column '+colClass+' popover-primary" style="'+columnStyle+colWidth+defaultAligment+'height:20px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;" popover-trigger="mouseenter" popover-placement="top" popover-title="'+columns[i].objectLabel+'" popover="{{item.'+elementName+'}}">'+theValue+' </div>';
            }

            htmlCode += '</div>';
            htmlCode += '</div>';

            htmlCode += '<div class="repeater-data">';
                    for(var i in columns)
                    {
                        var elementName = columns[i].id;
                        //var elementName = columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName;
                        //if (columns[i].aggregation)
                        //    elementName = columns[i].collectionID.toLowerCase()+'_'+columns[i].elementName+columns[i].aggregation;
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

});