app.directive('wstDropzone', function () {
    return {

        scope: {

            listModel: '=',
            role: '=',

            forbidAggregation: '=',

            displayOptions: '=',
            displayCallback: '=',

            hideColumn: '=',
            setSortType: '=',
            changeAxis: '=',
            stackBars: '=',

            zoneInfo: '=',
            removeToolTip: '='
        },

        link: function (scope) {
            scope.fieldsAggregations = scope.$parent.fieldsAggregations;
            scope.aggregationChoosed = scope.$parent.aggregationChoosed;

            scope.onDrop = function (data, event) {
                event.stopPropagation();

                var newItem = data['json/custom-object'];
                newItem.zone = scope.zone;

                if (newItem.aggregation && scope.forbidAggregation) {
                    if (typeof newItem.originalLabel === 'undefined') {
                        newItem.originalLabel = newItem.elementLabel;
                    }
                    delete (newItem.aggregation);
                    newItem.elementLabel = newItem.originalLabel;
                    newItem.objectLabel = newItem.originalLabel;
                }

                var found = false;
                for (const item of scope.listModel) {
                    if (item.elementID === newItem.elementID) { found = true; }
                }

                if (!found) {
                    scope.listModel.push(newItem);
                } else {
                    // Handle this
                }

                scope.$parent.onDropField(newItem, scope.role);
            };

            scope.onRemove = function (item, event) {
                var index = -1;
                for (const i in scope.listModel) {
                    if (scope.listModel[i].elementID === item.elementID) { index = i; break; }
                }

                if (index > -1) {
                    scope.listModel.splice(index, 1);
                } else {
                    // handle this case
                }

                scope.$parent.onRemoveField(item, scope.role);
            };

            scope.onDragOver = function (event) {

            };
        },

        templateUrl: 'partials/report/directives/wstDropzone.html'

    };
});
