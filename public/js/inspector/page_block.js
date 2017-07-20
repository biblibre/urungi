var module = angular.module("page.block", []);


module.directive('pageBlock', ['$rootScope',  '$compile','$parse', function($rootScope, $compile, $parse) {
	return {

	        restrict: 'A',

	        link: function(scope, el, attrs, controller) {

	            el.bind("click", function(e) {

                        e.preventDefault();
                        e.stopPropagation();

                        $rootScope.$broadcast('element.reselected', $(el));


                        if ($(el).hasClass("editable"))
                        {
                                $rootScope.editMode = true;
                                $(el).attr("contenteditable", "true");
                                $(el).focus();
                        } else {
                            $rootScope.editMode = false;
                            $(el).attr("contenteditable", "false");
                        }
                        $rootScope.$emit("SELECTED");
                });

                el.bind("dblclick", function(e) {
                    e.stopPropagation();
                    scope.elementDblClick($(el));
                });

	        }
	}

}]);
