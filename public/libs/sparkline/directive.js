/**
 * Created with JetBrains WebStorm.
 * User: hermenegildoromero
 * Date: 26/01/15
 * Time: 11:16
 * To change this template use File | Settings | File Templates.
 */

angular.module('sparkline', []);

angular.module('sparkline')
    .directive('jqSparkline', [function () {
        'use strict';
        return {
            restrict: 'A',
            require: 'ngModel',
            link: function (scope, elem, attrs, ngModel) {

                var opts={};
                //TODO: Use $eval to get the object
                opts.type = attrs.type || 'line';

                scope.$watch(attrs.ngModel, function () {
                    render();
                });

                scope.$watch(attrs.opts, function(){
                        render();
                    }
                );
                var render = function () {
                    var model;
                    if(attrs.opts) angular.extend(opts, angular.fromJson(attrs.opts));
                    console.log(opts);
                    // Trim trailing comma if we are a string
                    angular.isString(ngModel.$viewValue) ? model = ngModel.$viewValue.replace(/(^,)|(,$)/g, "") : model = ngModel.$viewValue;
                    var data;
                    // Make sure we have an array of numbers
                    angular.isArray(model) ? data = model : data = model.split(',');
                    $(elem).sparkline(data, opts);
                };
            }
        }
    }]);
