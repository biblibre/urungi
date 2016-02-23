app.controller('pagesCtrl', function ($scope, queryService, connection, $routeParams, queryModel, grid, c3Charts,uuid2, icons,colors,htmlWidgets,promptModel ) {
    $scope.reportModal = 'partials/pages/queryEdit.html';
    $scope.chartModal = 'partials/pages/chartModal.html';
    $scope.publishModal  = 'partials/report/publishModal.html';
    $scope.queries = [];
    $scope.charts = [];
    $scope.elements = {};
    $scope.elements.repeaters = [];
    $scope.pageID = $routeParams.pageID;
    $scope.lastElementID = 0;
    $scope.dataPool = [];
    $scope.faList = icons.faList;
    $scope.colors = colors.colors;
    $scope.hiddenXS = false;
    $scope.hiddenSM = false;
    $scope.hiddenMD = false;
    $scope.hiddenLG = false;
    $scope.hiddenPrint = false;


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
        $scope.editingQuery = null;
    }

    $scope.initForm = function() {
        $scope.dataMode = 'preview';
        if ($routeParams.newPage == 'true') {
            $scope.selectedPage = {pageName:"New PAGE", backgroundColor:"#999999" ,items:[],properties:{},pageType:'DEFAULT'};
            $scope.mode = 'add';
        } else {
            if ($scope.pageID)
            {
                connection.get('/api/pages/get/'+$scope.pageID, {id: $scope.pageID}, function(data) {
                    $scope.selectedPage = data.item;
                    if (!$scope.selectedPage.properties.containers)
                            $scope.selectedPage.properties.containers = [];
                    //console.log('the page definition',  JSON.stringify($scope.selectedPage));

                    $scope.queries = $scope.selectedPage.properties.queries;
                    $scope.charts = $scope.selectedPage.properties.charts;
                    //Assign the correct query to every chart

                    $scope.getPrompts();

                    for (var ch in $scope.charts)
                    {
                        for (var qu in $scope.queries)
                        {
                            if ($scope.charts[ch].queryName == $scope.queries[qu].name)
                                $scope.charts[ch].query = $scope.queries[qu];
                        }
                    }

                    $scope.lastElementID = $scope.charts.length;

                    $('#designArea').css({ 'background-color': $scope.selectedPage.backgroundColor}) ;


                    getQueryData($scope,0,function(){
                        console.log('before rebuild charts');
                        rebuildCharts();
                    });

                    getAllPageColumns();

                    var $div = $($scope.selectedPage.properties.designerHTML);
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
                    $scope.selectedPage = data.item;
                    $scope.queries = $scope.selectedPage.properties.queries;
                    $scope.charts = $scope.selectedPage.properties.charts;
                    if (!$scope.selectedPage.properties.containers)
                            $scope.selectedPage.properties.containers = [];

                    //Assign the correct query to every chart

                    for (var ch in $scope.charts)
                    {
                        for (var qu in $scope.queries)
                        {
                            if ($scope.charts[ch].queryName == $scope.queries[qu].name)
                                $scope.charts[ch].query = $scope.queries[qu];
                        }
                    }

                    getQueryData($scope,0,function(){
                        rebuildCharts();
                    });

                    $('#pageViewer').css({ 'background-color': $scope.selectedPage.backgroundColor}) ;

                    getAllPageColumns();

                    var $div = $($scope.selectedPage.html);
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

        if ($scope.editingQuery == null)
        {
            qstructure.name = 'query'+($scope.queries.length +1);
            qstructure.id = uuid2.newguid();
            $scope.queries.push(qstructure);

        } else {

            for (var q in $scope.queries)
            {
                if ($scope.queries[q].name == $scope.editingQuery)
                {
                    qstructure.name = $scope.editingQuery;
                    $scope.queries[q] = qstructure;
                }
            }

        }

        $scope.queryInterface = false;
        getAllPageColumns();
    }

    $scope.deleteQuery = function()
    {
        var theQuery = -1;
        for (var q in $scope.queries)
            {
                if ($scope.queries[q].name == $scope.editingQuery)
                {
                    theQuery = q;
                }
            }
        if (theQuery > -1)
        {
            console.log('deleting the query',theQuery)
            $scope.queries.splice(theQuery,1);
        }
        $scope.queryInterface = false;
    }

    $scope.loadQS = function(query)
    {
        console.log('loading existing query: '+query.name)
        $scope.queryInterface = true;
        $scope.editingQuery = query.name;
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

        if (customObjectData.objectType == 'divider') {
            console.log('divider added');
            var html = htmlWidgets.getDivider();
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

        if (customObjectData.objectType == 'queryFilter') {
            console.log('queryFilter added');
            var html = '<div page-block class="container-fluid ndContainer" ndType="container">'+getPromptsHTML(customObjectData)+'</div>';
            createOnDesignArea(html,function(){});
        }


        if (customObjectData.objectType == 'tabs') {
            console.log('tabs added');
            var theid = 'TABS_'+uuid2.newguid();
            var theTabs = [{label:'tab1',active:true,id:uuid2.newguid()},{label:'tab2',active:false,id:uuid2.newguid()},{label:'tab3',active:false,id:uuid2.newguid()},{label:'tab4',active:false,id:uuid2.newguid()}]
            var tabsElement = {id:theid,type:'tabs',properties:{tabs:theTabs}};
            $scope.selectedPage.properties.containers.push(tabsElement);

            var html = getTabsHTML(theid,theTabs);
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


    function getPromptsHTML(filter,promptNumber)
    {

            var theFieldName = filter.collectionID+'_'+filter.elementName;

            filter.fieldName = theFieldName.toLowerCase();
/*
                return '<div class="input-group" style="width:300px;">'+
                       '<input type="text" class="form-control no-right-border form-focus-green ng-pristine ng-untouched ng-valid" ng-model="filter.filterText1">'+
                        //<!--TODO: para el in -not in como select2, pero con los valores introducidos manualmente ver ejemplo en: http://stackoverflow.com/questions/29489821/allow-manually-entered-text-in-ui-select-->
                        //<!--<select multiple="" data-role="tagsinput" style="display: none;"></select>  http://timschlechter.github.io/bootstrap-tagsinput/examples/bootstrap-2.3.2.html-->
                       '          <span class="input-group-btn">'+
                       '             <button class="btn btn-primary popover-primary ng-scope" popover-trigger="mouseenter" popover-placement="bottom" popover-title="Select distinct values" popover="Click here to select one or more from the distinct values that can currently be found in the database" ng-click="getDistinctValues(\''+filter.elementID+'\')"><i class="fa fa-search"></i></button>'+
                       '        </span>'+
                        '</div>';
*/

                return  '<div class="form-group" ng-init="getDistinctValues(\''+filter.elementID+'\')">'+
						'<label class="col-sm-2 control-label">'+filter.promptTitle+'</label>'+
						'<div class="col-sm-10">'+
						'	<select class="form-control" ng-model="lastPromptSelectedValue" ng-change="promptChanged(\''+filter.elementID+'\')">'+
						'		<option value="{{record[\''+filter.fieldName+'\']}}" ng-repeat="record in getPrompt(\''+filter.elementID+'\').data">{{record[\''+filter.fieldName+'\']}}</option>'+
						'	</select>'+
						'</div>'+
					'</div>';
    }

    $scope.getDistinctValues = function(elementID)
    {
        for (var p in $scope.prompts)
        {
        if ($scope.prompts[p].elementID == elementID)
            //promptModel.getDistinctValues($scope,$scope.prompts[p]);
            queryModel.getDistinct($scope,$scope.prompts[p]);
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

    $scope.promptChanged = function(elementID)
    {
        console.log('selected value',$scope.lastPromptSelectedValue);

        for (var p in $scope.prompts)
            {
            if ($scope.prompts[p].elementID == elementID)
                {
                    $scope.prompts[p].searchValue = $scope.lastPromptSelectedValue;
                    $scope.prompts[p].filterText1 = $scope.lastPromptSelectedValue;

                    for (var q in $scope.selectedPage.properties.queries)
                    {
                        //console.log('getting data for query',$scope.prompts[p],$scope.selectedPage.properties.queries[q]);
                        promptModel.updatePromptsForQuery($scope,$scope.selectedPage.properties.queries[q],$scope.prompts[p], function(){

                            console.log('updated query',$scope.prompts[p],$scope.selectedPage.properties.queries[q]);
                        });


                    }
                    /*for (var q in $scope.queries)
                        {
                        if ($scope.queries[q].id == $scope.prompts[p].queryID)
                              queryModel.getQueryData($scope,$scope.queries[q].query, function(data)
                                    {
                                        $scope.queries[q].data = data;
                                        console.log('New data is comming');
                                    });
                        }*/

                    //getQueryData($scope,0,function(){
                    //    rebuildCharts();
                    //});
/*
queryModel.getQueryData($scope,$scope.selectedPage.properties.queries[0], function(data)
                                    {
                                        $scope.selectedPage.properties.queries[q].data = data;
                                        console.log('New data is comming');
                                        rebuildCharts();
                                    });
*/
                }
            }

    }

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

        if (customObjectData.objectType == 'image') {

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

        console.log('on drop entered...',customObjectData);

        if (customObjectData.objectType == 'queryColumn') {
            console.log('query column added',chartCode,customObjectData.queryName);
                for (var i in $scope.charts)
                {
                    if ($scope.charts[i].chartID == chartCode)
                        {
                        console.log('initializing chart 0',$scope.charts[i]);
                        if (!$scope.charts[i].dataColumns || $scope.charts[i].dataColumns.length == 0)
                            {
                                console.log('initializing chart for query',customObjectData.queryName);
                                $scope.charts[i].dataColumns = [];

                                for (var q in $scope.queries)
                                    {
                                    if ($scope.queries[q].name == customObjectData.queryName)
                                        {
                                        //$scope.charts[i].data = $scope.queries[q].data;
                                        $scope.charts[i].query = $scope.queries[q];
                                        $scope.charts[i].queryName = $scope.queries[q].name;
                                        console.log('query assigned to chart...');
                                        }
                                    }
                            }


                            if ($scope.charts[i].queryName == customObjectData.queryName)
                            {
                                    console.log('query column',$scope.charts[i].query,$scope.charts[i].data);
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

                                    //data hay que meterlo en el chart para que quede claro de donde recibe los datos



                                    c3Charts.rebuildChart($scope.charts[i]);


                            } else {
                                var errorMsg = 'This element is not allowed here...is not in the same query, please select an element that belongs to the same query or reinit the chart prior to assign this element.';
                                console.log(errorMsg);
                                noty({text: errorMsg,  timeout: 6000, type: 'error'});
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
        $scope.tabs.selected = 'settings';
        $scope.selectedElementType = '';

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



        if (elementType === 'page')
        {


        }

        if (elementType === 'c3Chart')
        {

            var chartID = theElement.attr('bindto-id');
            //console.log('editing chart:',chartID);
            for (var i in $scope.charts)
            {
                if ($scope.charts[i].chartID == chartID)
                    {
                        $scope.selectedChart = $scope.charts[i];
                        $scope.objectHeight = $scope.selectedChart.height;
                        console.log('aqui');
                    }
            }
        }

        if (elementType === 'tabsContainer')
        {

            var tabsContainerID = theElement.attr('id');

            for (var i in $scope.selectedPage.properties.containers)
            {
                if ($scope.selectedPage.properties.containers[i].id == tabsContainerID)
                    {
                        $scope.selectedTabContainer = $scope.selectedPage.properties.containers[i];
                        $scope.objectHeight = $scope.selectedTabContainer.height;

                    }
            }
        }

        if (elementType == 'repeaterGrid')
        {

        }

        $scope.$apply();
    }

    $scope.deleteChartColumn = function(chart,column)
    {
        c3Charts.deleteChartColumn(chart,column)
    }

    $scope.changeBackgroundColor = function(color)
    {
        $scope.selectedElement.css({ 'background-color': color }) ;
        $scope.BackgroundColor = color;

        if ($scope.selectedElementType == 'page')
            $scope.selectedPage.backgroundColor = color;

         //console.log('background color changed',color);
    }

    $scope.changeFontColor = function(color)
    {
        $scope.selectedElement.css({ 'color': color }) ;
        $scope.FontColor = color;
    }

    $scope.changeChartColumnType = function(chart,column)
    {
        c3Charts.changeChartColumnType(chart,column)
    }

    $scope.deleteSelected = function()
    {
        var elementID = $scope.selectedElement.attr('id');

        if ($scope.selectedElementType == 'container' || $scope.selectedElementType == 'tabsContainer')
            {
            var containerNbr = -1;

            for (var c in $scope.selectedPage.properties.containers)
                if ($scope.selectedPage.properties.containers[c].id == elementID)
                    containerNbr = c;

            if (containerNbr > -1)
               $scope.selectedPage.properties.containers.splice(containerNbr,1);

            }

        $scope.selectedElement.remove();

        $scope.tabs.selected = 'data';
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
        return htmlWidgets.getJumbotronHTML();
    }

    function get3colsctaHTML()
    {
        return htmlWidgets.get3colsctaHTML();
    }

    function getImageTextLargeHTML()
    {
        return htmlWidgets.getImageTextLargeHTML();
    }

    function getTabsHTML(id,tabs)
    {
        return htmlWidgets.getTabsHTML(id,tabs);
    }

    $scope.getTabs = function(id)
    {
        for (var c in $scope.selectedPage.properties.containers)
            {
            if ($scope.selectedPage.properties.containers[c].id == id)
                {
                    return $scope.selectedPage.properties.containers[c].properties.tabs;

                }

            }

    }

    $scope.selectThisTab = function(tabsID,id)
    {

      for (var t in $scope.selectedPage.properties.containers)
      {
        if ($scope.selectedPage.properties.containers[t].id == tabsID)
            {
            var actualSelectedTab = $scope.selectedPage.properties.containers[t].actualSelectedTab;
            var actualHeaderID = '#'+actualSelectedTab+'_HEADER';
            var actualBodyID = '#'+actualSelectedTab+'_BODY';
            $(actualHeaderID).removeClass('active');
            $(actualBodyID).removeClass('active');

            $scope.selectedPage.properties.containers[t].actualSelectedTab = id;
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

    function getRepeaterHTML(theRepeaterID)
    {
        return  '<div page-block ndType="repeaterGrid" id="'+theRepeaterID+'" drop="onDropOnRepeater($data, $event, \''+theRepeaterID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']" style="height:500px;overflow:hidden;"></div>';

    }

    function getChartHTML()
    {
        var theChartID = 'Chart'+uuid2.newguid();
        $scope.charts.push({chartID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300});

        return c3Charts.getChartHTML(theChartID);
    }

    function getQueryFilterHTML()
    {


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
                if ($scope.charts[i].chartID == chartID)
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


    $scope.onChartSelectedObjectChanged = function(datacolumn)
    {
         //dataColumn.object = $scope.selectedObject;
    }


    $scope.onChartPropertiesChanged = function(object)
    {
        c3Charts.onChartPropertiesChanged($scope,object);

    }

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
            $scope.selectedPage.backgroundImage = backgroundImage.source1400;

         //console.log('background image changed',backgroundImage.source1400);

    }

    $scope.changeBackgroundFilter = function() {

        var theElement = $scope.selectedElement;


        var styleValue = '';

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
        if ($scope.imageFilters.opacity != 0)
            styleValue = styleValue + " opacity("+$scope.imageFilters.opacity+"%) ";


        theElement.css("filter",styleValue);
        theElement.css("webkitFilter",styleValue);
        theElement.css("mozFilter",styleValue);
        theElement.css("oFilter",styleValue);
        theElement.css("msFilter",styleValue);

    }

$scope.changeVisibility = function() {



    if($scope.selectedElementType != 'page')
    {
    console.log('Change visibility')
    //visibility properties

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
    }


    $scope.pageName = function () {
        $('#pageNameModal').modal('show');
    };
    $scope.pageNameSave = function () {

        $('#pageNameModal').modal('hide');
        $scope.savePage();

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
           // console.log('query columns',JSON.stringify($scope.queries[i].columns));
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
        //console.log('entering save Page...',JSON.stringify($scope.selectedPage));
        cleanAllSelected();
        var page = $scope.selectedPage;
        //{pageName:"New PAGE", backgroundColor:"#999999" ,items:[],properties:{},pageType:'DEFAULT'};
        //All the dashboard's staff...

        page.properties.queries = $scope.queries;
        var cleanedCharts = [];

        for (var i in $scope.charts)
        {
            var theChart = clone($scope.charts[i]);
            theChart.chartCanvas = undefined;
            theChart.data = undefined;
            //theChart.queryName = theChart.query.name;
            theChart.query = undefined;

            var targetChart = document.getElementById(theChart.chartID);

            if (targetChart != undefined)
                cleanedCharts.push(theChart);

        }

        for (var i in $scope.queries)
        {
        $scope.queries[i].data = undefined;
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

            $('#previewContainer').children().remove();

                    var $div = $(theHTML);
                    previewContainer.append($div);
                    angular.element(document).injector().invoke(function($compile) {
                        var scope = angular.element($div).scope();
                        $compile($div)($scope);
                    });

        cleanAll();

        page.html = previewContainer.html();



        if ($scope.mode == 'add') {

            connection.post('/api/pages/create', page, function(data) {
                if (data.result == 1) {
                    //$scope.goBack();
                }
            });

        } else {
        console.log('saving edit');
            connection.post('/api/pages/update/'+$scope.pageID, page, function(result) {
                if (result.result == 1) {
                    //$scope.goBack();
                    console.log('saved',page);
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

        if (!$scope.queries[index].id)
            $scope.queries[index].id = uuid2.newguid();

            queryModel.getQueryData($scope,$scope.queries[index].query, function(data)
            {
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
                console.log('query names',$scope.queries[q].name,theChart)
                //var queryName = $scope.queries[q].ddname;
                if ($scope.queries[q].name == theChart.query)
                    {
                    //console.log('is equal',$scope.queries[q].data);
                    theChart.query = $scope.queries[q];
                    }
            }
            //console.log('rebuilding chart',theChart.chartID)
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

    $scope.publishPage = function()
    {
        $scope.objectToPublish = $scope.selectedPage;
        $('#publishModal').modal('show');
    }

    $scope.unPublish = function()
    {
        connection.post('/api/pages/unpublish', {_id:$scope.selectedPage._id}, function(data) {
            $scope.selectedPage.isPublic = false;
            $('#publishModal').modal('hide');
        });
    }

    $scope.selectThisFolder = function(folderID)
    {
        connection.post('/api/pages/publish-page', {_id:$scope.selectedPage._id,parentFolder:folderID}, function(data) {
            $scope.selectedPage.parentFolder = folderID;
            $scope.selectedPage.isPublic = true;
            $('#publishModal').modal('hide');
        });
    }

    $scope.delete = function (pageID, pageName) {
        $scope.modalOptions = {};
        $scope.modalOptions.headerText = 'Confirm delete page'
        $scope.modalOptions.bodyText = 'Are you sure you want to delete the page:'+' '+pageName;
        $scope.modalOptions.ID = pageID;
        $('#deleteModal').modal('show');
    };

    $scope.deleteConfirmed = function (pageID) {
        connection.post('/api/pages/delete/'+pageID, {id:pageID}, function(result) {
            if (result.result == 1) {
                $('#deleteModal').modal('hide');

                var nbr = -1;
                for (var i in $scope.pages.items)
                {
                    if ($scope.pages.items[i]._id === pageID)
                        nbr = i;
                }

                if (nbr > -1)
                    $scope.pages.items.splice(nbr,1);
            }
        });


    };

    $scope.getPrompts = function()
    {
        for (var q in $scope.selectedPage.properties.queries)
        {

            promptModel.getPromptsForQuery($scope, $scope.selectedPage.properties.queries[q]);
        }

        console.log('the prompts',$scope.prompts)

    }

});