angular.module('angular-canv-gauge', []).directive('canvGauge', function() {
    return {
        restrict: 'A',
        scope: {
            value: '=',
            options: '='
        },
        link: function(scope, element, attributes) {
            var init, onValueChanged, onOptionsChanged, gauge;

            init = function() {
                return new Gauge(scope.options);
            };

            onValueChanged = function(value) {
                if (gauge) {
                    gauge.setValue(value);
                    return gauge.draw();
                } else {
                    return gauge = init();
                }
            };

            scope.$watch('value', onValueChanged, true);

            onOptionsChanged = function() {
                if (gauge) {
                    return gauge.updateConfig(scope.options);
                } else {
                    return gauge = init();
                }
            };

            return scope.$watch('options', onOptionsChanged, true);
        }
    };
});