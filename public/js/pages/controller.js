app.controller('pagesCtrl', function ($scope, queryService, connection, $routeParams, queryModel, grid, c3Charts) {
    $scope.reportModal = 'partials/pages/queryEdit.html';
    $scope.chartModal = 'partials/pages/chartModal.html';
    $scope.queries = [];
    $scope.charts = [];
    $scope.elements = {};
    $scope.elements.repeaters = [];
    $scope.pageID = $routeParams.pageID;
    $scope.lastChartID = 0;
    $scope.lastElementID = 0;
    $scope.dataPool = [];


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

    $scope.newQuery = function() {
        $scope.queryInterface = true;
    }

    $scope.initForm = function() {
        $scope.dataMode = 'preview';
        if ($routeParams.newPage == 'true') {
            $scope.pageDefinitition = {pageName:"New PAGE", backgroundColor:"#999999" ,items:[],properties:{},pageType:'DEFAULT'};
            $scope.mode = 'add';
        } else {
            if ($scope.pageID)
            {
                connection.get('/api/pages/get/'+$scope.pageID, {id: $scope.pageID}, function(data) {
                    $scope.pageDefinitition = data.item;
                    //console.log('the page definition',  JSON.stringify($scope.pageDefinitition));

                    $scope.queries = $scope.pageDefinitition.properties.queries;
                    $scope.charts = $scope.pageDefinitition.properties.charts;

                    $scope.lastChartID = $scope.charts.length;
                    $scope.lastElementID = $scope.charts.length;
                    //console.log('The queries: ',JSON.stringify($scope.queries));
                    //getDataForQueries();

                    getQueryData($scope,0,function(){
                        //console.log('First query data ... ',JSON.stringify($scope.queries[0].data));
                        //console.log('Second query data ... ',JSON.stringify($scope.queries[1].data));
                        console.log('before rebuild charts');
                        rebuildCharts();
                    });

                    getAllPageColumns();

                    var $div = $($scope.pageDefinitition.properties.designerHTML);
                    var el = angular.element(document.getElementById('designArea'));
                    el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

                    cleanAllSelected();
                });
            }
        }
    };

    $scope.loadHTML = function() {
        connection.get('/api/pages/get/'+$scope.pageID, {id: $scope.pageID}, function(data) {
                    $scope.pageDefinitition = data.item;
                    $scope.queries = $scope.pageDefinitition.properties.queries;
                    $scope.charts = $scope.pageDefinitition.properties.charts;
                    getQueryData($scope,0,function(){
                        rebuildCharts();
                    });

                    getAllPageColumns();

                    var $div = $($scope.pageDefinitition.html);
                    var el = angular.element(document.getElementById('pageViewer'));
                    el.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });
    });
    }

    $scope.getPages = function(params) {
        var params = (params) ? params : {};

        connection.get('/api/pages/find-all', params, function(data) {
            $scope.pages = data;
        });
    };

    $scope.cancelQuery = function() {
        $scope.queryInterface = false;
    }

    $scope.saveQuery2 = function()
    {
        console.log('saving query...')
        var qstructure = queryService.getQuery();
        qstructure.name = 'query'+($scope.queries.length +1);
        $scope.queries.push(qstructure);
        $scope.queryInterface = false;
        getAllPageColumns();
    }

    $scope.loadQS = function(query)
    {
        console.log('loading existing query: '+query.name)
        $scope.queryInterface = true;
        $scope.$broadcast("loadQueryStructure", {query: query});
    }


    $scope.onDrop = function (data, event, type, group) {
        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        console.log('on drop entered...',customObjectData);

        if (customObjectData.objectType == 'jumbotron') {
            console.log('jumbotron added');
            var html = getJumbotronHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == '3colscta') {
            console.log('3colscta added');
            var html = get3colsctaHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'imageTextLarge') {
            console.log('imageTextLarge added');
            var html = getImageTextLargeHTML();
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'chart') {
            console.log('chart added');
            var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getChartHTML()+'</div>';
            createOnDesignArea(html,function(){});
        }

        if (customObjectData.objectType == 'tabs') {
            console.log('tabs added');
            var html = getTabsHTML();
            createOnDesignArea(html,function(){});
        }

        //
        if (customObjectData.objectType == 'image')
        {
           angular.element(event.target).css("background-image","url('"+ $(src).attr("data-id") +"')");
        }



        if (customObjectData.objectType == 'queryColumn') {
           console.log('repeater grid added');
            $scope.lastElementID = $scope.lastElementID + 1;
            var repeater = {id:'repeater'+$scope.lastElementID,dataColumns:[],query:undefined}
            $scope.elements.repeaters.push(repeater);

            var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getRepeaterHTML(repeater.id)+'</div>'
            createOnDesignArea(html,function(){
            $scope.onDropOnRepeater(data, event, repeater.id);
            });

        }

        if (customObjectData.objectType == 'repeaterGrid') {
            console.log('repeater grid added');
            $scope.lastElementID = $scope.lastElementID + 1;
            var repeater = {id:'repeater'+$scope.lastElementID,dataColumns:[],query:undefined}
            $scope.elements.repeaters.push(repeater);

            var html = '<div page-block class="container-fluid ndContainer" ndType="container" >'+getRepeaterHTML(repeater.id)+'</div>';
            createOnDesignArea(html,function(){});
        }

    };

    $scope.onDropOverContainer = function()
    {
            if (customObjectData.objectType == 'image')
                {
                    var dropID = $(src).attr("data-id");
                    var destType = $(dest).attr("ndType");
                    console.log('source is an image and destiny is ' +destType);

                    if (destType == 'ndContainer')
                    {
                        var destiny =  $(dest)[0];
                        var theElement = $($(dest).children()[0]);
                        theElement.css("background-image","url('"+ $(src).attr("data-id") +"')");

                    } else {
                        if (destType == 'homeFull')
                        {
                            console.log('destiny is a homeFull '+ $(src).attr("data-id"));
                            dest.style.backgroundImage = "url('"+ $(src).attr("data-id") +"')";

                        } else {
                            if (destType == 'image')
                            {
                                console.log('destiny is a image '+ $(src).attr("data-id"));
                                theTemplate = $compile($(dest).attr("src", $(src).attr("data-id")))(scope);

                            } else {
                                if (destType == 'carousell')
                                {
                                     console.log('voy al carousell ....bien!!')
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
        console.log('on drop entered...',customObjectData);
        if (customObjectData.objectType == 'chart') {
            console.log('chart added');
            var html = getChartHTML();
        }

        if (customObjectData.objectType == 'repeaterGrid') {
            console.log('repeater grid added');
            $scope.lastElementID = $scope.lastElementID + 1;
            var repeater = {id:'repeater'+$scope.lastElementID,dataColumns:[],query:undefined}
            $scope.elements.repeaters.push(repeater);

            var html = getRepeaterHTML(repeater.id);
        }




        var $div = $(html);
        var el = angular.element(event.target);
        el.append($div);
        angular.element(document).injector().invoke(function($compile) {
            var scope = angular.element($div).scope();
            $compile($div)(scope);
        });

    };

    $scope.onDropQueryElement = function (data, event, chartCode) {
        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        console.log('on drop entered...',customObjectData);

        if (customObjectData.objectType == 'queryColumn') {
            console.log('query column added',chartCode);
                for (var i in $scope.charts)
                {
                    if ($scope.charts[i].charID == chartCode)
                        {

                        if (!$scope.charts[i].dataColumns)
                            {
                                $scope.charts[i].dataColumns = [];
                                $scope.charts[i].query = customObjectData.queryName;

                                for (var q in $scope.queries)
                                    {
                                    if ($scope.queries[q].name == customObjectData.queryName)
                                        {
                                        $scope.charts[i].data = $scope.queries[q].data;
                                        }
                                    }

                            }

                            if ($scope.charts[i].query == customObjectData.queryName)
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
                                                                        color:'#000000'};

                                    data hay que meterlo en el chart para que quede claro de donde recibe los datos



                                    c3Charts.rebuildChart($scope.charts[i]);


                            } else {

                                //TODO: Show message this element is not allowed here
                            }

                        }
                }

        }
    };

    $scope.onDropOnRepeater = function (data, event, repeaterCode) {
        event.stopPropagation();
        var customObjectData = data['json/custom-object'];

        if (customObjectData.objectType == 'queryColumn') {

                for (var i in $scope.elements.repeaters)
                {
                    if ($scope.elements.repeaters[i].id == repeaterCode)
                        {

                        if ($scope.elements.repeaters[i].query == undefined)
                            $scope.elements.repeaters[i].query = customObjectData.queryName;

                            for (var q in $scope.queries)
                            {
                                if ($scope.queries[q].name == customObjectData.queryName)
                                    var queryScopeReference = 'queries['+q+'].data';
                            }

                                if ($scope.elements.repeaters[i].query == customObjectData.queryName)
                                {

                                        $scope.elements.repeaters[i].dataColumns.push({elementName:customObjectData.elementName,
                                                            queryName:customObjectData.queryName,
                                                            elementLabel:customObjectData.objectLabel,
                                                            id:customObjectData.name,
                                                            type:'line',
                                                            color:'#000000'});



                                        repeaterModel.repaintRepeater($scope.elements.repeaters[i].dataColumns,repeaterCode,queryScopeReference,function(){


                                        });

                                }
                        }
                }

        }

    }
/*
   function rebuildChart(chartCode, chart)
    {
        var theValues = [];
        var theNames = {};

        //console.log('axisfield',chart.dataAxis.id)

        var axisField = '';
        if (chart.dataAxis)
            axisField = chart.dataAxis.id;

            console.log('axisfield',axisField);

        for (var i in chart.dataColumns)
        {
            if (chart.dataColumns[i].id != undefined)
            {
                theValues.push(chart.dataColumns[i].id);
                var valueName = chart.dataColumns[i].id;

                theNames[valueName] = chart.dataColumns[i].elementLabel;
            }
        }

        console.log('the values', chartCode ,theValues);

        if (!chart.height)
            chart.height = 300;

        var theChartCode = '#'+chartCode;
        var chartCanvas = c3.generate({
            bindto: theChartCode,
            data: {
                json: $scope.queries[0].data,
                keys: {
                    x: axisField,
                    value: theValues
                },
                names: theNames
            },
            axis: {
                x: {
                    type: 'category'
                }
            },
             size: {
                height:chart.height
             }
        });

        chart.chartCanvas = chartCanvas;

    }
*/



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
           console.log('changig margin',newMargin)
            if (newMargin == '')
                        $scope.selectedElement.css("margin","");
                        else
                        $scope.selectedElement.css("margin",newMargin);
    }

    $scope.changeCSS = function(cssProperty,value)
    {
                console.log('changing', cssProperty,value)
                if (cssProperty == '')
                        $scope.selectedElement.css(cssProperty,"");
                        else
                        $scope.selectedElement.css(cssProperty,value);
    }


    $scope.getElementProperties = function(theElement)
    {
        //console.log('the element',theElement);
        $scope.tabs.selected = 'settings';
        $scope.selectedElementType = '';
        //scope.selectedBackgroundColor = scope.selectedElement.css('background-color');

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

        console.log('The height',$scope.selectedElement.css('height'));

        $scope.selectedElement = theElement;

        var elementType = theElement.attr('ndType');

        console.log('the element type',elementType);

        $scope.selectedElementType = elementType;

        if (elementType === 'c3Chart')
        {

            var chartID = theElement.attr('bindto-id');
            //console.log('editing chart:',chartID);
            for (var i in $scope.charts)
            {
                if ($scope.charts[i].charID == chartID)
                    {
                        $scope.selectedChart = $scope.charts[i];
                        $scope.objectHeight = $scope.selectedChart.height;
                        console.log('aqui');
                    }
            }
        }

        if (elementType == 'repeaterGrid')
        {

        }

        $scope.$apply();
    }

    $scope.deleteChartColumn = function(column)
    {
        c3Charts.deleteChartColumn($scope.selectedChart,column)
    }

 /*   $scope.deleteChartColumn = function(column)
    {
        var index = $scope.selectedChart.dataColumns.indexOf(column);
        if (index > -1) {

            $scope.selectedChart.dataColumns.splice(index, 1);

            rebuildChart($scope.selectedChart.charID, $scope.selectedChart)

        }
    }*/

    $scope.changeBackgroundColor = function(color)
    {
        $scope.selectedElement.css({ 'background-color': color }) ;
        $scope.BackgroundColor = color;
    }

    $scope.changeFontColor = function(color)
    {
        $scope.selectedElement.css({ 'color': color }) ;
        $scope.FontColor = color;
    }

    $scope.changeChartColumnType = function(column)
    {
        c3Charts.changeChartColumnType($scope.selectedChart,column)
    }


  /*  $scope.changeChartColumnType = function(column)
    {
        //if (column == '')
        //var index = $scope.selectedChart.dataColumns.indexOf(column);
        //spline, bar , line, area, area-spline, scatter , pie, donut
        console.log('column Type',column.type);

        if (column.type == 'line')
        {
            column.type = 'spline';
            $scope.selectedChart.chartCanvas.transform('spline', column.id);
        } else
            if (column.type == 'spline')
            {
                column.type = 'bar';
                $scope.selectedChart.chartCanvas.transform('bar', column.id);
            } else
                if (column.type == 'bar')
                {
                    column.type = 'area';
                    $scope.selectedChart.chartCanvas.transform('area', column.id);
                } else
                    if (column.type == 'area')
                    {
                        column.type = 'area-spline';
                        $scope.selectedChart.chartCanvas.transform('area-spline', column.id);
                    } else
                        if (column.type == 'area-spline')
                        {
                            column.type = 'scatter';
                            $scope.selectedChart.chartCanvas.transform('scatter', column.id);
                        } else
                            if (column.type == 'scatter')
                            {
                                column.type = 'pie';
                                $scope.selectedChart.chartCanvas.transform('pie', column.id);
                            } else
                            if (column.type == 'pie')
                            {
                                column.type = 'donut';
                                $scope.selectedChart.chartCanvas.transform('donut', column.id);
                            } else
                            if (column.type == 'donut')
                            {
                                column.type = 'line';
                                $scope.selectedChart.chartCanvas.transform('line', column.id);
                            }

    }
*/
    $scope.deleteSelected = function() {
        $scope.selectedElement.remove();
    }

    $scope.overChartDragging = function ()
    {
        console.log('dragging');
    }

    $scope.savePage = function()
    {
        savePage();
    }

    function getJumbotronHTML()
    {

                return '<div page-block class="jumbotron" ndType="jumbotron">'+
                        '<h1 page-block  class="editable" ndType="header" contenteditable="false">  A header text H1 ddd </h1>'+
                        '<p page-block  class="editable" contenteditable="false" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                        '<a page-block  class="editable btn btn-default" ndType="button"  role="button">My button</a>'+
                        '</div>';
    }

    function get3colsctaHTML()
    {
                return '<div page-block class="container-fluid ndContainer" ndType="container" on-select="selected(selectedEl)">'+
                    '<div  page-block class="col-md-4 ndContainer" ndtype="column" on-select="selected(selectedEl)">'+
                    '<h3  page-block class="editable" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H3 </h3>'+
                    '<p page-block class="editable" x-element-draggable="false" x-element-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                    '<a page-block class="editable btn btn-default" x-element-draggable="true" x-element-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button">My button</a>'+
                    '</div>'+
                    '<div class="col-md-4 ndContainer" x-element-draggable="false" x-element-drop-target="true" ndtype="column" x-on-select="selected(selectedEl)">'+
                    '<h3  class="editable" x-element-draggable="true" x-element-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H3 </h3>'+
                    '<p class="editable" x-element-draggable="false" x-element-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                    '<a class="editable btn btn-default" x-element-draggable="true" x-element-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button">My button</a>'+
                    '</div>'+
                    '<div class="col-md-4 ndContainer" x-element-draggable="false" x-element-drop-target="true" ndtype="column" x-on-select="selected(selectedEl)">'+
                    '<h3  class="editable" x-element-draggable="true" x-element-drop-target="true" x-on-select="selected(selectedEl)" ndType="header" contenteditable="false">  A header text H3 </h3>'+
                    '<p class="editable" x-element-draggable="false" x-element-drop-target="true" contenteditable="false" x-on-select="selected(selectedEl)" ndType="paragraph">This is a simple text paragraph select to edit content.</p>'+
                    '<a class="editable btn btn-default" x-element-draggable="true" x-element-drop-target="true" x-on-select="selected(selectedEl)" ndType="button"  role="button">My button</a>'+
                    '</div>'+
                    '</div>';

    }

    function getImageTextLargeHTML()
    {
        return  '<div page-block class="container-fluid featurette ndContainer"  ndType="container" >'+
                '<div page-block class="col-md-7 col-md-push-5 ndContainer" ndtype="column"  ndType="col" >'+
                '<h2 page-block class="editable featurette-heading"  ndType="header" contenteditable="false">Oh yeah, it is that good. <span class="text-muted">See for yourself.</span></h2>'+
                '<p page-block class="editable lead" contenteditable="false" ndType="paragraph">Donec ullamcorper nulla non metus auctor fringilla. Vestibulum id ligula porta felis euismod semper. Praesent commodo cursus magna, vel scelerisque nisl consectetur. Fusce dapibus, tellus ac cursus commodo.</p>'+
                '</div>'+
                '<div page-block class="col-md-5 col-md-pull-7 ndContainer" ndtype="column">'+
                //'<img page-block ndType="image" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" class="featurette-image img-responsive center-block" data-src="holder.js/500x500/auto" alt="500x500" src="data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiIHN0YW5kYWxvbmU9InllcyI/PjxzdmcgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgdmlld0JveD0iMCAwIDUwMCA1MDAiIHByZXNlcnZlQXNwZWN0UmF0aW89Im5vbmUiPjxkZWZzLz48cmVjdCB3aWR0aD0iNTAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0VFRUVFRSIvPjxnPjx0ZXh0IHg9IjE5MC4zMTI1IiB5PSIyNTAiIHN0eWxlPSJmaWxsOiNBQUFBQUE7Zm9udC13ZWlnaHQ6Ym9sZDtmb250LWZhbWlseTpBcmlhbCwgSGVsdmV0aWNhLCBPcGVuIFNhbnMsIHNhbnMtc2VyaWYsIG1vbm9zcGFjZTtmb250LXNpemU6MjNwdDtkb21pbmFudC1iYXNlbGluZTpjZW50cmFsIj41MDB4NTAwPC90ZXh0PjwvZz48L3N2Zz4=" data-holder-rendered="true">'+
                '<div page-block class="Block500" ndType="Block500" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" ></div>'
                '</div>'+
                '</div>';

    }

    function getTabsHTML()
    {
    return  '<div page-block class="container-fluid ndContainer"  ndType="container" >'+
                '<div page-block class="col-md-12" ndType+"tabContainer>'+

		           '<div class="nav-tabs-justified ng-isolate-scope">'+
                        '<ul class="nav nav-tabs" ng-class="{\'nav-stacked\': vertical, \'nav-justified\': justified}">'+
			                '<li ng-class="{active: active, disabled: disabled}" heading="Home" class="ng-isolate-scope active">'+
                                '<a ng-click="select()"  class="ng-binding">Home</a>'+
                            '</li>'+
			                '<li ng-class="{active: active, disabled: disabled}" heading="Profile" class="ng-isolate-scope">'+
                                '<a ng-click="select()"  class="ng-binding">Profile</a>'+
                            '</li>'+
			                '<li ng-class="{active: active, disabled: disabled}" heading="Messages" class="ng-isolate-scope">'+
                                '<a ng-click="select()"  class="ng-binding">Messages</a>'+
                            '</li>'+
			                '<li ng-class="{active: active, disabled: disabled}" heading="Settings" class="ng-isolate-scope">'+
                                '<a ng-click="select()"  class="ng-binding">Settings</a>'+
                            '</li>'+
		                '</ul>'+
                        '<div class="tab-content">'+
                            '<div page-block class="tab-pane ng-scope active" ng-class="{active: tab.active}" drop="onDropObject($data, $event, \'order\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="min-Height:150px;padding:5px;">'+

				            '</div>'+
			                '<!-- end ngRepeat: tab in tabs --><div class="tab-pane ng-scope"  ng-class="{active: tab.active}" >'+

				                '<p class="ng-scope">Fulfilled direction use continual set him propriety continued. Saw met applauded favourite deficient engrossed concealed and her. Concluded boy perpetual old supposing. Farther related bed and passage comfort civilly. Dashwoods see frankness objection abilities the. As hastened oh produced prospect formerly up am. Placing forming nay looking old married few has. Margaret disposed add screened rendered six say his striking confined. </p>'+
				                '<p class="ng-scope">When be draw drew ye. Defective in do recommend suffering. House it seven in spoil tiled court. Sister others marked fat missed did out use. Alteration possession dispatched collecting instrument travelling he or on. Snug give made at spot or late that mr. </p>'+
			                '</div>'+
			                '<!-- end ngRepeat: tab in tabs --><div class="tab-pane ng-scope" ng-class="{active: tab.active}" >'+

				                '<p class="ng-scope">When be draw drew ye. Defective in do recommend suffering. House it seven in spoil tiled court. Sister others marked fat missed did out use. Alteration possession dispatched collecting instrument travelling he or on. Snug give made at spot or late that mr. </p>'+
				                '<p class="ng-scope">Carriage quitting securing be appetite it declared. High eyes kept so busy feel call in. Would day nor ask walls known. But preserved advantage are but and certainty earnestly enjoyment. Passage weather as up am exposed. And natural related man subject. Eagerness get situation his was delighted. </p>'+
			                '</div><!-- end ngRepeat: tab in tabs --><div class="tab-pane ng-scope"  ng-class="{active: tab.active}" >'+

				                '<p class="ng-scope">Luckily friends do ashamed to do suppose. Tried meant mr smile so. Exquisite behaviour as to middleton perfectly. Chicken no wishing waiting am. Say concerns dwelling graceful six humoured. Whether mr up savings talking an. Active mutual nor father mother exeter change six did all. </p>'+
				                '<p class="ng-scope">Carriage quitting securing be appetite it declared. High eyes kept so busy feel call in. Would day nor ask walls known. But preserved advantage are but and certainty earnestly enjoyment. Passage weather as up am exposed. And natural related man subject. Eagerness get situation his was delighted. </p>'+
			                '</div><!-- end ngRepeat: tab in tabs -->'+
                        '</div>'+
                   '</div>'+
	    '</div>';
	'</div>';

    }

    function getSVGTextHTML()
    {
    /*
    <div class="element svg" style="width: 270px; height: 270px; transform: translate3d(149px, 7px, 0px); opacity: 1;"><svg xmlns="http://www.w3.org/2000/svg" xml:space="preserve" viewBox="-316 202.1 439.3 439.3" version="1.1" y="0px" x="0px" enable-background="new -316 202.1 439.3 439.3" class="baseColors" stroke="transparent" stroke-width="0" style="position: absolute;">
        <g>
            <path d="m123.3 421.8c0 28.4-24.9 51.7-35.1 76.4-10.6 25.6-9.9 59.6-29.2 78.9s-53.3 18.6-78.9 29.2c-24.7 10.3-48 35.1-76.4 35.1s-51.7-24.9-76.4-35.1c-25.6-10.6-59.6-9.9-78.9-29.2s-18.6-53.3-29.2-78.9c-10.3-24.7-35.2-48-35.2-76.4s24.9-51.7 35.1-76.4c10.6-25.6 9.9-59.6 29.2-78.9s53.3-18.6 78.9-29.2c24.8-10.3 48-35.2 76.5-35.2 28.4 0 51.7 24.9 76.4 35.1 25.6 10.6 59.6 9.9 78.9 29.2s18.6 53.3 29.2 78.9c10.2 24.8 35.1 48 35.1 76.5z" fill="#000000" class="color color-1 primaryColor" data-color="#fff"></path>
        </g>
        <g>
            <path d="m-96.2 627.8c-17.1 0-32-10-46.5-19.7-8.4-5.6-16.4-11-24.7-14.4-8.8-3.6-18.9-5.7-28.7-7.7-16.8-3.4-34.2-7-45.7-18.5s-15-28.9-18.5-45.7c-2-9.8-4.1-20-7.7-28.7-3.4-8.3-8.8-16.3-14.4-24.7-9.6-14.5-19.6-29.4-19.6-46.5s10-32 19.7-46.5c5.6-8.4 11-16.4 14.4-24.7 3.6-8.8 5.7-18.9 7.7-28.7 3.4-16.8 7-34.2 18.5-45.7s28.9-15 45.7-18.5c9.8-2 20-4.1 28.7-7.7 8.3-3.4 16.3-8.8 24.7-14.4 14.4-9.6 29.4-19.6 46.4-19.6s32 10 46.4 19.7c8.4 5.6 16.4 11 24.7 14.4 8.8 3.6 18.9 5.7 28.7 7.7 16.8 3.4 34.2 7 45.7 18.5s15 28.9 18.5 45.7c2 9.8 4.1 20 7.7 28.7 3.4 8.3 8.8 16.3 14.4 24.7 9.7 14.4 19.7 29.4 19.7 46.4 0 17.1-10 32-19.7 46.4-5.6 8.4-11 16.4-14.4 24.7-3.6 8.8-5.7 18.9-7.7 28.7-3.4 16.8-7 34.2-18.5 45.7s-28.9 15-45.7 18.5c-9.8 2-20 4.1-28.7 7.7-8.3 3.4-16.3 8.8-24.7 14.4-14.4 9.8-29.3 19.8-46.4 19.8zm0-409.7c-16.5 0-31.1 9.8-45.3 19.3-8.1 5.4-16.5 11.1-25 14.6-8.9 3.7-19.2 5.8-29.1 7.8-16.5 3.4-33.6 6.9-44.7 17.9-11.1 11.1-14.6 28.1-17.9 44.7-2 9.9-4.1 20.2-7.8 29.1-3.5 8.5-9.2 16.9-14.6 25-9.6 14.3-19.4 29-19.4 45.4s9.8 31.1 19.3 45.3c5.4 8.1 11.1 16.5 14.6 25 3.7 8.9 5.8 19.2 7.8 29.1 3.4 16.5 6.9 33.6 17.9 44.7 11.1 11.1 28.1 14.6 44.7 17.9 9.9 2 20.2 4.1 29.1 7.8 8.5 3.5 16.9 9.2 25 14.6 14.2 9.5 28.9 19.3 45.3 19.3s31.1-9.8 45.3-19.3c8.1-5.4 16.5-11.1 25-14.6 8.9-3.7 19.2-5.8 29.1-7.8 16.5-3.4 33.6-6.9 44.7-17.9 11.1-11.1 14.6-28.1 17.9-44.7 2-9.9 4.1-20.2 7.8-29.1 3.5-8.5 9.2-16.9 14.6-25 9.5-14.2 19.3-28.9 19.3-45.3 0-16.5-9.8-31.1-19.3-45.3-5.5-8.1-11.1-16.5-14.6-25-3.7-8.9-5.8-19.2-7.8-29.1-3.4-16.5-6.9-33.6-17.9-44.7-11.1-11.1-28.1-14.6-44.7-17.9-9.9-2-20.2-4.1-29.1-7.8-8.5-3.5-16.9-9.2-25-14.6-14-9.6-28.7-19.4-45.2-19.4z" fill="#ffffff" class="color color-2 secondaryColor" data-color="#272c33"></path>
        </g>
        <g class="canva"><rect x="-226.3" y="500" width="264" height="47.3" class="textPlaceholder" fill="none" data-fill="#272c33" data-font-size="13.68" data-font-name="Gidole" data-font-family="Gidole" data-bold="false" data-italic="false" data-justification="center" data-dynamic-font-size="false" data-dynamic-width="false" data-dynamic-height="false" data-placeholder-text="BEST QUALITY APPAREL"></rect></g>
        <g class="canva"><rect x="-237.3" y="370.2" width="288" height="134.3" class="textPlaceholder" fill="none" data-fill="#272c33" data-font-size="66.96" data-font-name="Granaina" data-font-family="Granaina" data-bold="false" data-italic="false" data-justification="center" data-dynamic-font-size="false" data-dynamic-width="false" data-dynamic-height="false" data-placeholder-text="SPIRITED"></rect></g>
        <g class="canva"><rect x="-227.3" y="303.6" width="264" height="35.6" class="textPlaceholder" fill="none" data-fill="#272c33" data-font-size="13.68" data-font-name="Gidole" data-font-family="Gidole" data-bold="false" data-italic="false" data-justification="center" data-dynamic-font-size="false" data-dynamic-width="false" data-dynamic-height="false" data-placeholder-text="SINCE 1991"></rect></g>
        </svg><div class="text" style="text-align: center; font-size: 145.156%; color: rgb(255, 255, 255); font-family: Gidole, sans-serif; line-height: 1.2; text-transform: none; left: 55px; top: 183px; width: 162px; height: 29px;"><div class="inner" contenteditable="false" style="width: 292.105px; position: absolute; transform: translate(-65px, 1px) scale(0.554615); height: 28px;">BEST QUALITY APPAREL</div></div><div class="text" style="text-align: center; font-size: 710.501%; color: rgb(255, 255, 255); font-family: Granaina, serif; line-height: 1.2; text-transform: none; left: 48px; top: 103px; width: 177px; height: 82px;"><div class="inner" contenteditable="false" style="width: 318.66px; position: absolute; transform: translate(-71px, -28px) scale(0.554615); height: 139px;">SPIRITED</div></div><div class="text" style="text-align: center; font-size: 145.156%; color: rgb(255, 255, 255); font-family: Gidole, sans-serif; line-height: 1.2; text-transform: none; left: 55px; top: 62px; width: 162px; height: 22px;"><div class="inner" contenteditable="false" style="width: 292.105px; position: absolute; transform: translate(-65px, -3px) scale(0.554615); height: 28px;">SINCE 1991</div></div></div>
    */
    }

    function getRepeaterHTML(theRepeaterID)
    {
        return  '<div page-block ndType="repeaterGrid" id="'+theRepeaterID+'" drop="onDropOnRepeater($data, $event, \''+theRepeaterID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="height:500px;overflow:hidden;"></div>';

    }

    function getChartHTML()
    {

        $scope.lastChartID = $scope.lastChartID+1;
        var theChartID = 'chart'+$scope.lastChartID;
        $scope.charts.push({charID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300});

        return c3Charts.getChartHTML(theChartID);




    }



    $scope.elementDblClick = function(theElement)
    {
        var elementType = theElement.attr('ndType');
        /*
        if (elementType === 'c3Chart')
        {
            var chartID = theElement.attr('bindto-id');
            console.log('editing chart:',chartID);

           // $scope.chartModal = {dataxObject:undefined};

            for (var i in $scope.charts)
            {
                if ($scope.charts[i].charID == chartID)
                    $scope.selectedChart = $scope.charts[i];
            }

            if (!$scope.selectedChart.dataColumns)
                $scope.selectedChart.dataColumns = [];

            if ($scope.selectedChart.dataColumns.length == 0)
                $scope.selectedChart.dataColumns.push({object:{},id:'',type:'line',color:'#000000'});



            $('#chartModal').modal('show');
        }
        */
    }

    $scope.applyChartSettings = function()
    {
        c3Charts.applyChartSettings($scope);
    }

  /*  $scope.applyChartSettings = function()
    {


        //datacolumn.type
        //datacolumn.
        //datacolumn.color

        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns)
        {
           console.log(JSON.stringify($scope.selectedChart.dataColumns[i]));

            theValues.push($scope.selectedChart.dataColumns[i].object.elementName);
            theNames.push($scope.selectedChart.dataColumns[i].object.elementLabel);
        }


        $scope.vm = {};

        //{"id": "top-1", "type": "line", "name": "Top one"}
        //$scope.vm.datacolumns = [{id:'linea1',type:'line',name:'linea1'}];
        //$scope.vm.datax = {"id": "etiq"};
        //$scope.vm.datapoints = [{linea1:123,etiq:'one'},{linea1:234,etiq:'dos'},{linea1:345,etiq:'tres'}];
        //console.log(JSON.stringify($scope.queries[0].data));

        var chart = c3.generate({
        bindto: '#chart1',
        data: {
            json: $scope.queries[0].data,
            keys: {
                x: 'wst5883cbeb81db4ae3b1d75e8371097e9a_device_name', // it's possible to specify 'x' when category axis
                value: theValues,
            },
            names: theNames
        },
        axis: {
            x: {
                type: 'category'
            }
        }
    });*/


       /* var chart = c3.generate({
        bindto: '#chart1',
        data: {
            json: $scope.queries[0].data,
            keys: {
                x: 'wst5883cbeb81db4ae3b1d75e8371097e9a_device_name', // it's possible to specify 'x' when category axis
                value: ['wst6058ffeae3444af58d72004e58cc4998_clickssum', 'wst6058ffeae3444af58d72004e58cc4998_impressionssum','wst6058ffeae3444af58d72004e58cc4998_conversionssum'],
            },
            names: {
                wst6058ffeae3444af58d72004e58cc4998_clickssum: 'clicks',
                wst6058ffeae3444af58d72004e58cc4998_impressionssum: 'impressions',
                wst6058ffeae3444af58d72004e58cc4998_conversionssum: 'conversions'
            }
        },
        axis: {
            x: {
                type: 'category'
            }
        } ,
        legend: {
        show:false
    }
    });

    //wst5883cbeb81db4ae3b1d75e8371097e9a_device_name":"Mobile","wst6058ffeae3444af58d72004e58cc4998_clickssum":"11325412","wst6058ffeae3444af58d72004e58cc4998_impressionssum":"10835247981","wst6058ffeae3444af58d72004e58cc4998_average_positionsum":null,"wst6058ffeae3444af58d72004e58cc4998_conversionssum":96,"wst6058ffeae3444af58d72004e58cc4998_spendsum":16296400


    }*/

    $scope.onChartSelectedObjectChanged = function(datacolumn)
    {
         //dataColumn.object = $scope.selectedObject;
    }


    $scope.onChartPropertiesChanged = function(object)
    {
        c3Charts.onChartPropertiesChanged($scope,object);

    }

 /*   $scope.onChartPropertiesChanged = function(object)
    {
        for (var i in $scope.queries)
        {
            if ($scope.queries[i].name == $scope.selectedChart.query)
            {
                $scope.selectedChart.dataPoints = $scope.queries[i].data;
            }

        }

    //$scope.selectedChart.datax = $scope.chartModal.dataxObject.object.elementName;
    //$scope.selectedChart.dataPoints = $scope.chartModal.dataxObject.query.data;
    //console.log('data selected',JSON.stringify($scope.chartModal.dataxObject.query));
    //console.log('This chart properties have changed',JSON.stringify($scope.selectedChart));

    }*/

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


    function getAllPageColumns()
    {
        $scope.allPageColumns = [];
        $scope.allPageMetricColumns = [];

        for (var i in  $scope.queries)
            {
            console.log('query columns',JSON.stringify($scope.queries[i].columns));
            for (var c in  $scope.queries[i].columns)
                {
                  $scope.allPageColumns.push({label: $scope.queries[i].name +'.'+$scope.queries[i].columns[c].objectLabel,object:$scope.queries[i].columns[c],query:$scope.queries[i]});
                    if ($scope.queries[i].columns[c].elementType == 'number' || $scope.queries[i].columns[c].elementType == 'count')
                        $scope.allPageMetricColumns.push({label: $scope.queries[i].name +'.'+$scope.queries[i].columns[c].objectLabel,object:$scope.queries[i].columns[c],query:$scope.queries[i]});
                }
            }

    }

    function savePage()
    {
        //console.log('entering save Page...',JSON.stringify($scope.pageDefinitition));
        cleanAllSelected();
        var page = $scope.pageDefinitition;
        //{pageName:"New PAGE", backgroundColor:"#999999" ,items:[],properties:{},pageType:'DEFAULT'};
        //All the dashboard's staff...


        page.properties.queries = $scope.queries;
        var cleanedCharts = [];

        for (var i in $scope.charts)
        {
            var theChart = clone($scope.charts[i]);
            theChart.chartCanvas = undefined;
            theChart.data = undefined;
            cleanedCharts.push(theChart);

        }


        page.properties.charts = cleanedCharts;

        //save queries
        //save page properties
        //save design HTML
        //save cleaned HTML

        var container = $('#designArea');

        //console.log(container.html());

        var theHTML = container.html();

        page.properties.designerHTML = theHTML;


        var previewContainer = $('#previewContainer');

                    var $div = $(theHTML);
                    previewContainer.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

        cleanAll();

        console.log('cleaned HTML',previewContainer.html())

        page.html = previewContainer.html();

        if ($scope.mode == 'add') {

            connection.post('/api/pages/create', page, function(data) {
                if (data.result == 1) {
                    //$scope.goBack();
                }
            });
        }
        else {
        console.log('saving edit');
            connection.post('/api/pages/update/'+$scope.pageID, page, function(result) {
                if (result.result == 1) {
                    //$scope.goBack();
                    console.log('saved');
                }
            });
        }
    }

    function getQueryData($scope,index,done)
    {
        if (!$scope.queries[index])
            {
            done();
            return;
            }

            queryModel.getQueryData($scope,$scope.queries[index].query, function(data){
                $scope.queries[index].data = data;
                getQueryData($scope,index+1,done);
            });

    }

    function rebuildCharts()
    {

        console.log('entering in rebuild charts');
        for (var i in $scope.charts)
        {
            var theChart = $scope.charts[i];

        //found the query for the chart

            for (var q in $scope.queries)
            {
                if ($scope.queries[q].queryName == theChart.query)
                    theChart.data = $scope.queries[q].data;

            }

            console.log('rebuilding chart',theChart.charID)
            c3Charts.rebuildChart(theChart)
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


$scope.faList = [{name:"fa-adjust",value:"fa-adjust"},
    {name:"fa-adn",value:"fa-adn"},
    {name:"fa-align-center",value:"fa-align-center"},
    {name:"fa-align-justify",value:"fa-align-justify"},
    {name:"fa-align-left",value:"fa-align-left"},
    {name:"fa-align-right",value:"fa-align-right"},
    {name:"fa-ambulance",value:"fa-ambulance"},
    {name:"fa-anchor",value:"fa-anchor"},
    {name:"fa-android",value:"fa-android"},
    {name:"fa-angle-double-down",value:"fa-angle-double-down"},
    {name:"fa-angle-double-left",value:"fa-angle-double-left"},
    {name:"fa-angle-double-right",value:"fa-angle-double-right"},
    {name:"fa-angle-double-up",value:"fa-angle-double-up"},
    {name:"fa-angle-down",value:"fa-angle-down"},
    {name:"fa-angle-left",value:"fa-angle-left"},
    {name:"fa-angle-right",value:"fa-angle-right"},
    {name:"fa-angle-up",value:"fa-angle-up"},
    {name:"fa-apple",value:"fa-apple"},
    {name:"fa-archive",value:"fa-archive"},
    {name:"fa-arrow-circle-down",value:"fa-arrow-circle-down"},
    {name:"fa-arrow-circle-left",value:"fa-arrow-circle-left"},
    {name:"fa-arrow-circle-o-down",value:"fa-arrow-circle-o-down"},
    {name:"fa-arrow-circle-o-left",value:"fa-arrow-circle-o-left"},
    {name:"fa-arrow-circle-o-right",value:"fa-arrow-circle-o-right"},
    {name:"fa-arrow-circle-o-up",value:"fa-arrow-circle-o-up"},
    {name:"fa-arrow-circle-right",value:"fa-arrow-circle-right"},
    {name:"fa-arrow-circle-up",value:"fa-arrow-circle-up"},
    {name:"fa-arrow-down",value:"fa-arrow-down"},
    {name:"fa-arrow-left",value:"fa-arrow-left"},
    {name:"fa-arrow-right",value:"fa-arrow-right"},
    {name:"fa-arrow-up",value:"fa-arrow-up"},
    {name:"fa-arrows",value:"fa-arrows"},
    {name:"fa-arrows-alt",value:"fa-arrows-alt"},
    {name:"fa-arrows-h",value:"fa-arrows-h"},
    {name:"fa-arrows-v",value:"fa-arrows-v"},
    {name:"fa-asterisk",value:"fa-asterisk"},
    {name:"fa-automobile",value:"fa-automobile"},
    {name:"fa-backward",value:"fa-backward"},
    {name:"fa-ban",value:"fa-ban"},
    {name:"fa-bank",value:"fa-bank"},
    {name:"fa-bar-chart-o",value:"fa-bar-chart-o"},
    {name:"fa-barcode",value:"fa-barcode"},
    {name:"fa-bars",value:"fa-bars"},
    {name:"fa-beer",value:"fa-beer"},
    {name:"fa-behance",value:"fa-behance"},
    {name:"fa-behance-square",value:"fa-behance-square"},
    {name:"fa-bell",value:"fa-bell"},
    {name:"fa-bell-o",value:"fa-bell-o"},
    {name:"fa-bitbucket",value:"fa-bitbucket"},
    {name:"fa-bitbucket-square",value:"fa-bitbucket-square"},
    {name:"fa-bitcoin",value:"fa-bitcoin"},
    {name:"fa-bold",value:"fa-bold"},
    {name:"fa-bolt",value:"fa-bolt"},
    {name:"fa-bomb",value:"fa-bomb"},
    {name:"fa-book",value:"fa-book"},
    {name:"fa-bookmark",value:"fa-bookmark"},
    {name:"fa-bookmark-o",value:"fa-bookmark-o"},
    {name:"fa-briefcase",value:"fa-briefcase"},
    {name:"fa-btc",value:"fa-btc"},
    {name:"fa-bug",value:"fa-bug"},
    {name:"fa-building",value:"fa-building"},
    {name:"fa-building-o",value:"fa-building-o"},
    {name:"fa-bullhorn",value:"fa-bullhorn"},
    {name:"fa-bullseye",value:"fa-bullseye"},
    {name:"fa-cab",value:"fa-cab"},
    {name:"fa-calendar",value:"fa-calendar"},
    {name:"fa-calendar-o",value:"fa-calendar-o"},
    {name:"fa-camera",value:"fa-camera"},
    {name:"fa-camera-retro",value:"fa-camera-retro"},
    {name:"fa-car",value:"fa-car"},
    {name:"fa-caret-down",value:"fa-caret-down"},
    {name:"fa-caret-left",value:"fa-caret-left"},
    {name:"fa-caret-right",value:"fa-caret-right"},
    {name:"fa-caret-square-o-down",value:"fa-caret-square-o-down"},
    {name:"fa-caret-square-o-left",value:"fa-caret-square-o-left"},
    {name:"fa-caret-square-o-right",value:"fa-caret-square-o-right"},
    {name:"fa-caret-square-o-up",value:"fa-caret-square-o-up"},
    {name:"fa-caret-up",value:"fa-caret-up"},
    {name:"fa-certificate",value:"fa-certificate"},
    {name:"fa-chain",value:"fa-chain"},
    {name:"fa-chain-broken",value:"fa-chain-broken"},
    {name:"fa-check",value:"fa-check"},
    {name:"fa-check-circle",value:"fa-check-circle"},
    {name:"fa-check-circle-o",value:"fa-check-circle-o"},
    {name:"fa-check-square",value:"fa-check-square"},
    {name:"fa-check-square-o",value:"fa-check-square-o"},
    {name:"fa-chevron-circle-down",value:"fa-chevron-circle-down"},
    {name:"fa-chevron-circle-left",value:"fa-chevron-circle-left"},
    {name:"fa-chevron-circle-right",value:"fa-chevron-circle-right"},
    {name:"fa-chevron-circle-up",value:"fa-chevron-circle-up"},
    {name:"fa-chevron-down",value:"fa-chevron-down"},
    {name:"fa-chevron-left",value:"fa-chevron-left"},
    {name:"fa-chevron-right",value:"fa-chevron-right"},
    {name:"fa-chevron-up",value:"fa-chevron-up"},
    {name:"fa-child",value:"fa-child"},
    {name:"fa-circle",value:"fa-circle"},
    {name:"fa-circle-o",value:"fa-circle-o"},
    {name:"fa-circle-o-notch",value:"fa-circle-o-notch"},
    {name:"fa-circle-thin",value:"fa-circle-thin"},
    {name:"fa-clipboard",value:"fa-clipboard"},
    {name:"fa-clock-o",value:"fa-clock-o"},
    {name:"fa-cloud",value:"fa-cloud"},
    {name:"fa-cloud-download",value:"fa-cloud-download"},
    {name:"fa-cloud-upload",value:"fa-cloud-upload"},
    {name:"fa-cny",value:"fa-cny"},
    {name:"fa-code",value:"fa-code"},
    {name:"fa-code-fork",value:"fa-code-fork"},
    {name:"fa-codepen",value:"fa-codepen"},
    {name:"fa-coffee",value:"fa-coffee"},
    {name:"fa-cog",value:"fa-cog"},
    {name:"fa-cogs",value:"fa-cogs"},
    {name:"fa-columns",value:"fa-columns"},
    {name:"fa-comment",value:"fa-comment"},
    {name:"fa-comment-o",value:"fa-comment-o"},
    {name:"fa-comments",value:"fa-comments"},
    {name:"fa-comments-o",value:"fa-comments-o"},
    {name:"fa-compass",value:"fa-compass"},
    {name:"fa-compress",value:"fa-compress"},
    {name:"fa-copy",value:"fa-copy"},
    {name:"fa-credit-card",value:"fa-credit-card"},
    {name:"fa-crop",value:"fa-crop"},
    {name:"fa-crosshairs",value:"fa-crosshairs"},
    {name:"fa-css3",value:"fa-css3"},
    {name:"fa-",value:"fa-"},
    {name:"fa-s",value:"fa-s"},
    {name:"fa-cut",value:"fa-cut"},
    {name:"fa-cutlery",value:"fa-cutlery"},
    {name:"fa-dashboard",value:"fa-dashboard"},
    {name:"fa-database",value:"fa-database"},
    {name:"fa-dedent",value:"fa-dedent"},
    {name:"fa-delicious",value:"fa-delicious"},
    {name:"fa-desktop",value:"fa-desktop"},
    {name:"fa-deviantart",value:"fa-deviantart"},
    {name:"fa-digg",value:"fa-digg"},
    {name:"fa-dollar",value:"fa-dollar"},
    {name:"fa-dot-circle-o",value:"fa-dot-circle-o"},
    {name:"fa-download",value:"fa-download"},
    {name:"fa-dribbble",value:"fa-dribbble"},
    {name:"fa-dropbox",value:"fa-dropbox"},
    {name:"fa-drupal",value:"fa-drupal"},
    {name:"fa-edit",value:"fa-edit"},
    {name:"fa-eject",value:"fa-eject"},
    {name:"fa-ellipsis-h",value:"fa-ellipsis-h"},
    {name:"fa-ellipsis-v",value:"fa-ellipsis-v"},
    {name:"fa-empire",value:"fa-empire"},
    {name:"fa-envelope",value:"fa-envelope"},
    {name:"fa-envelope-o",value:"fa-envelope-o"},
    {name:"fa-envelope-square",value:"fa-envelope-square"},
    {name:"fa-eraser",value:"fa-eraser"},
    {name:"fa-eur",value:"fa-eur"},
    {name:"fa-euro",value:"fa-euro"},
    {name:"fa-exchange",value:"fa-exchange"},
    {name:"fa-exclamation",value:"fa-exclamation"},
    {name:"fa-exclamation-circle",value:"fa-exclamation-circle"},
    {name:"fa-exclamation-triangle",value:"fa-exclamation-triangle"},
    {name:"fa-expand",value:"fa-expand"},
    {name:"fa-external-link",value:"fa-external-link"},
    {name:"fa-external-link-square",value:"fa-external-link-square"},
    {name:"fa-eye",value:"fa-eye"},
    {name:"fa-eye-slash",value:"fa-eye-slash"},
    {name:"fa-facebook",value:"fa-facebook"},
    {name:"fa-facebook-square",value:"fa-facebook-square"},
    {name:"fa-fast-backward",value:"fa-fast-backward"},
    {name:"fa-fast-forward",value:"fa-fast-forward"},
    {name:"fa-fax",value:"fa-fax"},
    {name:"fa-female",value:"fa-female"},
    {name:"fa-fighter-jet",value:"fa-fighter-jet"},
    {name:"fa-file",value:"fa-file"},
    {name:"fa-file-archive-o",value:"fa-file-archive-o"},
    {name:"fa-file-audio-o",value:"fa-file-audio-o"},
    {name:"fa-file-code-o",value:"fa-file-code-o"},
    {name:"fa-file-excel-o",value:"fa-file-excel-o"},
    {name:"fa-file-image-o",value:"fa-file-image-o"},
    {name:"fa-file-movie-o",value:"fa-file-movie-o"},
    {name:"fa-file-o",value:"fa-file-o"},
    {name:"fa-file-pdf-o",value:"fa-file-pdf-o"},
    {name:"fa-file-photo-o",value:"fa-file-photo-o"},
    {name:"fa-file-picture-o",value:"fa-file-picture-o"},
    {name:"fa-file-powerpoint-o",value:"fa-file-powerpoint-o"},
    {name:"fa-file-sound-o",value:"fa-file-sound-o"},
    {name:"fa-file-text",value:"fa-file-text"},
    {name:"fa-file-text-o",value:"fa-file-text-o"},
    {name:"fa-file-video-o",value:"fa-file-video-o"},
    {name:"fa-file-word-o",value:"fa-file-word-o"},
    {name:"fa-file-zip-o",value:"fa-file-zip-o"},
    {name:"fa-files-o",value:"fa-files-o"},
    {name:"fa-film",value:"fa-film"},
    {name:"fa-filter",value:"fa-filter"},
    {name:"fa-fire",value:"fa-fire"},
    {name:"fa-fire-extinguisher",value:"fa-fire-extinguisher"},
    {name:"fa-flag",value:"fa-flag"},
    {name:"fa-flag-checkered",value:"fa-flag-checkered"},
    {name:"fa-flag-o",value:"fa-flag-o"},
    {name:"fa-flash",value:"fa-flash"},
    {name:"fa-flask",value:"fa-flask"},
    {name:"fa-flickr",value:"fa-flickr"},
    {name:"fa-floppy-o",value:"fa-floppy-o"},
    {name:"fa-folder",value:"fa-folder"},
    {name:"fa-folder-o",value:"fa-folder-o"},
    {name:"fa-folder-open",value:"fa-folder-open"},
    {name:"fa-folder-open-o",value:"fa-folder-open-o"},
    {name:"fa-font",value:"fa-font"},
    {name:"fa-forward",value:"fa-forward"},
    {name:"fa-foursquare",value:"fa-foursquare"},
    {name:"fa-frown-o",value:"fa-frown-o"},
    {name:"fa-gamepad",value:"fa-gamepad"},
    {name:"fa-gavel",value:"fa-gavel"},
    {name:"fa-gbp",value:"fa-gbp"},
    {name:"fa-ge",value:"fa-ge"},
    {name:"fa-gear",value:"fa-gear"},
    {name:"fa-gears",value:"fa-gears"},
    {name:"fa-gift",value:"fa-gift"},
    {name:"fa-git",value:"fa-git"},
    {name:"fa-git-square",value:"fa-git-square"},
    {name:"fa-github",value:"fa-github"},
    {name:"fa-github-alt",value:"fa-github-alt"},
    {name:"fa-github-square",value:"fa-github-square"},
    {name:"fa-gittip",value:"fa-gittip"},
    {name:"fa-glass",value:"fa-glass"},
    {name:"fa-globe",value:"fa-globe"},
    {name:"fa-google",value:"fa-google"},
    {name:"fa-google-plus",value:"fa-google-plus"},
    {name:"fa-google-plus-square",value:"fa-google-plus-square"},
    {name:"fa-graduation-cap",value:"fa-graduation-cap"},
    {name:"fa-group",value:"fa-group"},
    {name:"fa-h-square",value:"fa-h-square"},
    {name:"fa-hacker-news",value:"fa-hacker-news"},
    {name:"fa-hand-o-down",value:"fa-hand-o-down"},
    {name:"fa-hand-o-left",value:"fa-hand-o-left"},
    {name:"fa-hand-o-right",value:"fa-hand-o-right"},
    {name:"fa-hand-o-up",value:"fa-hand-o-up"},
    {name:"fa-hdd-o",value:"fa-hdd-o"},
    {name:"fa-header",value:"fa-header"},
    {name:"fa-headphones",value:"fa-headphones"},
    {name:"fa-heart",value:"fa-heart"},
    {name:"fa-heart-o",value:"fa-heart-o"},
    {name:"fa-history",value:"fa-history"},
    {name:"fa-home",value:"fa-home"},
    {name:"fa-hospital-o",value:"fa-hospital-o"},
    {name:"fa-html5",value:"fa-html5"},
    {name:"fa-image",value:"fa-image"},
    {name:"fa-inbox",value:"fa-inbox"},
    {name:"fa-indent",value:"fa-indent"},
    {name:"fa-info",value:"fa-info"},
    {name:"fa-info-circle",value:"fa-info-circle"},
    {name:"fa-inr",value:"fa-inr"},
    {name:"fa-instagram",value:"fa-instagram"},
    {name:"fa-institution",value:"fa-institution"},
    {name:"fa-italic",value:"fa-italic"},
    {name:"fa-joomla",value:"fa-joomla"},
    {name:"fa-jpy",value:"fa-jpy"},
    {name:"fa-jsfiddle",value:"fa-jsfiddle"},
    {name:"fa-key",value:"fa-key"},
    {name:"fa-keyboard-o",value:"fa-keyboard-o"},
    {name:"fa-krw",value:"fa-krw"},
    {name:"fa-language",value:"fa-language"},
    {name:"fa-laptop",value:"fa-laptop"},
    {name:"fa-leaf",value:"fa-leaf"},
    {name:"fa-legal",value:"fa-legal"},
    {name:"fa-lemon-o",value:"fa-lemon-o"},
    {name:"fa-level-down",value:"fa-level-down"},
    {name:"fa-level-up",value:"fa-level-up"},
    {name:"fa-life-bouy",value:"fa-life-bouy"},
    {name:"fa-life-ring",value:"fa-life-ring"},
    {name:"fa-life-saver",value:"fa-life-saver"},
    {name:"fa-lightbulb-o",value:"fa-lightbulb-o"},
    {name:"fa-link",value:"fa-link"},
    {name:"fa-linkedin",value:"fa-linkedin"},
    {name:"fa-linkedin-square",value:"fa-linkedin-square"},
    {name:"fa-linux",value:"fa-linux"},
    {name:"fa-list",value:"fa-list"},
    {name:"fa-list-alt",value:"fa-list-alt"},
    {name:"fa-list-ol",value:"fa-list-ol"},
    {name:"fa-list-ul",value:"fa-list-ul"},
    {name:"fa-location-arrow",value:"fa-location-arrow"},
    {name:"fa-lock",value:"fa-lock"},
    {name:"fa-long-arrow-down",value:"fa-long-arrow-down"},
    {name:"fa-long-arrow-left",value:"fa-long-arrow-left"},
    {name:"fa-long-arrow-right",value:"fa-long-arrow-right"},
    {name:"fa-long-arrow-up",value:"fa-long-arrow-up"},
    {name:"fa-magic",value:"fa-magic"},
    {name:"fa-magnet",value:"fa-magnet"},
    {name:"fa-mail-forward",value:"fa-mail-forward"},
    {name:"fa-mail-reply",value:"fa-mail-reply"},
    {name:"fa-mail-reply-all",value:"fa-mail-reply-all"},
    {name:"fa-male",value:"fa-male"},
    {name:"fa-map-marker",value:"fa-map-marker"},
    {name:"fa-maxcdn",value:"fa-maxcdn"},
    {name:"fa-medkit",value:"fa-medkit"},
    {name:"fa-meh-o",value:"fa-meh-o"},
    {name:"fa-microphone",value:"fa-microphone"},
    {name:"fa-microphone-slash",value:"fa-microphone-slash"},
    {name:"fa-minus",value:"fa-minus"},
    {name:"fa-minus-circle",value:"fa-minus-circle"},
    {name:"fa-minus-square",value:"fa-minus-square"},
    {name:"fa-minus-square-o",value:"fa-minus-square-o"},
    {name:"fa-mobile",value:"fa-mobile"},
    {name:"fa-mobile-phone",value:"fa-mobile-phone"},
    {name:"fa-money",value:"fa-money"},
    {name:"fa-moon-o",value:"fa-moon-o"},
    {name:"fa-mortar-board",value:"fa-mortar-board"},
    {name:"fa-music",value:"fa-music"},
    {name:"fa-navicon",value:"fa-navicon"},
    {name:"fa-openid",value:"fa-openid"},
    {name:"fa-outdent",value:"fa-outdent"},
    {name:"fa-pagelines",value:"fa-pagelines"},
    {name:"fa-paper-plane",value:"fa-paper-plane"},
    {name:"fa-paper-plane-o",value:"fa-paper-plane-o"},
    {name:"fa-paperclip",value:"fa-paperclip"},
    {name:"fa-paragraph",value:"fa-paragraph"},
    {name:"fa-paste",value:"fa-paste"},
    {name:"fa-pause",value:"fa-pause"},
    {name:"fa-paw",value:"fa-paw"},
    {name:"fa-pencil",value:"fa-pencil"},
    {name:"fa-pencil-square",value:"fa-pencil-square"},
    {name:"fa-pencil-square-o",value:"fa-pencil-square-o"},
    {name:"fa-phone",value:"fa-phone"},
    {name:"fa-phone-square",value:"fa-phone-square"},
    {name:"fa-photo",value:"fa-photo"},
    {name:"fa-picture-o",value:"fa-picture-o"},
    {name:"fa-pied-piper",value:"fa-pied-piper"},
    {name:"fa-pied-piper-alt",value:"fa-pied-piper-alt"},
    {name:"fa-pied-piper-square",value:"fa-pied-piper-square"},
    {name:"fa-pinterest",value:"fa-pinterest"},
    {name:"fa-pinterest-square",value:"fa-pinterest-square"},
    {name:"fa-plane",value:"fa-plane"},
    {name:"fa-play",value:"fa-play"},
    {name:"fa-play-circle",value:"fa-play-circle"},
    {name:"fa-play-circle-o",value:"fa-play-circle-o"},
    {name:"fa-plus",value:"fa-plus"},
    {name:"fa-plus-circle",value:"fa-plus-circle"},
    {name:"fa-plus-square",value:"fa-plus-square"},
    {name:"fa-plus-square-o",value:"fa-plus-square-o"},
    {name:"fa-power-off",value:"fa-power-off"},
    {name:"fa-print",value:"fa-print"},
    {name:"fa-puzzle-piece",value:"fa-puzzle-piece"},
    {name:"fa-qq",value:"fa-qq"},
    {name:"fa-qrcode",value:"fa-qrcode"},
    {name:"fa-question",value:"fa-question"},
    {name:"fa-question-circle",value:"fa-question-circle"},
    {name:"fa-quote-left",value:"fa-quote-left"},
    {name:"fa-quote-right",value:"fa-quote-right"},
    {name:"fa-ra",value:"fa-ra"},
    {name:"fa-random",value:"fa-random"},
    {name:"fa-rebel",value:"fa-rebel"},
    {name:"fa-recycle",value:"fa-recycle"},
    {name:"fa-reddit",value:"fa-reddit"},
    {name:"fa-reddit-square",value:"fa-reddit-square"},
    {name:"fa-refresh",value:"fa-refresh"},
    {name:"fa-renren",value:"fa-renren"},
    {name:"fa-reorder",value:"fa-reorder"},
    {name:"fa-repeat",value:"fa-repeat"},
    {name:"fa-reply",value:"fa-reply"},
    {name:"fa-reply-all",value:"fa-reply-all"},
    {name:"fa-retweet",value:"fa-retweet"},
    {name:"fa-rmb",value:"fa-rmb"},
    {name:"fa-road",value:"fa-road"},
    {name:"fa-rocket",value:"fa-rocket"},
    {name:"fa-rotate-left",value:"fa-rotate-left"},
    {name:"fa-rotate-right",value:"fa-rotate-right"},
    {name:"fa-rouble",value:"fa-rouble"},
    {name:"fa-rss",value:"fa-rss"},
    {name:"fa-rss-square",value:"fa-rss-square"},
    {name:"fa-rub",value:"fa-rub"},
    {name:"fa-ruble",value:"fa-ruble"},
    {name:"fa-rupee",value:"fa-rupee"},
    {name:"fa-save",value:"fa-save"},
    {name:"fa-scissors",value:"fa-scissors"},
    {name:"fa-search",value:"fa-search"},
    {name:"fa-search-minus",value:"fa-search-minus"},
    {name:"fa-search-plus",value:"fa-search-plus"},
    {name:"fa-send",value:"fa-send"},
    {name:"fa-send-o",value:"fa-send-o"},
    {name:"fa-share",value:"fa-share"},
    {name:"fa-share-alt",value:"fa-share-alt"},
    {name:"fa-share-alt-square",value:"fa-share-alt-square"},
    {name:"fa-share-square",value:"fa-share-square"},
    {name:"fa-share-square-o",value:"fa-share-square-o"},
    {name:"fa-shield",value:"fa-shield"},
    {name:"fa-shopping-cart",value:"fa-shopping-cart"},
    {name:"fa-sign-in",value:"fa-sign-in"},
    {name:"fa-sign-out",value:"fa-sign-out"},
    {name:"fa-signal",value:"fa-signal"},
    {name:"fa-sitemap",value:"fa-sitemap"},
    {name:"fa-skype",value:"fa-skype"},
    {name:"fa-slack",value:"fa-slack"},
    {name:"fa-sliders",value:"fa-sliders"},
    {name:"fa-smile-o",value:"fa-smile-o"},
    {name:"fa-sort",value:"fa-sort"},
    {name:"fa-sort-alpha-asc",value:"fa-sort-alpha-asc"},
    {name:"fa-sort-alpha-desc",value:"fa-sort-alpha-desc"},
    {name:"fa-sort-amount-asc",value:"fa-sort-amount-asc"},
    {name:"fa-sort-amount-desc",value:"fa-sort-amount-desc"},
    {name:"fa-sort-asc",value:"fa-sort-asc"},
    {name:"fa-sort-desc",value:"fa-sort-desc"},
    {name:"fa-sort-down",value:"fa-sort-down"},
    {name:"fa-sort-numeric-asc",value:"fa-sort-numeric-asc"},
    {name:"fa-sort-numeric-desc",value:"fa-sort-numeric-desc"},
    {name:"fa-sort-up",value:"fa-sort-up"},
    {name:"fa-soundcloud",value:"fa-soundcloud"},
    {name:"fa-space-shuttle",value:"fa-space-shuttle"},
    {name:"fa-spinner",value:"fa-spinner"},
    {name:"fa-spoon",value:"fa-spoon"},
    {name:"fa-spotify",value:"fa-spotify"},
    {name:"fa-square",value:"fa-square"},
    {name:"fa-square-o",value:"fa-square-o"},
    {name:"fa-stack-exchange",value:"fa-stack-exchange"},
    {name:"fa-stack-overflow",value:"fa-stack-overflow"},
    {name:"fa-star",value:"fa-star"},
    {name:"fa-star-half",value:"fa-star-half"},
    {name:"fa-star-half-empty",value:"fa-star-half-empty"},
    {name:"fa-star-half-full",value:"fa-star-half-full"},
    {name:"fa-star-half-o",value:"fa-star-half-o"},
    {name:"fa-star-o",value:"fa-star-o"},
    {name:"fa-steam",value:"fa-steam"},
    {name:"fa-steam-square",value:"fa-steam-square"},
    {name:"fa-step-backward",value:"fa-step-backward"},
    {name:"fa-step-forward",value:"fa-step-forward"},
    {name:"fa-stethoscope",value:"fa-stethoscope"},
    {name:"fa-stop",value:"fa-stop"},
    {name:"fa-strikethrough",value:"fa-strikethrough"},
    {name:"fa-stumbleupon",value:"fa-stumbleupon"},
    {name:"fa-stumbleupon-circle",value:"fa-stumbleupon-circle"},
    {name:"fa-subscript",value:"fa-subscript"},
    {name:"fa-suitcase",value:"fa-suitcase"},
    {name:"fa-sun-o",value:"fa-sun-o"},
    {name:"fa-superscript",value:"fa-superscript"},
    {name:"fa-support",value:"fa-support"},
    {name:"fa-table",value:"fa-table"},
    {name:"fa-tablet",value:"fa-tablet"},
    {name:"fa-tachometer",value:"fa-tachometer"},
    {name:"fa-tag",value:"fa-tag"},
    {name:"fa-tags",value:"fa-tags"},
    {name:"fa-tasks",value:"fa-tasks"},
    {name:"fa-taxi",value:"fa-taxi"},
    {name:"fa-tencent-weibo",value:"fa-tencent-weibo"},
    {name:"fa-terminal",value:"fa-terminal"},
    {name:"fa-text-height",value:"fa-text-height"},
    {name:"fa-text-width",value:"fa-text-width"},
    {name:"fa-th",value:"fa-th"},
    {name:"fa-th-large",value:"fa-th-large"},
    {name:"fa-th-list",value:"fa-th-list"},
    {name:"fa-thumb-tack",value:"fa-thumb-tack"},
    {name:"fa-thumbs-down",value:"fa-thumbs-down"},
    {name:"fa-thumbs-o-down",value:"fa-thumbs-o-down"},
    {name:"fa-thumbs-o-up",value:"fa-thumbs-o-up"},
    {name:"fa-thumbs-up",value:"fa-thumbs-up"},
    {name:"fa-ticket",value:"fa-ticket"},
    {name:"fa-times",value:"fa-times"},
    {name:"fa-times-circle",value:"fa-times-circle"},
    {name:"fa-times-circle-o",value:"fa-times-circle-o"},
    {name:"fa-tint",value:"fa-tint"},
    {name:"fa-toggle-down",value:"fa-toggle-down"},
    {name:"fa-toggle-left",value:"fa-toggle-left"},
    {name:"fa-toggle-right",value:"fa-toggle-right"},
    {name:"fa-toggle-up",value:"fa-toggle-up"},
    {name:"fa-trash-o",value:"fa-trash-o"},
    {name:"fa-tree",value:"fa-tree"},
    {name:"fa-trello",value:"fa-trello"},
    {name:"fa-trophy",value:"fa-trophy"},
    {name:"fa-truck",value:"fa-truck"},
    {name:"fa-try",value:"fa-try"},
    {name:"fa-tumblr",value:"fa-tumblr"},
    {name:"fa-tumblr-square",value:"fa-tumblr-square"},
    {name:"fa-turkish-lira",value:"fa-turkish-lira"},
    {name:"fa-twitter",value:"fa-twitter"},
    {name:"fa-twitter-square",value:"fa-twitter-square"},
    {name:"fa-umbrella",value:"fa-umbrella"},
    {name:"fa-underline",value:"fa-underline"},
    {name:"fa-undo",value:"fa-undo"},
    {name:"fa-university",value:"fa-university"},
    {name:"fa-unlink",value:"fa-unlink"},
    {name:"fa-unlock",value:"fa-unlock"},
    {name:"fa-unlock-alt",value:"fa-unlock-alt"},
    {name:"fa-unsorted",value:"fa-unsorted"},
    {name:"fa-upload",value:"fa-upload"},
    {name:"fa-usd",value:"fa-usd"},
    {name:"fa-user",value:"fa-user"},
    {name:"fa-user-md",value:"fa-user-md"},
    {name:"fa-users",value:"fa-users"},
    {name:"fa-video-camera",value:"fa-video-camera"},
    {name:"fa-vimeo-square",value:"fa-vimeo-square"},
    {name:"fa-vine",value:"fa-vine"},
    {name:"fa-vk",value:"fa-vk"},
    {name:"fa-volume-down",value:"fa-volume-down"},
    {name:"fa-volume-off",value:"fa-volume-off"},
    {name:"fa-volume-up",value:"fa-volume-up"},
    {name:"fa-warning",value:"fa-warning"},
    {name:"fa-wechat",value:"fa-wechat"},
    {name:"fa-weibo",value:"fa-weibo"},
    {name:"fa-weixin",value:"fa-weixin"},
    {name:"fa-wheelchair",value:"fa-wheelchair"},
    {name:"fa-windows",value:"fa-windows"},
    {name:"fa-won",value:"fa-won"},
    {name:"fa-wordpress",value:"fa-wordpress"},
    {name:"fa-wrench",value:"fa-wrench"},
    {name:"fa-xing",value:"fa-xing"},
    {name:"fa-xing-square",value:"fa-xing-square"},
    {name:"fa-yahoo",value:"fa-yahoo"},
    {name:"fa-yen",value:"fa-yen"},
    {name:"fa-youtube",value:"fa-youtube"},
    {name:"fa-youtube-play",value:"fa-youtube-play"},
    {name:"fa-youtube-square",value:"fa-youtube-square"}];


    $scope.colors = [
        "#FFFFFF",
        "#CCCCCC",
        "#FFFF00",
        "#FF0000",
        "#00FF00",
        "#0000FF",
        "#999999",
        "#000000",
        "#000033",
        "#000066",
        "#000099",
        "#0000CC",
        "#003300",
        "#003333",
        "#003366",
        "#003399",
        "#0033CC",
        "#0033FF",
        "#006600",
        "#006633",
        "#006666",
        "#006699",
        "#0066CC",
        "#0066FF",
        "#009900",
        "#009933",
        "#009966",
        "#009999",
        "#0099CC",
        "#0099FF",
        "#00CC00",
        "#00CC33",
        "#00CC66",
        "#00CC99",
        "#00CCCC",
        "#00CCFF",
        "#00FF33",
        "#00FF66",
        "#00FF99",
        "#00FFCC",
        "#00FFFF",
        "#330000",
        "#330033",
        "#330066",
        "#330099",
        "#3300CC",
        "#3300FF",
        "#333300",
        "#333333",
        "#333366",
        "#333399",
        "#3333CC",
        "#3333FF",
        "#336600",
        "#336633",
        "#336666",
        "#336699",
        "#3366CC",
        "#3366FF",
        "#339900",
        "#339933",
        "#339966",
        "#339999",
        "#3399CC",
        "#3399FF",
        "#33CC00",
        "#33CC33",
        "#33CC66",
        "#33CC99",
        "#33CCCC",
        "#33CCFF",
        "#33FF00",
        "#33FF33",
        "#33FF66",
        "#33FF99",
        "#33FFCC",
        "#33FFFF",
        "#660000",
        "#660033",
        "#660066",
        "#660099",
        "#6600CC",
        "#6600FF",
        "#663300",
        "#663333",
        "#663366",
        "#663399",
        "#6633CC",
        "#6633FF",
        "#666600",
        "#666633",
        "#666666",
        "#666699",
        "#6666CC",
        "#6666FF",
        "#669900",
        "#669933",
        "#669966",
        "#669999",
        "#6699CC",
        "#6699FF",
        "#66CC00",
        "#66CC33",
        "#66CC66",
        "#66CC99",
        "#66CCCC",
        "#66CCFF",
        "#66FF00",
        "#66FF33",
        "#66FF66",
        "#66FF99",
        "#66FFCC",
        "#66FFFF",
        "#990000",
        "#990033",
        "#990066",
        "#990099",
        "#9900CC",
        "#9900FF",
        "#993300",
        "#993333",
        "#993366",
        "#993399",
        "#9933CC",
        "#9933FF",
        "#996600",
        "#996633",
        "#996666",
        "#996699",
        "#9966CC",
        "#9966FF",
        "#999900",
        "#999933",
        "#999966",
        "#9999CC",
        "#9999FF",
        "#99CC00",
        "#99CC33",
        "#99CC66",
        "#99CC99",
        "#99CCCC",
        "#99CCFF",
        "#99FF00",
        "#99FF33",
        "#99FF66",
        "#99FF99",
        "#99FFCC",
        "#99FFFF",
        "#CC0000",
        "#CC0033",
        "#CC0066",
        "#CC0099",
        "#CC00CC",
        "#CC00FF",
        "#CC3300",
        "#CC3333",
        "#CC3366",
        "#CC3399",
        "#CC33CC",
        "#CC33FF",
        "#CC6600",
        "#CC6633",
        "#CC6666",
        "#CC6699",
        "#CC66CC",
        "#CC66FF",
        "#CC9900",
        "#CC9933",
        "#CC9966",
        "#CC9999",
        "#CC99CC",
        "#CC99FF",
        "#CCCC00",
        "#CCCC33",
        "#CCCC66",
        "#CCCC99",
        "#CCCCFF",
        "#CCFF00",
        "#CCFF33",
        "#CCFF66",
        "#CCFF99",
        "#CCFFCC",
        "#CCFFFF",
        "#FF0033",
        "#FF0066",
        "#FF0099",
        "#FF00CC",
        "#FF00FF",
        "#FF3300",
        "#FF3333",
        "#FF3366",
        "#FF3399",
        "#FF33CC",
        "#FF33FF",
        "#FF6600",
        "#FF6633",
        "#FF6666",
        "#FF6699",
        "#FF66CC",
        "#FF66FF",
        "#FF9900",
        "#FF9933",
        "#FF9966",
        "#FF9999",
        "#FF99CC",
        "#FF99FF",
        "#FFCC00",
        "#FFCC33",
        "#FFCC66",
        "#FFCC99",
        "#FFCCCC",
        "#FFCCFF",
        "#FFFF33",
        "#FFFF66",
        "#FFFF99",
        "#FFFFCC"];


});