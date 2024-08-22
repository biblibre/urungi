require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.user.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/share/share.module.js');
require('../../../../public/js/ng/dashboard-list/dashboard-list.module.js');
require('../../../../public/js/ng/dashboard-list/dashboard-list.dashboards-list-buttons.component.js');

describe('appDashboardsListButtons', function () {
    beforeEach(angular.mock.module('app.core'));
    beforeEach(angular.mock.module('app.dashboard-list'));

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
        function apiGetUserDataResponse () {
            return {
                userName: 'foo',
                status: 'active',
                roles: ['ADMIN'],
            };
        }
        beforeEach(async function () {
            onDeleteSpy = jest.fn();
            onDuplicateSpy = jest.fn();
            const dashboard = {
                _id: 'foo',
                dashboardName: 'Foo',
                createdOn: new Date(),
                bar: 'baz',
            };
            const bindings = {
                dashboard,
                onDelete: onDeleteSpy,
                onDuplicate: onDuplicateSpy,
            };
            vm = $componentController('appDashboardsListButtons', null, bindings);
        });

        describe('getCopyLink', function () {
            it('should return an absolute URL', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(apiGetUserDataResponse());
                $httpBackend.flush();

                const link = vm.getCopyLink();
                expect(link).toBe('http://localhost/dashboards/view/foo');
            });
        });

        describe('openDuplicateModal', function () {
            it('should open modal and call onDuplicate on close', async function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(apiGetUserDataResponse());
                $httpBackend.flush();

                const modal = vm.openDuplicateModal();
                $flushPendingTasks();
                modal.close();
                $flushPendingTasks();
                expect(onDuplicateSpy).toHaveBeenCalledWith();
            });
        });

        describe('publish', function () {
            it('should call /api/dashboards/publish-page', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(apiGetUserDataResponse());
                $httpBackend.flush();

                $httpBackend.expect('POST', '/api/dashboards/publish-page').respond({});
                vm.publish();
                $httpBackend.flush();
                expect(vm.dashboard.isPublic).toBe(true);
            });
        });

        describe('unpublish', function () {
            it('should call /api/dashboards/unpublish', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(apiGetUserDataResponse());
                $httpBackend.flush();

                $httpBackend.expect('POST', '/api/dashboards/unpublish').respond({});
                vm.unpublish();
                $httpBackend.flush();
                expect(vm.dashboard.isPublic).toBe(false);
            });
        });

        describe('share', function () {
            it('should call /api/dashboards/share-page', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(apiGetUserDataResponse());
                $httpBackend.flush();

                $httpBackend.expect('POST', '/api/dashboards/share-page').respond({});
                vm.share();
                $httpBackend.flush();
                expect(vm.dashboard.isShared).toBe(true);
            });
        });

        describe('unshare', function () {
            it('should call /api/dashboards/unshare', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(apiGetUserDataResponse());
                $httpBackend.flush();

                $httpBackend.expect('POST', '/api/dashboards/unshare').respond({});
                vm.unshare();
                $httpBackend.flush();
                expect(vm.dashboard.isShared).toBe(false);
            });
        });
    });
});
