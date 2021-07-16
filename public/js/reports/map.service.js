(function () {
    'use strict';

    angular.module('app.reports').factory('map', map);

    map.$inject = ['L'];

    function map (L) {
        const service = {
            createMap: createMap,
            getGroups: getGroups,
            getStyle: getStyle,
            getGroupColor: getGroupColor,
            getValuesBounds: getValuesBounds,
            addMarkersToMap: addMarkersToMap,
        };

        return service;

        function createMap (report, dataRows) {
            L.Icon.Default.prototype.options.imagePath = 'images/';
            const map = L.map('map', {
                maxZoom: 10,
            });

            const mapBounds = [];
            const mapProperties = report.properties.map;
            const boundsValues = getValuesBounds(mapProperties, dataRows);

            L.tileLayer(report.properties.mapLayerUrl ? report.properties.mapLayerUrl : 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', { attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' }).addTo(map);

            addMarkersToMap(mapProperties, dataRows, boundsValues, mapBounds, map);
            getGroupColor(mapProperties, dataRows);

            map.fitBounds(mapBounds);

            return map;
        }

        function getGroups (mapProperties, dataRows) {
            const groups = new Set();
            if (mapProperties.group.length > 0 && mapProperties.group[0].id) {
                for (const value of dataRows) {
                    const group = value[mapProperties.group[0].id];
                    groups.add(group);
                }
            }
            return groups;
        }

        function getGroupColor (mapProperties, dataRows) {
            const groupHue = new Map();
            let hueIndex = 0;
            const groups = getGroups(mapProperties, dataRows);
            const groupCount = groups.size;
            for (const group of groups) {
                const hue = hueIndex * (360 / groupCount);
                hueIndex++;
                groupHue.set(group, hue);
            }
            return groupHue;
        }

        function getStyle (mapProperties, minValue, maxValue, row) {
            if (mapProperties.value.length > 0) {
                const value = row[mapProperties.value[0].id];
                const saturation = ((value - minValue) * 100) / (maxValue - minValue);
                return { stroke: false, fillOpacity: 0.5, fillColor: `hsl(0, ${saturation}%, 50%)` };
            }
        }

        function getValuesBounds (mapProperties, dataRows) {
            const colorIntensity = [];
            const boundsValues = {};
            if (mapProperties.value.length > 0 && mapProperties.value[0].id) {
                for (const value of dataRows) {
                    colorIntensity.push(value[mapProperties.value[0].id]);
                }
                boundsValues.minValue = Math.min(...colorIntensity);
                boundsValues.maxValue = Math.max(...colorIntensity);
            }
            return boundsValues;
        }
        function addMarkersToMap (mapProperties, dataRows, boundsValues, mapBounds, map) {
            const groupHue = getGroupColor(mapProperties, dataRows);
            for (const row of dataRows) {
                const geoJson = JSON.parse(row[mapProperties.geojson[0].id]);
                const group = row[mapProperties.group[0].id];

                const marker = L.geoJSON(geoJson, {
                    pointToLayer: function (geoJsonPoint, latlng) { return getMarker(mapProperties, latlng, group, row, groupHue); },
                    style: function () { return getStyle(mapProperties, boundsValues.minValue, boundsValues.maxValue, row); },
                }).addTo(map);

                if (mapProperties.label.length > 0) {
                    const label = row[mapProperties.label[0].id];
                    marker.bindTooltip(label, { permanent: true, direction: 'center' }).openTooltip();
                }

                mapBounds.push(marker.getBounds());
            }
        }
        function getMarker (mapProperties, latlng, group, row, groupHue) {
            const hue = groupHue.get(group);
            if (mapProperties.type[0]) {
                const column = mapProperties.type[0];
                const type = row[column.id];
                if (column.icon && column.icon[type]) {
                    const pointMarker = L.AwesomeMarkers.icon({
                        icon: column.icon[type],
                        iconColor: `hsl(${hue}, 100%, 50%)`,
                        prefix: 'fa'
                    });
                    return L.marker(latlng, { icon: pointMarker });
                }
            }
            return L.circleMarker(latlng, {
                stroke: false,
                fillColor: `hsl(${hue}, 100%, 50%)`,
                fillOpacity: 0.5,
            });
        }
    }
})();
