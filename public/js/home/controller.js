app.controller('homeCtrl', ['$scope', '$rootScope','$sessionStorage','connection' ,function ($scope, $rootScope,$sessionStorage, connection ) {

    $scope.dashboardsNbr = 3;
    $scope.reportsNbr = 10;
    $scope.notificationsNbr = 0;
    $scope.alertsNbr = 0;
    $scope.subPage = 'js/report/list.html';
    //$scope.data = $rootScope.user.companyData.publicSpace;



    connection.get('/api/get-user-objects', {}, function(data) {
        console.log('the user objects',JSON.stringify(data.items));
        $scope.data = data.items;
    });

    $scope.getReports = function(params) {
        var params = (params) ? params : {};

        console.log(params);

        connection.get('/api/reports/find-all', params, function(data) {
            $scope.reports = data;
            console.log($scope.reports);
        });
    };

    $scope.getDashboards = function(params) {
        var params = (params) ? params : {};

        connection.get('/api/dashboards/find-all', params, function(data) {
            $scope.dashboards = data;
            //console.log($scope.reports);
        });
    };

    $scope.logOut = function()
    {
        console.log('logout clicked')
        logout();
    }

    $scope.getCounts = function()
    {
       /* connection.get('/api/get-counts', {}, function(data) {
            $rootScope.counts = data;
        });*/
    }



}]);





