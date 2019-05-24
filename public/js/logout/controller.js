angular.module('app').controller('logOutCtrl', function ($scope, $http, localStorage) {
    $http({ method: 'POST', url: '/api/logout' })
        .success(function (data, status, headers, config) {
            localStorage.setObject('user', undefined);
            localStorage.removeObject('user');
        })
        .error(function (data, status, headers, config) {
            localStorage.setObject('user', undefined);
            localStorage.removeObject('user');
        });
});
