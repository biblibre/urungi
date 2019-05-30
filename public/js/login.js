(function () {
    'use strict';

    angular.module('app-login', ['app.core']);

    angular.module('app-login').controller('PublicCtrl', PublicCtrl);

    PublicCtrl.$inject = ['$scope', '$http', 'localStorage'];

    function PublicCtrl ($scope, $http, localStorage) {
        var user = localStorage.getObject('user');

        $scope.loginError = false;
        $scope.errorLoginMessage = '';
        $scope.login = function () {
            var user = { 'userName': $scope.userName, 'password': $scope.password, 'remember_me': $scope.rememberMe, 'companyID': $('#companyID').attr('value') };

            if ($scope.userName !== undefined || $scope.password !== undefined) {
                $http({ method: 'POST', url: '/api/login', data: user, withCredentials: true })
                    .then(function (data, status, headers, config) {
                        $scope.loginError = false;

                        if ($scope.rememberMe) {
                            // FIXME This stores the user password in local storage !
                            localStorage.setObject('user', user);
                        }
                        window.location.href = '/#/home';
                    })
                    .catch(function (data, status, headers, config) {
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
