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
        language.initLanguage();
    }

    angular.module('app-login').controller('PublicCtrl', PublicCtrl);

    PublicCtrl.$inject = ['$scope', '$http', '$window', 'base'];

    function PublicCtrl ($scope, $http, $window, base) {
        $scope.loginError = false;
        $scope.errorLoginMessage = '';
        $scope.login = function () {
            const user = { userName: $scope.userName, password: $scope.password, companyID: $('#companyID').attr('value') };

            if ($scope.userName !== undefined || $scope.password !== undefined) {
                $http({ method: 'POST', url: '/api/login', data: user, withCredentials: true })
                    .then(function (data, status, headers, config) {
                        $scope.loginError = false;

                        $window.location.href = base + '/home';
                    })
                    .catch(function (data, status, headers, config) {
                        $scope.errorLoginMessage = data.data;
                        $scope.loginError = true;
                    });
            }
        };
    }
})();
