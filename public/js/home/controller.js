app.controller('homeCtrl', ['$scope', '$rootScope','$sessionStorage','connection' ,function ($scope, $rootScope,$sessionStorage, connection ) {

    $scope.dashboardsNbr = 3;
    $scope.reportsNbr = 10;
    $scope.notificationsNbr = 0;
    $scope.alertsNbr = 0;
    $scope.subPage = 'js/report/list.html';
    //$scope.data = $rootScope.user.companyData.publicSpace;





    connection.get('/api/get-user-last-executions', {}, function(data) {
        //console.log('the user last executions',JSON.stringify(data.items));
        $scope.lastExecutions = [];
        $scope.mostExecutions = [];

        for ( var l in data.items.theLastExecutions)
            {
                if (l < 10)
                {
                    data.items.theLastExecutions[l]._id['lastDate'] =  moment(data.items.theLastExecutions[l].lastDate).fromNow();
                    $scope.lastExecutions.push(data.items.theLastExecutions[l]._id);
                }
            }
        for ( var m in data.items.theMostExecuted)
            {
                if (m < 10)
                {
                    data.items.theMostExecuted[m]._id['count'] =  data.items.theMostExecuted[m].count;
                    $scope.mostExecutions.push(data.items.theMostExecuted[m]._id);
                }
            }

        //console.log('the user most executions',JSON.stringify($scope.mostExecutions));
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

    $scope.refreshHome = function()
    {
        connection.get('/api/get-user-objects', {}, function(data) {
            $rootScope.userObjects = data.items;
            $rootScope.user.canPublish = data.userCanPublish;
        });

        connection.get('/api/get-counts', {}, function(data) {
            $rootScope.counts = data;
        });
    }



}]);





