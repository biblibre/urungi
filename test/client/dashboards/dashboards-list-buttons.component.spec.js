require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/api.js');
require('../../../public/js/dashboards/dashboards.module.js');
require('../../../public/js/dashboards/dashboards-list-buttons.component.js');

describe('appDashboardsListButtons', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.dashboards'));
    beforeEach(angular.mock.module('app.templates'));

    let $componentController, $httpBackend;
    let $flushPendingTasks;

    beforeEach(inject(function (_$componentController_, _$httpBackend_, _$flushPendingTasks_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
        $flushPendingTasks = _$flushPendingTasks_;
    }));

    afterEach(() => {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('DashboardsListButtonsController', function () {
        let onDeleteSpy;
        let onDuplicateSpy;
        let vm;

        beforeEach(function () {
            onDeleteSpy = jest.fn();
            onDuplicateSpy = jest.fn();
            const dashboard = {
                _id: 'foo',
                dashboardName: 'Foo',
                createdOn: new Date(),
                bar: 'baz',
            };
            const bindings = {
                dashboard: dashboard,
                onDelete: onDeleteSpy,
                onDuplicate: onDuplicateSpy,
            };
            vm = $componentController('appDashboardsListButtons', null, bindings);
        });

        describe('getCopyLink', function () {
            it('should return an absolute URL', function () {
                const link = vm.getCopyLink();
                expect(link).toBe('http://localhost/dashboards/view/foo');
            });
        });

        describe('openDuplicateModal', function () {
            it('should open modal and call onDuplicate on close', async function () {
                const modal = vm.openDuplicateModal();
                $flushPendingTasks();
                modal.close();
                $flushPendingTasks();
                expect(onDuplicateSpy).toHaveBeenCalledWith();
            });
        });

        describe('publish', function () {
            it('should call /api/dashboards/publish-page', function () {
                $httpBackend.expect('POST', '/api/dashboards/publish-page').respond({});
                vm.publish();
                $httpBackend.flush();
                expect(vm.dashboard.isPublic).toBe(true);
            });
        });

        describe('unpublish', function () {
            it('should call /api/dashboards/unpublish', function () {
                $httpBackend.expect('POST', '/api/dashboards/unpublish').respond({});
                vm.unpublish();
                $httpBackend.flush();
                expect(vm.dashboard.isPublic).toBe(false);
            });
        });

        describe('share', function () {
            it('should call /api/dashboards/share-page', function () {
                $httpBackend.expect('POST', '/api/dashboards/share-page').respond({});
                vm.share();
                $httpBackend.flush();
                expect(vm.dashboard.isShared).toBe(true);
            });
        });

        describe('unshare', function () {
            it('should call /api/dashboards/unshare', function () {
                $httpBackend.expect('POST', '/api/dashboards/unshare').respond({});
                vm.unshare();
                $httpBackend.flush();
                expect(vm.dashboard.isShared).toBe(false);
            });
        });
    });
});
