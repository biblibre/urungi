angular.module('app').directive('ndModal', function (connection, $timeout) {
    return {
        restrict: 'E',
        transclude: true,
        scope: {
            id: '@'
        },
        templateUrl: '/partials/directives/modal.html',
        compile: function (element, attrs) {
            element.children('.modal').attr('id', element.attr('id'));
            element.removeAttr('id');

            return function (scope, element, attrs, controller) {

            };
        }
    };
});
