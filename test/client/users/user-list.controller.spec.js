require('../../../public/js/core/core.module.js');
require('../../../public/js/core/api.js');
require('../../../public/js/core/constants.js');
require('../../../public/js/core/connection.js');
require('../../../public/js/core/notify.service.js');
require('../../../public/js/core/user.service.js');
require('../../../public/js/users/users.module.js');
require('../../../public/js/users/users-list.controller.js');

describe('UsersListController', function () {
    beforeEach(angular.mock.module('app.users'));

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
        it('should call /api/users', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond({ roles: 'ADMIN' });
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());

            vm = $controller('UsersListController');
            $httpBackend.flush();

            expect(vm.users).toHaveLength(2);
        });
    });

    describe('goToPage', function () {
        it('should call /api/users', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond({ roles: 'ADMIN' });
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());

            vm = $controller('UsersListController');
            $httpBackend.flush();

            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=2')
                .respond(getUsersFindAllResponse(2));

            vm.goToPage(2);
            $httpBackend.flush();

            expect(vm.page).toBe(2);
            expect(vm.pages).toBe(2);
        });
    });

    describe('changeStatus', function () {
        let admin, user;

        beforeEach(function () {
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
        it('should change status of specific user on admin session', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond({ roles: admin.roles });
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());

            vm = $controller('UsersListController');
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
        it('should edit specific user on admin session', function () {
            $httpBackend.expect('GET', '/api/user')
                .respond({ roles: 'ADMIN' });
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());

            vm = $controller('UsersListController', { $uibModal: $uibModalMock, notify: notifyMock });
            $httpBackend.flush();

            vm.editUser(user, admin);

            $httpBackend.expect('GET', '/api/users/bar')
                .respond(getUsersFindAllResponse());
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());
            $httpBackend.flush();

            expect($uibModalMock.open).toHaveBeenCalled();
        });
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
                .respond({ roles: 'ADMIN' });
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());

            vm = $controller('UsersListController', { $uibModal: $uibModalMock, notify: notifyMock });
            $httpBackend.flush();

            vm.deleteUser(user, admin);
            $httpBackend.expect('GET', '/api/users?fields=userName,lastName,status&page=1')
                .respond(getUsersFindAllResponse());
            $httpBackend.flush();

            expect($uibModalMock.open).toHaveBeenCalled();
            expect(notifyMock.success).toHaveBeenCalledWith('User deleted successfully');
        });
    });

    function getUsersFindAllResponse (page = 1) {
        return {
            page: page,
            pages: page,
            data: [
                {
                    _id: 'foo',
                    userName: 'admin',
                    status: 'active',
                    roles: ['ADMIN']
                },
                {
                    _id: 'bar',
                    userName: 'johndoe',
                    status: 'active',
                    roles: ['GUEST']
                }
            ],
        };
    }
});
