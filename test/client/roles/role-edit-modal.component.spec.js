require('../../../public/js/core/core.module.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/user.service.js');
require('../../../public/js/roles/roles.module.js');
require('../../../public/js/roles/role-edit-modal.component.js');

describe('appRoleEditModal', function () {
    beforeEach(angular.mock.module('app.roles'));

    let $componentController, $httpBackend;

    beforeEach(inject(function (_$componentController_, _$httpBackend_) {
        $componentController = _$componentController_;
        $httpBackend = _$httpBackend_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('RoleEditModalController with a new role', function () {
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
            vm = $componentController('appRoleEditModal', null, bindings);
        });

        describe('$onInit', function () {
            it('should set sane defaults', function () {
                $httpBackend.expect('GET', '/api/get-user-data')
                    .respond(getUserDataResponse());

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
                $httpBackend.expect('GET', '/api/get-user-data')
                    .respond(getUserDataResponse());

                vm.$onInit();
                $httpBackend.flush();

                vm.grantsMap.foo.shareReports = true;
                vm.onNodeChange(vm.sharedSpace[0], 'shareReports');

                expect(vm.grantsMap.bar.shareReports).toBe(true);
            });
        });

        function getUserDataResponse () {
            return {
                result: 1,
                page: 1,
                pages: 1,
                items: {
                    user: {},
                    companyData: {
                        sharedSpace: [
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
                    },
                },
            };
        }
    });
});
