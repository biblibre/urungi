var module = angular.module("intro.help", []);

module.directive('introHelp', ['$rootScope',  '$compile', '$parse','$window', function($rootScope, $compile, $parse, $window) {
	return {
	        restrict: 'A',
            scope: {
                ngIntroMethod: "=",
                ngIntroHelpShow: "=",
                ngIntroExitMethod: "=?",
                ngIntroOptions: '=',
                ngIntroNextMethod: "=?",
                ngIntroAutorefresh: '='
            },
        /*
            template:
                function(scope, el, attrs, controller) {
                    '<div id="introHelpOverlay" class="introjs-overlay"></div>'+
                        '<div id="introHelpCallout" class="callout bottom"><a class="btn" ng-click="goNext()">Next</a> </div>'
                    scope.divToPop = $(document.createElement('div')).attr('class', 'callout bottom').prependTo($(el));

                    var nextBtn = $(document.createElement('a'));
                    nextBtn.attr('class','btn');
                    nextBtn.attr('ngClick', 'goNext()')
                    nextBtn.attr('ng-click','goNext()');
                    scope.divToPop.append(nextBtn);
                },
*/
	        link: function(scope, el, attrs, controller) {

               $window.addEventListener('keydown', function(e) {
                    scope._onKeyDown(e);
                });


                var strElm = '<div id="introHelpOverlay"  class="introjs-overlay"></div>'+
                                '<div id="introHelpCallout" class="panel callout bottom-left">{{intro}}<div id="introHelpCalloutContent"></div>'+
                                    '<div style="position: absolute;bottom: 0;left: 0;width:100%;padding:3px;border-top:1px #999 solid">'+
                                        '<a class="btn btn-primary btn-xs" ng-click="exit()">Close</a>'+
                                        '<a id="introHelpNextBtn" class="btn btn-info btn-xs pull-right"  ng-click="goNext()">Next</a>'+
                                        '<a id="introHelpPreviousBtn" class="btn btn-info btn-xs pull-right"  ng-click="goPrevious()">Previous</a>'+
                                    '</div>'+
                                '</div>'+
                                '<div id="introHelpObjectArea" style="display:none;position:absolute"></div>'

                                ;

                    var divToPop = $compile(strElm) (scope);
                    divToPop.prependTo($(el));//.append(divToPop);
                    $("#introHelpPreviousBtn").hide();




            scope.showHelpForElement = function (theElement) {

                    if ($(theElement).offset()) //Is visible the element?
                        {
                                if (scope.previousElement)
                                    $(scope.previousElement).css({"z-index": 0});

                                $("#introHelpOverlay").show();
                                $("#introHelpObjectArea").hide();

                                var pos = $(theElement).offset();
                                var h = $(theElement).height();
                                var w = $(theElement).width();
                                var elementOffset = _getOffset(theElement);

                                var theWidth = "200px";
                                var theHeight = "100px";

                                if (scope.introElements[scope.actualStep].width)
                                    theWidth = scope.introElements[scope.actualStep].width;
                                if (scope.introElements[scope.actualStep].height)
                                    theHeight = scope.introElements[scope.actualStep].height;


                            //var html = '<iframe width="420" height="315" src="https://www.youtube.com/embed/gqV_63a0ABo" frameborder="0" allowfullscreen></iframe>';

                            $("#introHelpCalloutContent").empty();
                            if (scope.introElements[scope.actualStep].html)
                                {
                                var html = scope.introElements[scope.actualStep].html;
                                var theIntro = $compile(html) (scope);
                                $("#introHelpCalloutContent").append(theIntro);
                                }
                            if (scope.introElements[scope.actualStep].intro)
                                scope.intro = scope.introElements[scope.actualStep].intro;
                                else scope.intro = '';

                            var elementLeft = elementOffset.left + 10;
                            var elementTop = elementOffset.top + elementOffset.height;
                            if (scope.introElements[scope.actualStep].verticalAlign == 'top')
                                elementTop = elementOffset.top;

                            var numericWidth = parseInt(theWidth.replace("px", ""));

                            if (scope.introElements[scope.actualStep].horizontalAlign == 'right')
                                elementLeft = elementOffset.left - numericWidth + elementOffset.width;

                                $("#introHelpCallout").css({ left: elementLeft , top: elementTop, width: theWidth, height: theHeight });
                                $("#introHelpCallout").show();

                            if (scope.introElements[scope.actualStep].objectArea != false)
                                {
                                 var areaColor = "#fff"
                                 if (scope.introElements[scope.actualStep].areaColor)
                                    areaColor = scope.introElements[scope.actualStep].areaColor;

                                 var areaLineColor = "#000"
                                 if (scope.introElements[scope.actualStep].areaColor)
                                    areaLineColor = scope.introElements[scope.actualStep].areaLineColor;

                                    $("#introHelpObjectArea").css({"background-color":areaColor,"z-index":400, left: elementOffset.left, top: elementOffset.top, width: elementOffset.width, height: elementOffset.height,border: "2px "+areaLineColor+" solid"});



                                    $("#introHelpObjectArea").show();
                                    $(theElement).css({"z-index":555});
                                    scope.previousElement = theElement;
                                }

                        }
                    };


            function _getOffset(element) {
                    var elementPosition = {};

                    //set width
                    elementPosition.width = element.outerWidth();

                    //set height
                    elementPosition.height = element.outerHeight();

                    //calculate element top and left
                    var pos=$(element).offset();
                    //set top
                    elementPosition.top = pos.top;
                    //set left
                    elementPosition.left = pos.left;

                    return elementPosition;
                  };

            scope.hideHelp = function()
            {
                scope._cover.remove();
                scope.divToPop.remove();
            }

            scope.ngIntroMethod = function(step) {


                    navigationWatch = scope.$on('$locationChangeStart', function(){

                    });

                    scope.actualStep = 0;

                    if (step)
                        scope.actualStep = step;

                    checkForVisibleElements();

                    var targetElement = $(scope.introElements[scope.actualStep].element);
                    scope.showHelpForElement(targetElement);

                };

                function checkForVisibleElements()
                {
                    scope.introElements = [];
                    for (var i in scope.ngIntroOptions.steps)
                        {
                            if ($(scope.ngIntroOptions.steps[i].element).offset())
                                scope.introElements.push(scope.ngIntroOptions.steps[i]);
                            if (!scope.ngIntroOptions.steps[i].element)
                                scope.introElements.push(scope.ngIntroOptions.steps[i]);
                        }

                }

                scope.goNext = function () {

                    if (scope.actualStep < scope.introElements.length -1)
                        {
                            scope.actualStep = scope.actualStep +1;

                            var targetElement = $(scope.introElements[scope.actualStep].element);
                            scope.showHelpForElement(targetElement);


                            if (scope.actualStep == 0)
                                $("#introHelpPreviousBtn").hide();
                                else
                                $("#introHelpPreviousBtn").show();
                            if (scope.actualStep == scope.introElements.length -1)
                                $("#introHelpNextBtn").hide();
                                else
                                $("#introHelpNextBtn").show();
                        }
                }

                scope.goPrevious = function () {

                    if (scope.actualStep > 0)
                        {
                            scope.actualStep = scope.actualStep -1;

                            var targetElement = $(scope.introElements[scope.actualStep].element);
                            scope.showHelpForElement(targetElement);

                            if (scope.actualStep == 0)
                                $("#introHelpPreviousBtn").hide();
                                else
                                $("#introHelpPreviousBtn").show();

                            if (scope.actualStep == scope.introElements.length -1)
                                $("#introHelpNextBtn").hide();
                                else
                                $("#introHelpNextBtn").show();
                        }
                }

                scope.exit = function()
                {
                    $("#introHelpCallout").hide();
                    $("#introHelpOverlay").hide();
                    $("#introHelpObjectArea").hide();
                }

                scope._onKeyDown = function(e) {
                    if (e.keyCode === 27) {
                       scope.exit();
                    } else if(e.keyCode === 37) {
                      //left arrow
                      scope.goPrevious();
                    } else if (e.keyCode === 39) {
                      //right arrow
                      scope.goNext();
                    }
                  };

            }

    }

}]);
