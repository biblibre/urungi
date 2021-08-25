require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/notify.service.js');
require('../../../public/js/core/user.service.js');
require('../../../public/js/layers/layers.module.js');
require('../../../public/js/layers/constants.js');
require('../../../public/js/layers/layer.service.js');
require('../../../public/js/layers/layer-element-modal.component.js');

const elementAaaaa = {
    collectionID: 'A',
    elementID: 'aaaa',
};
const collectionA = {
    collectionID: 'A',
    component: 1,
    elements: [
        elementAaaaa,
    ],
};
const layer = {
    datasourceID: 'ds1',
    params: {
        schema: [
            collectionA,
        ],
    },
};

describe('appLayerElementModal', function () {
    beforeEach(angular.mock.module('app.templates'));
    beforeEach(angular.mock.module('app.layers'));

    let $componentController;

    beforeEach(inject(function (_$componentController_) {
        $componentController = _$componentController_;
    }));

    describe('LayerElementModalController', function () {
        describe('$onInit', function () {
            test('with a regular element, active tab should be general', function () {
                const closeSpy = jest.fn();
                const dismissSpy = jest.fn();

                const element = {
                };
                const bindings = {
                    resolve: {
                        element: element,
                        layer: layer,
                    },
                    close: closeSpy,
                    dismiss: dismissSpy,
                };
                const vm = $componentController('appLayerElementModal', null, bindings);
                vm.$onInit();

                expect(vm.activeTab).toBe('general');
            });

            test('with a custom element, active tab should be expression', function () {
                const closeSpy = jest.fn();
                const dismissSpy = jest.fn();

                const element = {
                    isCustom: true,
                };

                const bindings = {
                    resolve: {
                        element: element,
                        layer: layer,
                    },
                    close: closeSpy,
                    dismiss: dismissSpy,
                };
                const vm = $componentController('appLayerElementModal', null, bindings);
                vm.$onInit();

                expect(vm.activeTab).toBe('expression');
            });
        });

        describe('addElementToExpression', function () {
            let vm;

            beforeAll(function () {
                const closeSpy = jest.fn();
                const dismissSpy = jest.fn();

                const element = {
                    isCustom: true,
                };

                const bindings = {
                    resolve: {
                        element: element,
                        layer: layer,
                    },
                    close: closeSpy,
                    dismiss: dismissSpy,
                };
                vm = $componentController('appLayerElementModal', null, bindings);
                vm.$onInit();
                vm.addElementToExpression(elementAaaaa);
            });

            test('element id should be appended to expression', function () {
                expect(vm.element.viewExpression).toBe('#aaaa');
            });

            test('component should be set', function () {
                expect(vm.element.component).toBe(1);
            });
        });

        describe('saveElement', function () {
            const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
            const closeSpy = jest.fn();
            const dismissSpy = jest.fn();
            let vm;

            beforeAll(function () {
                const element = {
                    isCustom: true,
                };

                const bindings = {
                    resolve: {
                        element: element,
                        layer: layer,
                    },
                    close: closeSpy,
                    dismiss: dismissSpy,
                };
                vm = $componentController('appLayerElementModal', null, bindings);
                vm.$onInit();
            });

            beforeEach(function () {
                consoleErrorSpy.mockClear();
                closeSpy.mockClear();
                dismissSpy.mockClear();
            });

            test('should call close', function () {
                vm.addElementToExpression(elementAaaaa);
                vm.saveElement();

                const expectedElement = {
                    component: 1,
                    elementRole: 'dimension',
                    isCustom: true,
                    viewExpression: '#aaaa',
                };
                expect(closeSpy).toBeCalledWith({ $value: expectedElement });
            });

            test('a bad expression should prevent call to close and set errorMessage', function () {
                vm.addElementToExpression(elementAaaaa);
                vm.element.viewExpression += ' #zzzz';
                vm.saveElement();

                const expectedErrorMessage = 'Error in custom expression, element not found: #zzzz';
                expect(consoleErrorSpy).toBeCalledWith(new Error(expectedErrorMessage));
                expect(vm.errorMessage).toBe(expectedErrorMessage);
                expect(closeSpy).not.toBeCalled();
            });
        });
    });
});
