app.controller('logOutCtrl', function ($scope,$http,$sessionStorage) {
    $http({method: 'POST', url: '/api/logout'}).
        success(function(data, status, headers, config) {
            //$window.location.href="/public#/logout";
            $sessionStorage.removeObject('user');
        }).
        error(function(data, status, headers, config) {
            //console.log(data);
        });
});
