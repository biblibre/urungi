require('../../../../public/js/ng/core/core.module.js');
require('../../../../public/js/ng/core/core.api.service.js');
require('../../../../public/js/ng/core/core.constants.js');
require('../../../../public/js/ng/core/core.connection.service.js');
require('../../../../public/js/ng/core/core.http-interceptor.service.js');
require('../../../../public/js/ng/core/core.user.service.js');
require('../../../../public/js/ng/ui-bootstrap/ui-bootstrap.module.js');
require('../../../../public/js/ng/user/user.module.js');
require('../../../../public/js/ng/user-show/user-show.module.js');
require('../../../../public/js/ng/user-show/user-show.component.js');

describe('UserShowController', function () {
    beforeEach(angular.mock.module('app.user-show'));

    let $controller, $httpBackend, $q;
    let vm;

    beforeEach(inject(function (_$controller_, _$httpBackend_, _$q_) {
        $controller = _$controller_;
        $httpBackend = _$httpBackend_;
        $q = _$q_;
    }));

    afterEach(function () {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    describe('activate', function () {
        const user = {

            _id: 'bar',
            companyID: 'COMPID',
            userName: 'johndoe',
            status: 'active',
            roles: ['GUEST'],
            reportsCreate: true,
            dashboardsCreate: true,
            exploreData: true,
            viewSQL: false,
            isAdmin: function isAdmin () {
                return false;
            }
        };
        it('should initialized current user properties', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(getCurrentUserResponse());
            $httpBackend.expect('GET', '/api/roles?fields=name')
                .respond(getRolesFindAllResponse());
            $httpBackend.expect('GET', '/api/users/' + user._id)
                .respond(getUsersFindAllResponse().data[1]);
            $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                .respond(getUserCountsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                .respond(getUserReportsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                .respond(getUserDashboardsResponse());

            vm = $controller('UserShowController', {}, { userId: user._id });
            vm.$onInit();
            $httpBackend.flush();

            expect(vm.user._id).toBe(user._id);
            expect(user.roles).toEqual(expect.arrayContaining(vm.user.roles));
            expect(vm.user.status).toBe(user.status);
            expect(vm.user.companyID).toBe(user.companyID);
            expect(vm.user.userName).toBe(user.userName);

            expect(vm.userCounts).toEqual(expect.objectContaining({
                privateDashboards: expect.any(Number),
                privateReports: expect.any(Number),
                sharedDashboards: expect.any(Number),
                sharedReports: expect.any(Number)
            }));

            expect(vm.userReports).toEqual([{
                _id: '123456',
                author: user.userName,
                createdBy: user._id,
                isPublic: true,
                isShared: false,
                companyID: 'COMPID',
                owner: user.userName,
                reportName: 'report',
                reportType: 'grid',
                selectedLayerID: 'layerFoo',
            }]);

            expect(vm.userDashboards).toEqual([{
                _id: '987654',
                author: user.userName,
                backgroundColor: '#999999',
                companyID: 'COMPID',
                createdBy: user._id,
                dashboardName: 'New Dashboard',
                dashboardType: 'DEFAULT',
                html: '<div> hello world </div>'
            }]);
        });
    });

    describe('addRole', function () {
        const user = {

            _id: 'bar',
            companyID: 'COMPID',
            userName: 'johndoe',
            status: 'active',
            roles: ['GUEST'],
            reportsCreate: true,
            dashboardsCreate: true,
            exploreData: true,
            viewSQL: false,
            isAdmin: function isAdmin () {
                return false;
            }
        };
        const role = {

            _id: 'ADMIN',
            name: 'admin',

        };
        it('should add role to user', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(getCurrentUserResponse());
            $httpBackend.expect('GET', '/api/roles?fields=name')
                .respond(getRolesFindAllResponse());
            $httpBackend.expect('GET', '/api/users/' + user._id)
                .respond(getUsersFindAllResponse().data[1]);
            $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                .respond(getUserCountsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                .respond(getUserReportsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                .respond(getUserDashboardsResponse());

            vm = $controller('UserShowController', {}, { userId: user._id });
            vm.$onInit();
            $httpBackend.flush();

            expect(vm.user.roles).toContain('GUEST');

            $httpBackend.expect('PUT', `/api/users/${user._id}/roles/${role._id}`)
                .respond({ roleId: role._id });

            vm.addRole('ADMIN');
            $httpBackend.flush();

            expect(vm.user.roles).toContain('GUEST', 'ADMIN');
        });
    });

    describe('getRoleName', function () {
        const user = {

            _id: 'bar',
            companyID: 'COMPID',
            userName: 'johndoe',
            status: 'active',
            roles: ['GUEST'],
            reportsCreate: true,
            dashboardsCreate: true,
            exploreData: true,
            viewSQL: false,
            isAdmin: function isAdmin () {
                return false;
            }
        };
        const roleID = 'GUEST';
        const role = {

            _id: 'GUEST',
            name: 'guest',

        };
        it('should return role name', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(getCurrentUserResponse());
            $httpBackend.expect('GET', '/api/roles?fields=name')
                .respond(getRolesFindAllResponse());
            $httpBackend.expect('GET', '/api/users/' + user._id)
                .respond(getUsersFindAllResponse().data[1]);
            $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                .respond(getUserCountsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                .respond(getUserReportsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                .respond(getUserDashboardsResponse());

            vm = $controller('UserShowController', {}, { userId: user._id });
            vm.$onInit();
            $httpBackend.flush();

            const result = vm.getRoleName(roleID);

            expect(result).toBe(role.name);
        });
    });
    describe('getRolesNotInUser', function () {
        const user = {

            _id: 'bar',
            companyID: 'COMPID',
            userName: 'johndoe',
            status: 'active',
            roles: ['GUEST'],
            reportsCreate: true,
            dashboardsCreate: true,
            exploreData: true,
            viewSQL: false,
            isAdmin: function isAdmin () {
                return false;
            }
        };

        it('should return role name', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(getCurrentUserResponse());
            $httpBackend.expect('GET', '/api/roles?fields=name')
                .respond(getRolesFindAllResponse());
            $httpBackend.expect('GET', '/api/users/' + user._id)
                .respond(getUsersFindAllResponse().data[1]);
            $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                .respond(getUserCountsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                .respond(getUserReportsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                .respond(getUserDashboardsResponse());

            vm = $controller('UserShowController', {}, { userId: user._id });
            vm.$onInit();
            $httpBackend.flush();

            const result = vm.getRolesNotInUser();

            expect(result).toEqual([
                {
                    _id: 'DIRECTOR',
                    name: 'director'
                },
                {
                    _id: 'ADMIN',
                    name: 'Urungi Administrator'
                },
            ]);
        });
    });

    describe('changeStatus', function () {
        const user = {

            _id: 'bar',
            companyID: 'COMPID',
            userName: 'johndoe',
            status: 'active',
            roles: ['GUEST'],
            reportsCreate: true,
            dashboardsCreate: true,
            exploreData: true,
            viewSQL: false,
            isAdmin: function isAdmin () {
                return false;
            }
        };
        it('should change user status', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(getCurrentUserResponse());
            $httpBackend.expect('GET', '/api/roles?fields=name')
                .respond(getRolesFindAllResponse());
            $httpBackend.expect('GET', '/api/users/' + user._id)
                .respond(getUsersFindAllResponse().data[1]);
            $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                .respond(getUserCountsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                .respond(getUserReportsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                .respond(getUserDashboardsResponse());

            vm = $controller('UserShowController', {}, { userId: user._id });
            vm.$onInit();
            $httpBackend.flush();

            expect(user.status).toBe('active');

            vm.changeUserStatus(user);

            $httpBackend.expect('PATCH', '/api/users/bar')
                .respond({ status: 'Not active' });
            $httpBackend.flush();

            expect(user.status).toBe('Not active');
        });
    });
    describe('editUser', function () {
        let admin, user;
        let $uibModalMock, notifyMock;

        beforeEach(function () {
            $uibModalMock = {
                open: jest.fn().mockReturnValue({
                    result: $q.resolve()
                })
            };
            notifyMock = {
                success: jest.fn()
            };

            admin = {
                _id: 'foo',
                userName: 'admin',
                status: 'active',
                roles: ['ADMIN']
            };
            user = {
                _id: 'bar',
                userName: 'johndoe',
                status: 'active',
                roles: ['GUEST']
            };
        });
        it('should edit user', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond(getCurrentUserResponse());
            $httpBackend.expect('GET', '/api/roles?fields=name')
                .respond(getRolesFindAllResponse());
            $httpBackend.expect('GET', '/api/users/' + user._id)
                .respond(getUsersFindAllResponse().data[1]);
            $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                .respond(getUserCountsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                .respond(getUserReportsResponse());
            $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                .respond(getUserDashboardsResponse());

            vm = $controller('UserShowController', { $uibModal: $uibModalMock, notify: notifyMock }, { userId: user._id });
            vm.$onInit();
            $httpBackend.flush();

            vm.editUser(user, admin);

            expect($uibModalMock.open).toHaveBeenCalled();
        });
        describe('deleteUser', function () {
            let admin, user, $uibModalMock, notifyMock;

            beforeEach(function () {
                $uibModalMock = {
                    open: jest.fn().mockReturnValue({
                        result: $q.resolve()
                    })
                };
                notifyMock = {
                    success: jest.fn()
                };

                admin = {
                    _id: 'foo',
                    userName: 'admin',
                    status: 'active',
                    roles: ['ADMIN']
                };
                user = {
                    _id: 'bar',
                    userName: 'johndoe',
                    status: 'active',
                    roles: ['GUEST']
                };
            });
            it('should delete specific user on admin session', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(getCurrentUserResponse());
                $httpBackend.expect('GET', '/api/roles?fields=name')
                    .respond(getRolesFindAllResponse());
                $httpBackend.expect('GET', '/api/users/' + user._id)
                    .respond(getUsersFindAllResponse().data[1]);
                $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                    .respond(getUserCountsResponse());
                $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                    .respond(getUserReportsResponse());
                $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                    .respond(getUserDashboardsResponse());

                const $window = { location: {} };
                vm = $controller('UserShowController', { $uibModal: $uibModalMock, notify: notifyMock, $window }, { userId: user._id });
                vm.$onInit();
                $httpBackend.flush();

                vm.deleteUser(user, admin);

                expect($uibModalMock.open).toHaveBeenCalled();
            });
        });
        describe('deleteRole', function () {
            let user, role, $uibModalMock, notifyMock;

            beforeEach(function () {
                $uibModalMock = {
                    open: jest.fn().mockReturnValue({
                        result: $q.resolve()
                    })
                };
                notifyMock = {
                    success: jest.fn()
                };

                user = {
                    _id: 'bar',
                    userName: 'johndoe',
                    status: 'active',
                    roles: ['GUEST']
                };
                role = {

                    _id: 'GUEST',
                    name: 'guest',

                };
            });
            it('should delete specific user on admin session', function () {
                $httpBackend.expect('GET', '/api/user')
                    .respond(getCurrentUserResponse());
                $httpBackend.expect('GET', '/api/roles?fields=name')
                    .respond(getRolesFindAllResponse());
                $httpBackend.expect('GET', '/api/users/' + user._id)
                    .respond(getUsersFindAllResponse().data[1]);
                $httpBackend.expect('GET', `/api/users/${user._id}/counts`)
                    .respond(getUserCountsResponse());
                $httpBackend.expect('GET', `/api/users/${user._id}/reports`)
                    .respond(getUserReportsResponse());
                $httpBackend.expect('GET', `/api/users/${user._id}/dashboards`)
                    .respond(getUserDashboardsResponse());

                vm = $controller('UserShowController', { $uibModal: $uibModalMock, notify: notifyMock }, { userId: user._id });
                vm.$onInit();
                $httpBackend.flush();

                vm.deleteRole(role._id);

                expect($uibModalMock.open).toHaveBeenCalled();
            });
        });
    });

    function getCurrentUserResponse () {
        return {
            _id: 'foo',
            companyID: 'COMPID',
            userName: 'administrator',
            status: 'active',
            roles: ['ADMIN'],
            reportsCreate: true,
            dashboardsCreate: true,
            exploreData: true,
            viewSQL: true,
            isAdmin: function isAdmin () {
                return true;
            },
        };
    }

    function getRolesFindAllResponse () {
        return {
            data: [
                {
                    _id: 'DIRECTOR',
                    name: 'director',
                },
                {
                    _id: 'GUEST',
                    name: 'guest',
                },
            ]
        };
    };

    function getUsersFindAllResponse () {
        return {
            data: [
                {
                    _id: 'foo',
                    companyID: 'COMPID',
                    userName: 'administrator',
                    status: 'active',
                    roles: ['ADMIN'],
                    reportsCreate: true,
                    dashboardsCreate: true,
                    exploreData: true,
                    viewSQL: true,
                    isAdmin: function isAdmin () {
                        return true;
                    }
                },
                {
                    _id: 'bar',
                    companyID: 'COMPID',
                    userName: 'johndoe',
                    status: 'active',
                    roles: ['GUEST'],
                    reportsCreate: true,
                    dashboardsCreate: true,
                    exploreData: true,
                    viewSQL: false,
                    isAdmin: function isAdmin () {
                        return false;
                    }
                }
            ],
        };
    }
    function getUserCountsResponse () {
        return {
            privateDashboards: 1,
            privateReports: 1,
            sharedDashboards: 6,
            sharedReports: 0
        };
    };
    function getUserReportsResponse () {
        const data = {
            items: [
                {
                    _id: '123456',
                    author: 'johndoe',
                    createdBy: 'bar',
                    isPublic: true,
                    isShared: false,
                    companyID: 'COMPID',
                    owner: 'johndoe',
                    reportName: 'report',
                    reportType: 'grid',
                    selectedLayerID: 'layerFoo',
                }
            ]
        };

        return data;
    }
    function getUserDashboardsResponse () {
        const data = {
            items: [
                {
                    _id: '987654',
                    author: 'johndoe',
                    backgroundColor: '#999999',
                    companyID: 'COMPID',
                    createdBy: 'bar',
                    dashboardName: 'New Dashboard',
                    dashboardType: 'DEFAULT',
                    html: '<div> hello world </div>'
                }
            ]
        };

        return data;
    }
});
