app.controller('logOutCtrl', function ($scope,$http,$sessionStorage, $localStorage) {
    $http({method: 'POST', url: '/api/logout'}).
        success(function(data, status, headers, config) {
            $sessionStorage.removeObject('user');
            $localStorage.removeObject('user');
        }).
        error(function(data, status, headers, config) {
            //console.log(data);
        });
});
