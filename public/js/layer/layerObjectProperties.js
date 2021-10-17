angular.module('app').directive('layerObjectProperties', function ($compile, c3Charts, layerElementTypes, layerNumberDefaultAggregation, layerStringDefaultAggregation) {
    return {
        transclude: true,
        scope: {
            onChange: '=',
            onDelete: '&',
            onEdit: '=',
            objectType: '=',
            object: '=',
            layer: '=',
            onDeleteElement: '=',
            onPublishElement: '='
        },

        templateUrl: 'partials/layer/objectProperties.html',
        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {
            $scope.delete = function () {
                $scope.onDelete($scope.object, $scope.objectType);
            };

            $scope.changeJoinType = function (joinType) {
                $scope.object.joinType = joinType;
                $scope.object.connection.setType(joinType);
            };

            $scope.publishElement = function () {
                $scope.onPublishElement($scope.object);
            };

            $scope.removeElement = function () {
                $scope.onDeleteElement($scope.object);
            };

            $scope.elementTypes = layerElementTypes;
            $scope.numberDefaultAggregation = layerNumberDefaultAggregation;
            $scope.stringDefaultAggregation = layerStringDefaultAggregation;
        }

    };
});
