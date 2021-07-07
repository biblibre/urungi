(function () {
    'use strict';

    angular.module('app.reports').factory('map', map);

    map.$inject = ['L'];

    function map (L) {
        const service = {
            createMap: createMap,
        };

        return service;

        function createMap (report, data) {
            L.Icon.Default.prototype.options.imagePath = 'images/';
            const map = L.map('map', {
                maxZoom: 10,
            });
            const mapBounds = [];

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);

            for (const gps of data) {
                const lat = gps[report.properties.ykeys[0].id];
                const long = gps[report.properties.ykeys[1].id];
                const marker = L.marker([lat, long]).addTo(map);
                if (report.properties.ykeys.length > 2 && gps[report.properties.ykeys[2].id]) {
                    marker.bindPopup(gps[report.properties.ykeys[2].id]);
                }
                mapBounds.push([lat, long]);
            }

            map.fitBounds(mapBounds);

            return map;
        }
    }
})();
