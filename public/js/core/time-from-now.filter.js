(function () {
    'use strict';

    angular.module('app.core').filter('timeFromNow', timeFromNow);

    timeFromNow.$inject = ['moment'];

    function timeFromNow (moment) {
        function filter (input) {
            return moment(input).fromNow();
        }
        filter.$stateful = true;

        return filter;
    }
})();
