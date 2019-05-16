(function () {
    'use strict';

    angular.module('app.core').factory('sessionStorage', sessionStorage);

    sessionStorage.$inject = ['$window'];

    function sessionStorage ($window) {
        const service = {
            setObject: setObject,
            getObject: getObject,
            removeObject: removeObject,
        };

        return service;

        function setObject (key, value) {
            return $window.sessionStorage.setItem(key, JSON.stringify(value));
        }
        function getObject (key) {
            return JSON.parse($window.sessionStorage.getItem(key));
        }
        function removeObject (key) {
            return $window.sessionStorage.removeItem(key);
        }
    }
})();
