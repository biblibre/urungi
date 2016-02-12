

var module = angular.module("page.block", []);

module.directive('pageBlock', ['$rootScope',  '$compile','$parse', function($rootScope, $compile, $parse) {
	return {

	        restrict: 'A',

	        link: function(scope, el, attrs, controller) {

	            el.bind("click", function(e) {


                        e.preventDefault();
                        e.stopPropagation();

                        if (scope.selectedElement != null)
                        {
                            scope.selectedElement.removeClass('selected');
                            scope.selectedElement.attr("contenteditable", "false");
                        }

                        $(el).addClass('selected');
                        scope.selectedElement = $(el);

                        //console.log('page-block selected bind click'+ scope.selectedElement);




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
                        //var invoker = $parse(attrs.onSelect);
                        //invoker(scope, {selectedEl: $(el)} );
                        scope.$apply();



                        //scope.isSelected = true;
                        //scope.showTab(1);
                        //scope.$apply(function () {

                        //});
                        //console.log('element selected bc '+selectedElement.attr('id'));
                        scope.getElementProperties($(el));
                   // } else {
                       // scope.editMode = false;
                        //console.log('edit mode =TRUE '+ scope.selectedElement);
                   // }

                });

                el.bind("dblclick", function(e) {
                    e.stopPropagation();
                    scope.elementDblClick($(el));
                });

	        }
	}

}]);