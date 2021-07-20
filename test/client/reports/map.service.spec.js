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
            const groups = new Set();

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

            for (const row of dataRows) {
                const group = row.eagmeraw;
                groups.add(group);
            }

            expect(groups.size).toStrictEqual(2);
            expect(groups.has(2)).toStrictEqual(true);
            expect(groups.has(1)).toStrictEqual(true);
        });
    });

    describe('getGroupColor', function () {
        it('should attribuate groups color', function () {
            const groups = new Set();

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

            for (const row of dataRows) {
                const group = row.eagmeraw;
                groups.add(group);
            }

            const groupHue = new Map();

            let hueIndex = 0;

            const groupCount = groups.size;

            for (const group of groups) {
                const hue = hueIndex * (360 / groupCount);
                hueIndex++;
                groupHue.set(group, hue);
            }

            expect(groupHue.size).toStrictEqual(3);
            expect(groupHue.has(1)).toStrictEqual(true);
            expect(groupHue.has(2)).toStrictEqual(true);
            expect(groupHue.has(3)).toStrictEqual(true);
        });
    });
    describe('getStyle', function () {
        it('should apply color style into a value range', function () {
            const minValue = 20;
            const maxValue = 100;
            const value = 70;

            const getStyle = function (value) {
                const saturation = ((value - minValue) * 100) / (maxValue - minValue);
                return saturation;
            };

            expect(value).toBeGreaterThanOrEqual(minValue);
            expect(value).toBeLessThanOrEqual(maxValue);
            expect(getStyle(70)).toStrictEqual(62.5);
            expect(getStyle(50)).toStrictEqual(37.5);
            expect(getStyle(25)).toStrictEqual(6.25);
        });
    });
    describe('getValuesBounds', function () {
        it('should get min & max value for apply color instensity', function () {
            const colorIntensity = [];
            const boundsValues = {};

            const getValuesBounds = function (datas) {
                datas.forEach((e) => colorIntensity.push(e.value));
                boundsValues.minValue = Math.min(...colorIntensity);
                boundsValues.maxValue = Math.max(...colorIntensity);

                return boundsValues;
            };

            const dataRows = [{
                value: 900,
                eafrsraw: 'Gap',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [1.3291015625, 28.90083790234091]}'
            },
            {
                value: 100,
                eafrsraw: 'Marseille',
                eagmeraw: 2,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [4.3291015625, 28.90083790234091]}'
            },
            {
                value: 500,
                eafrsraw: 'Paris',
                eagmeraw: 2,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [9.3291015625, 28.90083790234091]}'
            },
            {
                value: 350,
                eafrsraw: 'Lyon',
                eagmeraw: 1,
                eahaoraw: 'client',
                eaiufraw: '{"type": "Point", "coordinates": [0.3291015625, 28.90083790234091]}'
            },
            {
                value: 350,
                eafrsraw: 'Aix',
                eagmeraw: 1,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            {
                value: 350,
                eafrsraw: 'Aix',
                eagmeraw: 3,
                eahaoraw: 'library',
                eaiufraw: '{"type": "Point", "coordinates": [10.3291015625, 28.90083790234091]}'
            },
            ];

            const result = getValuesBounds(dataRows);
            expect(result.maxValue).toStrictEqual(900);
            expect(result.minValue).toStrictEqual(100);
        });
    });
});
