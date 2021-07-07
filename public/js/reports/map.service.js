(function () {
    'use strict';

    angular.module('app.reports').factory('map', map);

    map.$inject = ['L', 'mapDefaultTileLayerUrlTemplate'];

    function map (L, mapDefaultTileLayerUrlTemplate) {
        const service = {
            createMap: createMap,
            getGroups: getGroups,
            getStyle: getStyle,
            getGroupColor: getGroupColor,
            getValuesBounds: getValuesBounds,
            addMarkersToMap: addMarkersToMap,
        };

        const MapIcon = L.Icon.extend({
            options: {
                icon: 'home',
                iconColor: 'black'
            },

            initialize: function (options) {
                options = L.Util.setOptions(this, options);
            },

            createIcon: function () {
                const div = document.createElement('div');
                const options = this.options;

                div.classList.add('leaflet-marker-icon');

                if (options.icon) {
                    div.innerHTML = this._createInner();
                }

                return div;
            },

            _createInner: function () {
                const options = this.options;

                const iconClass = 'fa fa-' + options.icon;
                const iconStyle = `style="color: ${options.iconColor}; font-size: 16px;"`;

                return '<i ' + iconStyle + 'class="' + iconClass + '"></i>';
            },

            createShadow: function () {
                return null;
            }
        });

        return service;

        function createMap (report, dataRows) {
            L.Icon.Default.prototype.options.imagePath = 'images/';
            const map = L.map('map', {
                maxZoom: 10,
            });

            const mapBounds = [];
            const mapProperties = report.properties.map;
            const urlTemplate = report.properties.mapLayerUrl || mapDefaultTileLayerUrlTemplate;

            L.tileLayer(urlTemplate, {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
            }).addTo(map);

            addMarkersToMap(mapProperties, dataRows, mapBounds, map);
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
            const bounds = {};

            if (mapProperties.value.length > 0 && mapProperties.value[0].id) {
                const values = dataRows.map(r => r[mapProperties.value[0].id]);
                bounds.minValue = Math.min(...values);
                bounds.maxValue = Math.max(...values);
            }
            return bounds;
        }

        function addMarkersToMap (mapProperties, dataRows, mapBounds, map) {
            const groupHue = getGroupColor(mapProperties, dataRows);
            const { minValue, maxValue } = getValuesBounds(mapProperties, dataRows);

            for (const row of dataRows) {
                const geoJson = JSON.parse(row[mapProperties.geojson[0].id]);
                const group = mapProperties.group.length ? row[mapProperties.group[0].id] : null;
                const style = getStyle(mapProperties, minValue, maxValue, row);

                const marker = L.geoJSON(geoJson, {
                    pointToLayer: function (geoJsonPoint, latlng) {
                        return getMarker(mapProperties, latlng, group, row, groupHue);
                    },
                    style: () => style,
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
                    const iconClass = `fa fa-${column.icon[type]}`;
                    const pointMarker = L.divIcon({

                        html: `<i class="${iconClass}" style="color: hsl(${hue}, 100%, 50%);"></i>`,
                        className: 'report-map-icon',
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
