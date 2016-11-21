app.controller('setupCtrl', function ($scope,connection,$routeParams) {

    $scope.editorOptions = {
        lineWrapping : true,
        lineNumbers: true,
        mode: 'css'
    };

    $scope.saveCustomCSS = function()
    {
        connection.post('/api/company/save-custom-css', {customCSS:$scope.customCSS}, function(data) {

            });

    }


});
