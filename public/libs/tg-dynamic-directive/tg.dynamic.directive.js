angular.module('tg.dynamicDirective', [])
    .directive('tgDynamicDirective', ['$compile',
        function($compile) {
            'use strict';

            function templateUrlProvider(getView, ngModelItem) {
                if (getView) {
                    if (typeof getView === 'function') {
                        var templateUrl = getView(ngModelItem) || '';
                        if (templateUrl) {
                            return templateUrl;
                        }
                    } else if (typeof getView === 'string' && getView.length) {
                        return getView;
                    }
                }
                return '';
            }

            return {
                restrict: 'E',
                require: '^ngModel',
                scope: true,
                template: '<div ng-include="templateUrl"></div>',
                link: function(scope, element, attrs, ngModel) {
                    var ngModelItem = scope.$eval(attrs.ngModel);
                    var getView = scope.$eval(attrs.tgDynamicDirectiveView);
                    scope.ngModelItem = ngModelItem;

                    scope.$watch(function() {
                        return templateUrlProvider(getView, ngModelItem);
                    }, function(newValue, oldValue) {
                        scope.templateUrl = newValue;
                    });
                }
            };
        }
    ]);
