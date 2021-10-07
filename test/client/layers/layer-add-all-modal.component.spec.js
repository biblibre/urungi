require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/notify.service.js');
require('../../../public/js/core/user.service.js');
require('../../../public/js/layers/layers.module.js');
require('../../../public/js/layers/layer-add-all-modal.component.js');
require('../../../dist/templates/templates.js');

describe('appLayerAddAllModal', function () {
    beforeEach(angular.mock.module('app.templates'));
    beforeEach(angular.mock.module('app.layers'));

    let $componentController, $rootScope, $compile;
    const collection = {
        collectionName: 'Foo',
    };

    beforeEach(inject(function (_$componentController_, _$uibModal_, _$rootScope_, _$flushPendingTasks_, _$compile_) {
        $componentController = _$componentController_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    describe('LayerAddAllModalController', function () {
        let closeSpy;
        let dismissSpy;
        let vm;

        beforeEach(function () {
            closeSpy = jest.fn();
            dismissSpy = jest.fn();

            const bindings = {
                resolve: {
                    collection: collection,
                },
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appLayerAddAllModal', null, bindings);
        });

        describe('$onInit', function () {
            it('should set sane defaults', function () {
                vm.$onInit();

                expect(vm.collection).toEqual(collection);
            });
        });
    });

    describe('component', function () {
        it('should display the collection name', function () {
            const html = '<app-layer-add-all-modal resolve="{ collection: {collectionName: \'Foo\'}}">';
            const element = $compile(html)($rootScope);
            $rootScope.$apply();

            const modalTitle = element[0].querySelector('.modal-header .modal-title').textContent;
            expect(modalTitle).toBe('Add all collection elements to the layer');

            const modalBody = element[0].querySelector('.modal-body').textContent.trim();
            expect(modalBody).toBe('Please confirm that you want to add to the layer all elements of the collection Foo');
        });
    });
});
