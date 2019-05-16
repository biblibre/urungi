(function () {
    'use strict';

    angular.module('app-login', ['app.core']);

    angular.module('app-login').controller('PublicCtrl', PublicCtrl);

    PublicCtrl.$inject = ['$scope', '$http', 'sessionStorage', 'localStorage', 'connection'];

    function PublicCtrl ($scope, $http, sessionStorage, localStorage, connection) {
        var user = localStorage.getObject('user');

        $scope.loginError = false;
        $scope.errorLoginMessage = '';
        $scope.login = function () {
            var user = { 'userName': $scope.userName, 'password': $scope.password, 'remember_me': $scope.rememberMe, 'companyID': $('#companyID').attr('value') };

            if ($scope.userName !== undefined || $scope.password !== undefined) {
                $http({ method: 'POST', url: '/api/login', data: user, withCredentials: true })
                    .success(function (data, status, headers, config) {
                        $scope.loginError = false;

                        var theUser = data.user;
                        connection.get('/api/get-user-data').then(function (data) {
                            if ($scope.rememberMe) {
                                localStorage.setObject('user', user);
                            }
                            theUser.companyData = data.items.companyData;
                            theUser.rolesData = data.items.rolesData;
                            theUser.reportsCreate = data.items.reportsCreate;
                            theUser.dashboardsCreate = data.items.dashboardsCreate;
                            theUser.pagesCreate = data.items.pagesCreate;
                            theUser.exploreData = data.items.exploreData;
                            theUser.isWSTADMIN = data.items.isWSTADMIN;
                            theUser.contextHelp = data.items.contextHelp;
                            theUser.dialogs = data.items.dialogs;
                            theUser.viewSQL = data.items.viewSQL;
                            sessionStorage.setObject('user', theUser);
                            window.location.href = '/#/home';
                        });
                    })
                    .error(function (data, status, headers, config) {
                        $scope.errorLoginMessage = data;
                        $scope.loginError = true;
                    });
            }
        };

        if (user) {
            $scope.userName = user.userName;
            $scope.password = user.password;
            $scope.rememberMe = user.remember_me;

            $scope.login();
        }
    }
})();
