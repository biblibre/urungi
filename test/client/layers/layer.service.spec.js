require('../../../public/js/core/core.module.js');
require('../../../public/js/layers/layers.module.js');
require('../../../public/js/layers/layer.service.js');

describe('layerService', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.layers'));

    let layerService;

    beforeEach(inject(function (_layerService_) {
        layerService = _layerService_;
    }));

    describe('flattenObjects', function () {
        it('should return a flat array of objects', function () {
            const objects = [
                {
                    id: '1',
                    elements: [
                        {
                            id: '1.1',
                            elements: [
                                {
                                    id: '1.1.1',
                                    elements: null,
                                },
                                {
                                    id: '1.1.2',
                                    elements: [],
                                }
                            ],
                        },
                        {
                            id: '1.2',
                            elements: 'notAnArray',
                        },
                    ],
                },
                {
                    id: '2',
                },
            ];
            const flat = layerService.flattenObjects(objects);
            const expected = [
                { id: '1.1.1', elements: null },
                { id: '1.2', elements: 'notAnArray' },
                { id: '2' },
            ];

            expect(flat).toEqual(expected);
        });
    });

    describe('newID', function () {
        it('should return a random id of 4 alphabetic characters', function () {
            const layer = {};
            const id = layerService.newID(layer);

            expect(id).toMatch(/^[a-z]{4}$/);
        });
    });
});
