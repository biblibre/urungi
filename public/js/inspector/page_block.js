const module = angular.module('page.block', []);

module.directive('pageBlock', ['$rootScope', '$compile', '$parse', function ($rootScope, $compile, $parse) {
    return {

        restrict: 'A',

        link: function (scope, el, attrs, controller) {
            el.bind('click', function (e) {
                e.preventDefault();
                e.stopPropagation();

                $rootScope.$broadcast('element.reselected', $(el));

                if ($(el).hasClass('editable')) {
                    $(el).attr('contenteditable', 'true');
                    $(el).focus();
                } else {
                    $(el).attr('contenteditable', 'false');
                }
            });

            el.bind('dblclick', function (e) {
                e.stopPropagation();
                scope.elementDblClick($(el));
            });
        }
    };
}]);
