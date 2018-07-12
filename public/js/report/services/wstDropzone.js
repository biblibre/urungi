app.directive('wstDropzone', function () {
    return {

        scope: {

            listModel: '=',
            queryBind: '=',

            forbidAggregation: '=',

            displayOptions: '=',
            displayCallback: '=',

            hideColumn: '=',
            setSortType: '=',
            changeAxis: '=',

            zoneInfo: '=',
            removeToolTip: '='
        },

        link: function ($scope) {
            $scope.fieldsAggregations = $scope.$parent.fieldsAggregations;
            $scope.aggregationChoosed = $scope.$parent.aggregationChoosed;

            $scope.onDrop = function (data, event) {
                event.stopPropagation();

                var newItem = data['json/custom-object'];
                newItem.zone = $scope.zone;

                var found = false;
                for (const item of $scope.listModel) {
                    if (item.elementID === newItem.elementID) { found = true; }
                }

                if (!found) {
                    $scope.listModel.push(newItem);
                } else {
                    // Handle this
                }

                $scope.$parent.onDropField(newItem, $scope.queryBind, $scope.forbidAggregation);
            };

            $scope.onRemove = function (item, event) {
                var index = -1;
                for (const i in $scope.listModel) {
                    if ($scope.listModel[i].elementID === item.elementID) { index = i; break; }
                }

                if (index > -1) {
                    $scope.listModel.splice(index, 1);
                } else {
                    // handle this case
                }

                $scope.$parent.onRemoveField(item, $scope.queryBind);
            };

            $scope.onDragOver = function (event) {

            };
        },

        templateUrl: 'partials/widgets/wstDropzone.html'

    };
});
