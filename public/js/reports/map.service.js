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
            const colorIntensity = [];
            let minValue;
            let maxValue;

            L.tileLayer(report.properties.mapLayerUrl ? report.properties.mapLayerUrl : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png' , { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);

            if (report.properties.ykeys[2].id) {
                for (const value of data) {
                    colorIntensity.push(value[report.properties.ykeys[2].id]);

                }
                minValue = Math.min(...colorIntensity);
                maxValue = Math.max(...colorIntensity);
            }
    
            for (const gps of data) {
                const geoJson = JSON.parse(gps[report.properties.ykeys[0].id]);
                const marker = L.geoJSON(geoJson, {
                    style: function () { 
                        const saturation = ((gps[report.properties.ykeys[2].id] - minValue) * 100) / (maxValue - minValue);
                        return {stroke: false, fillOpacity: 0.5, fillColor : `hsl(0, ${saturation}%, 50%)`}
                    }
                }).addTo(map);

                if (report.properties.ykeys.length >= 2) {
                    marker.bindTooltip(gps[report.properties.ykeys[1].id], {permanent:true, direction: "center"}).openTooltip();

                }
                
                mapBounds.push(marker.getBounds());
            }

            map.fitBounds(mapBounds);

            return map;
        }
    }
})();
