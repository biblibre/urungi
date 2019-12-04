angular.module('app').controller('logOutCtrl', function ($scope, $http, localStorage) {
    $http({ method: 'POST', url: '/api/user/logout' })
        .then(function () {
            localStorage.setObject('user', undefined);
            localStorage.removeObject('user');
        })
        .catch(function () {
            localStorage.setObject('user', undefined);
            localStorage.removeObject('user');
        });
});
