/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 13/12/13
 * Time: 19:39
 * To change this template use File | Settings | File Templates.
 */
var module = angular.module("ui.ColorPicker", []);

module.directive('uiColorpicker', function() {
    return {
        restrict: 'E',
        require: 'ngModel',
        scope: false,
        replace: true,
        template: "<span><input class='input-small' /></span>",
        link: function(scope, element, attrs, ngModel) {
            var input = element.find('input');
            var options = angular.extend({
                color: ngModel.$viewValue,
                change: function(color) {
                    scope.$apply(function() {
                        ngModel.$setViewValue(color.toHexString());
                    });
                }
            }, scope.$eval(attrs.options));

            ngModel.$render = function() {
                input.spectrum('set', ngModel.$viewValue || '');
            };

            input.spectrum(options);
        }
    };
});
