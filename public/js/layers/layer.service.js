(function () {
    'use strict';

    angular.module('app.layers').service('layerService', layerService);

    function layerService () {
        const service = {
            flattenObjects: flattenObjects,
        };

        function flattenObjects (objects) {
            return objects.reduce((acc, val) => {
                return Array.isArray(val.elements) ? acc.concat(flattenObjects(val.elements)) : acc.concat(val);
            }, []);
        }

        return service;
    }
})();
