angular.module('app').controller('logOutCtrl', function ($scope, $http, localStorage) {
    $http({ method: 'POST', url: '/api/logout' })
        .then(function (data, status, headers, config) {
            localStorage.setObject('user', undefined);
            localStorage.removeObject('user');
        })
        .catch(function (data, status, headers, config) {
            localStorage.setObject('user', undefined);
            localStorage.removeObject('user');
        });
});
