(function () {
    'use strict';

    angular.module('app.modal').directive('ndModal', ndModal);

    function ndModal () {
        return {
            restrict: 'E',
            transclude: true,
            scope: {
                id: '@'
            },
            templateUrl: 'partials/modal/modal.nd-modal.directive.html',
            compile: function (element, attrs) {
                element.children('.modal').attr('id', element.attr('id'));
                element.removeAttr('id');

                return function (scope, element, attrs, controller) {

                };
            }
        };
    }
})();
