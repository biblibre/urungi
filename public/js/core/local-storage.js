(function () {
    'use strict';

    angular.module('app.core').factory('localStorage', localStorage);

    localStorage.$inject = ['$window'];

    function localStorage ($window) {
        const service = {
            setObject: setObject,
            getObject: getObject,
            removeObject: removeObject,
        };

        return service;

        function setObject (key, value) {
            return $window.localStorage.setItem(key, JSON.stringify(value));
        }
        function getObject (key) {
            return JSON.parse($window.localStorage.getItem(key));
        }
        function removeObject (key) {
            return $window.localStorage.removeItem(key);
        }
    }
})();
