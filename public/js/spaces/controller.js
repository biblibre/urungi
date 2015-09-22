app.controller('spacesCtrl', function ($scope,$rootScope, connection, uuid2) {

    //console.log('this is the company data',$rootScope.user.companyData);

    if ($rootScope.user.companyData)
    {
        $scope.data = $rootScope.user.companyData.publicSpace;
        $scope.initialData = $rootScope.user.companyData.publicSpace;
    }

    $scope.newSubItem = function (scope) {
        var nodeData = scope.$modelValue;

        if (nodeData == undefined)
        {
            $scope.data.push({
                id:uuid2.newguid(),
                title: 'my folder',
                nodes: []
            })
        } else {

        nodeData.nodes.push({
            id: uuid2.newguid(),
            title: nodeData.title + '.' + (nodeData.nodes.length + 1),
            nodes: []
        });
        }
    };

    $scope.save = function(){


        connection.post('/api/company/save-public-space', $scope.data, function(data) {
            if (data.result == 1) {
                $rootScope.user.companyData.publicSpace =  $scope.data;
                $scope.initialData = $rootScope.user.companyData.publicSpace;
            }
        });
    }

    $scope.remove = function (scope) {
        scope.remove();
    };

    $scope.toggle = function (scope) {
        scope.toggle();
    };


});
