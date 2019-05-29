(function () {
    'use strict';

    angular.module('app.users').controller('UsersListController', UsersListController);

    UsersListController.$inject = ['$uibModal', 'connection', 'userService'];

    function UsersListController ($uibModal, connection, userService) {
        const vm = this;

        vm.page = 1;
        vm.pages = 1;
        vm.users = [];
        vm.getUsers = getUsers;
        vm.changeUserStatus = changeUserStatus;
        vm.goToPage = goToPage;
        vm.newUser = newUser;

        activate();

        function activate () {
            vm.getUsers(1);
        }

        function changeUserStatus (user) {
            userService.getCurrentUser().then(currentUser => {
                if (currentUser.isWSTADMIN) {
                    let newStatus;
                    if (user.status === 'active') { newStatus = 'Not active'; }
                    if (user.status === 'Not active') { newStatus = 'active'; }

                    var data = { userID: user._id, status: newStatus };

                    connection.post('/api/admin/users/change-user-status', data).then(function (result) {
                        user.status = newStatus;
                    });
                }
            });
        };

        function getUsers (page) {
            var params = {
                page: page || 1,
                fields: ['userName', 'lastName', 'status']
            };

            connection.get('/api/admin/users/find-all', params).then(function (data) {
                vm.users = data.items;
                vm.page = data.page;
                vm.pages = data.pages;
            });
        };

        function goToPage (page) {
            vm.getUsers(page);
        };

        function newUser () {
            const modal = $uibModal.open({
                component: 'appUsersEditModal',
                resolve: {
                    mode: () => 'new',
                    user: () => ({
                        roles: [],
                        status: 'active',
                        sendPassword: true,
                    }),
                },
            });

            modal.result.then(function () {
                vm.getUsers(vm.page);
            });
        };
    }
})();
