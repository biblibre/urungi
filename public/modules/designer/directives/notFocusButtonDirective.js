/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 16/12/13
 * Time: 16:57
 * To change this template use File | Settings | File Templates.
 */

var directives = angular.module('nd.notFocusButtonDirective', []);

directives.directive('notFocusButton', function() {
    return {
        restrict: 'A',
        require: '?ngModel',
        link: function(scope, element, attrs, ngModel) {

            element.bind("focusin", function(e) {
                console.log('AQUIIIIIIIII');
                e.stopImmediatePropagation();

            });
        }

    }
});
