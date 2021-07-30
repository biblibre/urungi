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

    describe('getGroups', function () {
        it('should add group to groups', function () {
            const mapProperties = {
                geojson: [{
                    id: 'eaiufraw',
                    elementID: 'aiuf',
                    elementLabel: 'geojson',
                    elementName: 'comp',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                group: [{
                    id: 'eagmeraw',
                    elementID: 'agme',
                    elementLabel: 'gid',
                    elementName: 'gid',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],
                label: [{
                    id: 'eafrsraw',
                    elementID: 'afrs',
                    elementLabel: 'label',
                    elementName: 'label',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                type: [{
                    id: 'eahaoraw',
                    elementID: 'ahao',
                    elementLabel: 'type',
                    elementName: 'type',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                value: [{
                    id: 'eaexaraw',
                    elementID: 'aexa',
                    elementLabel: 'value',
                    elementName: 'value',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],

            };

            const dataRows = [{
                eaexaraw: 900,
                eafrsraw: 'Gap',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [1.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 100,
                eafrsraw: 'Marseille',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [4.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 500,
                eafrsraw: 'Paris',
                eagmeraw: 2,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [9.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Lyon',
                eagmeraw: 1,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [0.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 1,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            ];

            const result = map.getGroups(mapProperties, dataRows);
            expect(result.size).toStrictEqual(2);
            expect(result.has(2)).toStrictEqual(true);
            expect(result.has(1)).toStrictEqual(true);
        });
    });

    describe('getGroupColor', function () {
        it('should attribuate groups color', function () {
            const mapProperties = {
                geojson: [{
                    id: 'eaiufraw',
                    elementID: 'aiuf',
                    elementLabel: 'geojson',
                    elementName: 'comp',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                group: [{
                    id: 'eagmeraw',
                    elementID: 'agme',
                    elementLabel: 'gid',
                    elementName: 'gid',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],
                label: [{
                    id: 'eafrsraw',
                    elementID: 'afrs',
                    elementLabel: 'label',
                    elementName: 'label',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                type: [{
                    id: 'eahaoraw',
                    elementID: 'ahao',
                    elementLabel: 'type',
                    elementName: 'type',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                value: [{
                    id: 'eaexaraw',
                    elementID: 'aexa',
                    elementLabel: 'value',
                    elementName: 'value',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],

            };
            const dataRows = [{
                eaexaraw: 900,
                eafrsraw: 'Gap',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [1.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 100,
                eafrsraw: 'Marseille',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [4.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 500,
                eafrsraw: 'Paris',
                eagmeraw: 2,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [9.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Lyon',
                eagmeraw: 1,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [0.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 1,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 3,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            ];

            const result = map.getGroupColor(mapProperties, dataRows);
            expect(result.size).toStrictEqual(3);
            expect(result.has(2)).toStrictEqual(true);
            expect(result.has(1)).toStrictEqual(true);
            expect(result.has(3)).toStrictEqual(true);
        });
    });
    describe('getStyle', function () {
        it('should apply color style into a value range', function () {
            const mapProperties = {
                geojson: [{
                    id: 'eaiufraw',
                    elementID: 'aiuf',
                    elementLabel: 'geojson',
                    elementName: 'comp',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                group: [{
                    id: 'eagmeraw',
                    elementID: 'agme',
                    elementLabel: 'gid',
                    elementName: 'gid',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],
                label: [{
                    id: 'eafrsraw',
                    elementID: 'afrs',
                    elementLabel: 'label',
                    elementName: 'label',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                type: [{
                    id: 'eahaoraw',
                    elementID: 'ahao',
                    elementLabel: 'type',
                    elementName: 'type',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                value: [{
                    id: 'eaexaraw',
                    elementID: 'aexa',
                    elementLabel: 'value',
                    elementName: 'value',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],

            };
            const dataRows = [{
                eaexaraw: 900,
                eafrsraw: 'Gap',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [1.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 100,
                eafrsraw: 'Marseille',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [4.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 500,
                eafrsraw: 'Paris',
                eagmeraw: 2,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [9.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Lyon',
                eagmeraw: 1,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [0.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 1,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 3,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            ];
            const values = [];
            let minValue = 0;
            let maxValue = 0;

            dataRows.forEach((e) => {
                values.push(e.eaexaraw);
            });

            minValue = Math.min(...values);
            maxValue = Math.max(...values);

            dataRows.forEach((e) => {
                expect(e.eaexaraw).toBeGreaterThanOrEqual(minValue);
                expect(e.eaexaraw).toBeLessThanOrEqual(maxValue);
            });

            const receivedObject = map.getStyle(mapProperties, minValue, maxValue, dataRows[0].eaexaraw);
            expect(Object.keys(receivedObject).length).toStrictEqual(3);
            expect(Object.keys(receivedObject)).toStrictEqual(['stroke', 'fillOpacity', 'fillColor']);
        });
    });
    describe('getValuesBounds', function () {
        it('should get min & max value for apply color instensity', function () {
            const mapProperties = {
                geojson: [{
                    id: 'eaiufraw',
                    elementID: 'aiuf',
                    elementLabel: 'geojson',
                    elementName: 'comp',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                group: [{
                    id: 'eagmeraw',
                    elementID: 'agme',
                    elementLabel: 'gid',
                    elementName: 'gid',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],
                label: [{
                    id: 'eafrsraw',
                    elementID: 'afrs',
                    elementLabel: 'label',
                    elementName: 'label',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                type: [{
                    id: 'eahaoraw',
                    elementID: 'ahao',
                    elementLabel: 'type',
                    elementName: 'type',
                    elementRole: 'dimension',
                    elementType: 'string'
                }],
                value: [{
                    id: 'eaexaraw',
                    elementID: 'aexa',
                    elementLabel: 'value',
                    elementName: 'value',
                    elementRole: 'dimension',
                    elementType: 'number'
                }],

            };
            const dataRows = [{
                eaexaraw: 900,
                eafrsraw: 'Gap',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [1.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 100,
                eafrsraw: 'Marseille',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [4.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 500,
                eafrsraw: 'Paris',
                eagmeraw: 2,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [9.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Lyon',
                eagmeraw: 1,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [0.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 1,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            {
                eaexaraw: 350,
                eafrsraw: 'Aix',
                eagmeraw: 3,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            ];

            const result = map.getValuesBounds(mapProperties, dataRows);
            expect(result.maxValue).toStrictEqual(900);
            expect(result.minValue).toStrictEqual(100);
        });
    });
});
