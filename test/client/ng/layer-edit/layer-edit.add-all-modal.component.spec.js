require('angular-ui-sortable');
require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.user.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/layer-edit/layer-edit.module.js');
require('../../../../public/js/ng/layer-edit/layer-edit.templates.js');
require('../../../../public/js/ng/layer-edit/layer-edit.add-all-modal.component.js');

describe('appLayerEditAddAllModal', function () {
    beforeEach(angular.mock.module('app.layer-edit'));

    let $componentController, $rootScope, $compile;
    const collection = {
        collectionName: 'Foo',
    };

    beforeEach(inject(function (_$componentController_, _$uibModal_, _$rootScope_, _$flushPendingTasks_, _$compile_) {
        $componentController = _$componentController_;
        $rootScope = _$rootScope_;
        $compile = _$compile_;
    }));

    describe('LayerEditAddAllModalController', function () {
        let closeSpy;
        let dismissSpy;
        let vm;

        beforeEach(function () {
            closeSpy = jest.fn();
            dismissSpy = jest.fn();

            const bindings = {
                resolve: {
                    collection,
                },
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appLayerEditAddAllModal', null, bindings);
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
            const html = '<app-layer-edit-add-all-modal resolve="{ collection: {collectionName: \'Foo\'}}"></app-layer-edit-add-all-modal>';
            const element = $compile(html)($rootScope);
            $rootScope.$apply();

            const modalTitle = element[0].querySelector('.modal-header .modal-title').textContent;
            expect(modalTitle).toBe('Add all collection elements to the layer');

            const modalBody = element[0].querySelector('.modal-body').textContent.trim();
            expect(modalBody).toBe('Please confirm that you want to add to the layer all elements of the collection Foo');
        });
    });
});
