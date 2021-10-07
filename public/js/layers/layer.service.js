(function () {
    'use strict';

    angular.module('app.layers').service('layerService', layerService);

    function layerService () {
        const service = {
            flattenObjects: flattenObjects,
            newID: newID,
        };

        function flattenObjects (objects) {
            return objects.reduce((acc, val) => {
                return Array.isArray(val.elements) ? acc.concat(flattenObjects(val.elements)) : acc.concat(val);
            }, []);
        }

        function newID (layer) {
            const counter = ((layer.idCounter || 0) + 1) % (26 ** 2);
            layer.idCounter = counter;
            let uid = 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(counter / 26)) +
                'abcdefghijklmnopqrstuvwxyz'.charAt(counter % 26);
            const rand = Math.floor(Math.random() * 676);
            uid += 'abcdefghijklmnopqrstuvwxyz'.charAt(Math.floor(rand / 26)) +
            'abcdefghijklmnopqrstuvwxyz'.charAt(rand % 26);
            // I couldn't decide between using a counter to guarantee unique ids in theory,
            // or using random characters to be certain the ids are very different from each other in practice
            // so I ended up doing both.

            return uid;
        }

        return service;
    }
})();
