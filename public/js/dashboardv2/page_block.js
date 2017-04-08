

var module = angular.module("page.block", []);

module.directive('pageBlock', ['$rootScope',  '$compile','$parse', function($rootScope, $compile, $parse) {
	return {

	        restrict: 'A',

	        link: function(scope, el, attrs, controller) {

	            el.bind("click", function(e) {


                        e.preventDefault();
                        e.stopPropagation();

                        if ($rootScope.selectedElement != null)
                        {
                            $rootScope.selectedElement.removeClass('selected');
                            $rootScope.selectedElement.attr("contenteditable", "false");
                        }

                        $(el).addClass('selected');
                        $rootScope.selectedElement = $(el);

                        if ($(el).hasClass("editable"))
                        {
                            scope.$apply(function () {
                                scope.editMode = true;
                                $(el).attr("contenteditable", "true");
                                $(el).focus();
                            });
                        } else {
                            scope.editMode = false;
                            $(el).attr("contenteditable", "false");
                        }
                        $rootScope.$emit("SELECTED");
                        scope.$apply();

                        var elementID = $(el).attr("id");
                        scope.getElementProperties($(el),elementID);

                });

                el.bind("dblclick", function(e) {
                    e.stopPropagation();
                    scope.elementDblClick($(el));
                });

	        }
	}

}]);
