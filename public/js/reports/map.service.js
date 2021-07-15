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

            L.tileLayer(report.properties.mapLayerUrl ? report.properties.mapLayerUrl : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);

            if (report.properties.map.value.length > 0 && report.properties.map.value[0].id) {
                for (const value of data) {
                    colorIntensity.push(value[report.properties.map.value[0].id]);
                }
                minValue = Math.min(...colorIntensity);
                maxValue = Math.max(...colorIntensity);
            }

            const groups = new Set();
            if (report.properties.map.group.length > 0 && report.properties.map.group[0].id) {
                for (const value of data) {
                    const group = value[report.properties.map.group[0].id];
                    groups.add(group);
                }
            }
            const groupCount = groups.size;
            const groupHue = new Map();
            let hueIndex = 0;
            for (const group of groups) {
                const hue = hueIndex * (360 / groupCount);
                hueIndex++;
                groupHue.set(group, hue);
            }

            for (const gps of data) {
                const geoJson = JSON.parse(gps[report.properties.map.geojson[0].id]);
                const group = gps[report.properties.map.group[0].id];
                const marker = L.geoJSON(geoJson, {
                    pointToLayer: function (geoJsonPoint, latlng) {
                        const hue = groupHue.get(group);
                        return L.circleMarker(latlng, {
                            stroke: false,
                            fillColor: `hsl(${hue}, 100%, 50%)`,
                            fillOpacity: 0.5,
                        });
                    },
                    style: function () {
                        if (report.properties.map.value.length > 0) {
                            const value = gps[report.properties.map.value[0].id];
                            const saturation = ((value - minValue) * 100) / (maxValue - minValue);
                            return { stroke: false, fillOpacity: 0.5, fillColor: `hsl(0, ${saturation}%, 50%)` };
                        }
                    }
                }).addTo(map);
                console.log(marker.getBounds());

                if (report.properties.map.label.length > 0) {
                    const label = gps[report.properties.map.label[0].id];
                    marker.bindTooltip(label, { permanent: true, direction: 'center' }).openTooltip();
                }

                mapBounds.push(marker.getBounds());
            }

            map.fitBounds(mapBounds);

            return map;
        }
    }
})();
