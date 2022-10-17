require('angular-ui-tree');
require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.user.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/table/table.module.js');
require('../../../../public/js/ng/role-list/role-list.module.js');
require('../../../../public/js/ng/role-list/role-list.edit-modal.component.js');

describe('appRoleListEditModal', function () {
    beforeEach(angular.mock.module('app.role-list'));

    let $componentController, $httpBackend;

    beforeEach(inject(function (_$componentController_, _$httpBackend_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('RoleListEditModalController with a new role', function () {
        let closeSpy;
        let dismissSpy;
        let vm;

        beforeEach(function () {
            closeSpy = jest.fn();
            dismissSpy = jest.fn();

            const bindings = {
                resolve: {
                    role: {},
                },
                close: closeSpy,
                dismiss: dismissSpy,
            };
            vm = $componentController('appRoleListEditModal', null, bindings);
        });

        describe('$onInit', function () {
            it('should set sane defaults', function () {
                $httpBackend.expect('GET', '/api/shared-space')
                    .respond(getSharedSpaceResponse());

                vm.$onInit();
                $httpBackend.flush();

                const fooGrant = {
                    folderID: 'foo',
                    executeReports: false,
                    executeDashboards: false,
                    shareReports: false,
                };

                const barGrant = {
                    folderID: 'bar',
                    executeReports: false,
                    executeDashboards: false,
                    shareReports: false,
                };
                const expectedRole = {
                    grants: [fooGrant, barGrant],
                };
                const expectedGrantsMap = {
                    foo: fooGrant,
                    bar: barGrant,
                };

                expect(vm.role).toEqual(expectedRole);
                expect(vm.grantsMap).toEqual(expectedGrantsMap);
            });
        });

        describe('onNodeChange', function () {
            it('should change grants of sub-folders', function () {
                $httpBackend.expect('GET', '/api/shared-space')
                    .respond(getSharedSpaceResponse());

                vm.$onInit();
                $httpBackend.flush();

                vm.grantsMap.foo.shareReports = true;
                vm.onNodeChange(vm.sharedSpace[0], 'shareReports');

                expect(vm.grantsMap.bar.shareReports).toBe(true);
            });
        });

        function getSharedSpaceResponse () {
            return {
                items: [
                    {
                        id: 'foo',
                        title: 'Foo',
                        nodes: [
                            {
                                id: 'bar',
                                title: 'Bar',
                                nodes: [],
                            },
                        ],
                    },
                ],
            };
        }
    });
});
