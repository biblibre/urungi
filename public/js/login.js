(function () {
    'use strict';

    angular.module('app-login', ['app.core']);

    angular.module('app-login').config(configure);

    configure.$inject = ['$locationProvider', '$httpProvider', 'base'];

    function configure ($locationProvider, $httpProvider, base) {
        $locationProvider.html5Mode(true);

        $httpProvider.interceptors.push('httpInterceptor');
    }

    angular.module('app-login').run(runBlock);

    runBlock.$inject = ['language'];

    function runBlock (language) {
        language.setLanguageFromLocalStorage();
    }

    angular.module('app-login').controller('PublicCtrl', PublicCtrl);

    PublicCtrl.$inject = ['$scope', '$http', '$window', 'base', 'localStorage'];

    function PublicCtrl ($scope, $http, $window, base, localStorage) {
        var user = localStorage.getObject('user');

        $scope.loginError = false;
        $scope.errorLoginMessage = '';
        $scope.login = function () {
            var user = { userName: $scope.userName, password: $scope.password, remember_me: $scope.rememberMe, companyID: $('#companyID').attr('value') };

            if ($scope.userName !== undefined || $scope.password !== undefined) {
                $http({ method: 'POST', url: '/api/login', data: user, withCredentials: true })
                    .then(function (data, status, headers, config) {
                        $scope.loginError = false;

                        if ($scope.rememberMe) {
                            // FIXME This stores the user password in local storage !
                            localStorage.setObject('user', user);
                        }
                        $window.location.href = base + '/home';
                    })
                    .catch(function (data, status, headers, config) {
                        $scope.errorLoginMessage = data.data;
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
