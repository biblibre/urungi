'use strict';

app.directive('wstWidgetProperties', function($rootScope,$compile,icons,c3Charts) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        description: '@',
        element: '=',
        properties: '=',
        dashboard: '=',
        wstMode: '@'
    },

   templateUrl: "partials/widgets/common.html",

    // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {
        switch (attrs['type']) {
            case "text":
                // append input field to "template"
            case "select":
                // append select dropdown to "template"
        }




      $scope.$watch('element', function(){
          //getElementProperties();
      });

    $scope.faList = icons.faList;
    $scope.imageFilters = [];
    $scope.imageFilters.opacity = 100;

      $scope.changeCSS = function(cssProperty,value)
        {
                    if (cssProperty == '')
                            $rootScope.selectedElement.css(cssProperty,"");
                            else
                            $rootScope.selectedElement.css(cssProperty,value);
        }

      $scope.$watch('backgroundColor', function(){


          if ($scope.gettingElementProperties == false)
              {
                  if ($rootScope.selectedElement)
                    $rootScope.selectedElement.css({'background-color': $scope.backgroundColor});
                  if ($scope.dashboard)
                      $scope.dashboard.backgroundColor = $scope.backgroundColor;
              //saveProperties();
              }
      });


      $scope.$watch('properties', function(){

$scope.gettingElementProperties = true;
                    getElementProperties();
                    if ($scope.properties)
                        {

                            $scope.backgroundColor = $scope.properties.backgroundColor;
                            $scope.backgroundImage = $scope.properties.backgroundImage;
                            $scope.height = $scope.properties.height;
                            $scope.hiddenIn = $scope.properties.hiddenIn;
                            $scope.rowHeight = $scope.properties.rowHeight;
                            $scope.headerRowHeight = $scope.properties.headerRowHeight;
                            $scope.headerBackgroundColor = $scope.properties.headerBackgroundColor;
                            $scope.headerHeight = $scope.properties.headerHeight;
                            $scope.height = $scope.properties.height;

                            //$scope.headerBottomLineColor = $scope.properties.headerBottomLineColor;
                            $scope.headerBottomLineWidth = $scope.properties.headerBottomLineWidth;
                            $scope.rowBottomLineWidth = $scope.properties.rowBottomLineWidth;
                            $scope.rowBorderColor = $scope.properties.rowBorderColor;
                            $scope.columnLineWidth = $scope.properties.columnLineWidth;
                        }
    $scope.gettingElementProperties = false;

      });

    $scope.$watch('properties.headerBottomLineColor', function(){
        if ($scope.gettingElementProperties == false)
            $scope.onChange();
    });

    $scope.$watch('backgroundImage', function(){
        if ($rootScope.selectedElement && $scope.gettingElementProperties == false)
            {
                  var theElement = $rootScope.selectedElement;
                if ($scope.backgroundImage != undefined &&  $scope.backgroundImage != 'none')
                    {
                     theElement.css({ 'background-image': "url('"+$scope.backgroundImage.source1400+"')" });
                     theElement.css({ '-webkit-background-size': 'cover'});
                     theElement.css({ '-moz-background-size': 'cover'});
                     theElement.css({ '-o-background-size': 'cover'});
                     theElement.css({ 'background-size': 'cover'});
                    } else {
                      theElement.css({ 'background-image': 'none' });
                    }

                if ($scope.dashboard)
                    {
                        if ($scope.backgroundImage != undefined &&  $scope.backgroundImage != 'none')
                            $scope.dashboard.backgroundImage = $scope.backgroundImage.source1400;
                        else
                            $scope.dashboard.backgroundImage = 'none';
                    }
            }
      });


    $scope.changeOpacity = function()
    {
        if ($scope.backgroundImage == undefined || $scope.backgroundImage == 'none')
                    {
                    var alpha = $scope.imageFilters.opacity /100;
                    var hex = hexToRgb($scope.backgroundColor);
                    var r = hex.r;
                    var g = hex.g;
                    var b = hex.b;
                    $rootScope.selectedElement.css({'background-color': 'rgba('+r+','+g+','+b+',' + alpha + ')'});
                    } else {
                        if ($scope.imageFilters.opacity != 0)
                          {
                            var theElement = $rootScope.selectedElement;

                            theElement.css("filter"," opacity("+$scope.imageFilters.opacity+"%) ");
                            theElement.css("webkitFilter"," opacity("+$scope.imageFilters.opacity+"%) ");
                            theElement.css("mozFilter"," opacity("+$scope.imageFilters.opacity+"%) ");
                            theElement.css("oFilter"," opacity("+$scope.imageFilters.opacity+"%) ");
                            theElement.css("msFilter"," opacity("+$scope.imageFilters.opacity+"%) ");
                          }

                        //filter: alpha(Opacity=30); opacity: 0.3;
                        //TODO: problem with opacity for background images  go to https://scotch.io/tutorials/how-to-change-a-css-background-images-opacity
                    }
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

    $scope.$watch('fontColor', function(){
        if ($rootScope.selectedElement && $scope.gettingElementProperties == false)
          $rootScope.selectedElement.css({ 'color': $scope.fontColor }) ;
      });

    $scope.changeRowHeight = function(newHeight)
    {
       $scope.rowHeight = newHeight;
        //saveProperties();
    }

    $scope.changeHeaderBackgroundcolor = function(headerBackgroundColor)
    {
        $scope.headerBackgroundColor = headerBackgroundColor;

    }

    $scope.changeHeaderHeight = function(headerHeight)
    {
        $scope.headerHeight = headerHeight;
        //saveProperties();
    }

    $scope.deleteSelected = function()
    {


        var elementID = $rootScope.selectedElement.attr('id');

          if ($rootScope.selectedElementType == 'tabsContainer')
            {
            var containerNbr = -1;

            for (var c in $scope.selectedDashboard.containers)
                if ($scope.selectedDashboard.containers[c].id == elementID)
                    containerNbr = c;

            if (containerNbr > -1)
               $scope.selectedDashboard.containers.splice(containerNbr,1);

            }

        $rootScope.selectedElement.remove();

    }

    $scope.changeHeight = function(newHeight)
    {
        if ($rootScope.selectedElementType  == 'c3Chart')
           {
            if ($scope.selectedChart)
            {
            $scope.selectedChart.chartCanvas.resize({height:newHeight});
            $scope.selectedChart.height = newHeight;
            }
            } else {
                    if (newHeight == '')
                        $rootScope.selectedElement.css("height","");
                        else
                        $rootScope.selectedElement.css("height",newHeight);

            }

        $scope.height = newHeight;
        //saveProperties();
    }

    $scope.changeHeaderBottomLineWidth = function(headerBottomLineWidth)
    {
        $scope.headerBottomLineWidth = headerBottomLineWidth;
        //saveProperties();
    }


    $scope.changeRowBottomLineWidth = function(rowBottomLineWidth)
    {
        $scope.rowBottomLineWidth = rowBottomLineWidth;
        //saveProperties();
    }

    $scope.changeRowBorderColor = function(rowBorderColor)
    {
        $scope.rowBorderColor = rowBorderColor;
        //saveProperties();
    }


    $scope.changeColumnLineWidth = function(columnLineWidth)
    {
        $scope.columnLineWidth = columnLineWidth;
        //saveProperties();
    }

    $scope.saveProperties = function()
    {
        saveProperties();
    }

    $scope.propertyChanged = function()
    {

    }

    function saveProperties()
        {


        }


    $scope.moveElementUp = function()
    {
       var theElement = $rootScope.selectedElement;

       var selected = $(theElement).index();

       var parent = $(theElement).parent();

       $(parent).children().eq(selected-1).before($(parent).children().eq(selected));
    }

    $scope.moveElementDown = function()
    {
       var theElement = $rootScope.selectedElement;

       var selected = $(theElement).index();

       var parent = $(theElement).parent();

       $(parent).children().eq(selected+1).after($(parent).children().eq(selected));
    }


    $scope.changeHiddenIn = function(values)
    {


            if($rootScope.selectedElementType != 'page')
            {

            if ($scope.visibleXS == true)
                {
                    $rootScope.selectedElement.addClass('visible-xs');
                } else {
                    $rootScope.selectedElement.removeClass('visible-xs');
                }

            if ($scope.visibleSM == true)
                {
                    $rootScope.selectedElement.addClass('visible-sm');
                } else {
                $rootScope.selectedElement.removeClass('visible-sm');
                }
            if ($scope.visibleMD == true)
                {
                    $rootScope.selectedElement.addClass('visible-md');
                } else {
                $rootScope.selectedElement.removeClass('visible-md');
                }
            if ($scope.visibleLG == true)
                {
                    $rootScope.selectedElement.addClass('visible-lg');
                } else {
                $rootScope.selectedElement.removeClass('visible-lg');
                }
            if ($scope.visiblePrint == true)
                {
                    $rootScope.selectedElement.addClass('visible-print');
                } else {
                $rootScope.selectedElement.removeClass('visible-print');
                }

                if ($scope.hiddenXS == true)
                {
                    $rootScope.selectedElement.addClass('hidden-xs');
                } else {
                    $rootScope.selectedElement.removeClass('hidden-xs');
                }

                if ($scope.hiddenSM == true)
                {
                    $rootScope.selectedElement.addClass('hidden-sm');
                } else {
                    $rootScope.selectedElement.removeClass('hidden-sm');
                }
                if ($scope.hiddenMD == true)
                {
                    $rootScope.selectedElement.addClass('hidden-md');
                } else {
                    $rootScope.selectedElement.removeClass('hidden-md');
                }
                if ($scope.hiddenLG == true)
                {
                    $rootScope.selectedElement.addClass('hidden-lg');
                } else {
                    $rootScope.selectedElement.removeClass('hidden-lg');
                }
                if ($scope.hiddenPrint == true)
                {
                    $rootScope.selectedElement.addClass('hidden-print');
                } else {
                    $rootScope.selectedElement.removeClass('hidden-print');
                }

                }
    }

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

    $scope.changeChartColumnType = function(column,type)
    {
        column.type = type;
        c3Charts.transformChartColumnType($scope.properties.chart,column);
    }

    $scope.changeChartColumnColor = function(chart,column,color)
    {
        c3Charts.changeChartColumnColor($scope.properties.chart,column,hexToRgb(color));
    }

    function getElementProperties()
    {

        $rootScope.selectedElementType = '';
        $rootScope.selectedElement = $scope.element;

        if ($scope.element)
            {
                if ($scope.element.css('background-color') != 'rgba(0, 0, 0, 0)') {
                        $scope.BackgroundColor = rgb2hex($scope.element.css('background-color'));
                    } else {
                        $scope.BackgroundColor = 'Transparent';
                    }

                if ($scope.element.css('color') != 'rgba(0, 0, 0, 0)') {
                        $scope.fontColor = rgb2hex($scope.element.css('color'));
                    } else {
                        $scope.fontColor = 'Transparent';
                    }

                $scope.objectHeight = parseInt($scope.element.css('height'));

                $scope.objectMargin = parseInt($scope.element.css('margin'));
                $scope.objectMarginLeft = parseInt($scope.element.css('margin-left'));
                $scope.objectMarginRight= parseInt($scope.element.css('margin-right'));
                $scope.objectMarginTop = parseInt($scope.element.css('margin-top'));
                $scope.objectMarginBottom = parseInt($scope.element.css('margin-bottom'));

                $scope.objectPadding = parseInt($scope.element.css('padding'));
                $scope.objectPaddingLeft = parseInt($scope.element.css('padding-left'));
                $scope.objectPaddingRight= parseInt($scope.element.css('padding-right'));
                $scope.objectPaddingTop = parseInt($scope.element.css('padding-top'));
                $scope.objectPaddingBottom = parseInt($scope.element.css('padding-bottom'));

                var elementType = $scope.element.attr('ndType');

                $rootScope.selectedElementType = elementType;


                //visibility Properties
                    if ($scope.element.hasClass('hidden-lg') == true )
                    {
                        $scope.hiddenLG = true;
                    } else {
                        $scope.hiddenLG = false;
                    }
                    if ($scope.element.hasClass('hidden-md') == true )
                    {
                        $scope.hiddenMD = true;
                    } else {
                        $scope.hiddenMD = false;
                    }
                    if ($scope.element.hasClass('hidden-sm') == true )
                    {
                        $scope.hiddenSM = true;
                    } else {
                        $scope.hiddenSM = false;
                    }
                    if ($scope.element.hasClass('hidden-xs') == true )
                    {
                        $scope.hiddenXS = true;
                    } else {
                        $scope.hiddenXS = false;
                    }
                    if ($scope.element.hasClass('hidden-print') == true )
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

                    var chartID = $scope.element.attr('bindto-id');

                    $scope.selectedChart = $scope.properties;

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

            }

    }


    }
  }



});

