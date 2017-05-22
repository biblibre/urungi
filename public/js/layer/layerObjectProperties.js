app.directive('layerObjectProperties', function($compile,icons,c3Charts) {
return {
    transclude: true,
    scope: {
        onChange: '=',
        onDelete: '&',
        objectType: '=',
        object: '=',
        elementTypes: '=',
        stringDefaultAggregation: '=',
        numberDefaultAggregation: '=',
        layer: '=',
        onDeleteElement: '=',
        onPublishElement: '='
    },

   templateUrl: "partials/layer/objectProperties.html",
        // append
    replace: true,
    // attribute restriction
    restrict: 'E',
    // linking method
    link: function($scope, element, attrs) {

        $scope.delete = function()
        {
            $scope.onDelete($scope.object,$scope.objectType);
        }

        $scope.changeJoinType = function(joinType)
        {
            $scope.object.joinType = joinType;
            $scope.object.connection.setType(joinType);
        }

        $scope.publishElement = function()
        {
            $scope.onPublishElement($scope.object);
        }

        $scope.removeElement = function()
        {
            $scope.onDeleteElement($scope.object);
        }



    }

}

});
