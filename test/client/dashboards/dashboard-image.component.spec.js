require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/notify.service.js');
require('../../../public/js/core/api.js');
require('../../../public/js/dashboards/dashboards.module.js');
require('../../../public/js/dashboards/dashboard-image.component.js');

describe('appDashboardImage', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.dashboards'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController, $httpBackend;
    let $flushPendingTasks;
    let $q;

    beforeEach(inject(function (_$componentController_, _$httpBackend_, _$flushPendingTasks_, _$q_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
        $flushPendingTasks = _$flushPendingTasks_;
        $q = _$q_;
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('DashboardsImageController', function () {
        let vm;
        let uibModalOpenSpy;

        beforeEach(function () {
            uibModalOpenSpy = jest.fn(function () {
                return { result: $q.resolve({ url: '100', source700: '700', source1400: '1400' }) };
            });
            const uibModal = {
                open: uibModalOpenSpy,
            };
            const locals = {
                $element: angular.element('<div></div>'),
                $uibModal: uibModal,
            };
            const bindings = {
                size: 700,
            };
            vm = $componentController('appDashboardImage', locals, bindings);
        });

        describe('$onInit', function () {
            it('should open a modal if there is no url', function () {
                vm.$onInit();
                expect(uibModalOpenSpy).toHaveBeenCalledWith({ component: 'appDashboardImageModal' });
                $flushPendingTasks();
                expect(vm.url).toBe('700');
            });
        });
    });
});
