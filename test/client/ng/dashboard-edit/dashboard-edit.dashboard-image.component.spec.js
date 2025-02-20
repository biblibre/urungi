require('ng-file-upload');
require('angular-bootstrap-colorpicker');
require('angular-ui-tree');
require('angular-ui-sortable');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/drag-and-drop/drag-and-drop.module.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/theme/theme.module.js');
require('../../../../public/js/ng/share/share.module.js');
require('../../../../public/js/ng/report/report.module.js');
require('../../../../public/js/ng/report-edit/report-edit.module.js');
require('../../../../public/js/ng/report-list/report-list.module.js');
require('../../../../public/js/ng/inspector/inspector.module.js');
require('../../../../public/js/ng/dashboard-edit/dashboard-edit.module.js');
require('../../../../public/js/ng/dashboard-edit/dashboard-edit.dashboard-image.component.js');

describe('appDashboardImage', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.dashboard-edit'));

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
