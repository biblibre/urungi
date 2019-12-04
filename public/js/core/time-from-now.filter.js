(function () {
    'use strict';

    angular.module('app.core').filter('timeFromNow', timeFromNow);

    timeFromNow.$inject = ['moment'];

    function timeFromNow (moment) {
        return function (input) {
            return moment(input).fromNow();
        };
    }
})();
