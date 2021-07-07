require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/layers/layers.module.js');
require('../../../public/js/layers/layer.service.js');
require('../../../public/js/reports/reports.module.js');
require('../../../public/js/reports/reports.service.js');
require('../../../public/js/reports/map.service.js');

describe('map', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.reports'));
    beforeEach(angular.mock.module('app.layers'));

    let map;
    let L;

    beforeEach(inject(function (_map_, _L_) {
        map = _map_;
        L = _L_;
    }));

    describe('createMap', function () {
        it('should create a map', function () {
            const mapDiv = document.createElement('div');
            mapDiv.setAttribute('id', 'map');
            mapDiv.style.height = '300px';
            mapDiv.style.width = '300px';
            document.body.append(mapDiv);

            const report = {
                selectedLayerID: 'foo',
                properties: {
                    ykeys: [
                        {
                            label: 'Latitude',
                            elementID: 'quux',
                            elementType: 'string',
                            id: 'equuxraw',
                        },
                        {
                            label: 'Longitude',
                            elementID: 'quuz',
                            elementType: 'string',
                            id: 'equuzraw',
                        },
                    ],
                }
            };
            const rows = [
                {
                    equuxraw: '18.05',
                    equuzraw: '5.46',
                },
                {
                    equuxraw: '13.67',
                    equuzraw: '2.64',
                },
            ];

            const m = map.createMap(report, rows);

            const markers = [];
            m.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    markers.push(layer);
                }
            });

            expect(markers).toHaveLength(2);
            expect(markers[0].getLatLng()).toStrictEqual({ lat: 18.05, lng: 5.46 });
            expect(markers[1].getLatLng()).toStrictEqual({ lat: 13.67, lng: 2.64 });
        });
    });
});
