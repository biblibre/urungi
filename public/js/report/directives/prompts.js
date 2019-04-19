'use strict';

angular.module('app').directive('ndPrompt', function (reportModel) {
    return {
        transclude: true,
        scope: {

            isPrompt: '=',
            filter: '=',
            onChange: '=',

            setPrompt: '=',
            getQuery: '='
        },

        templateUrl: 'partials/report/directives/promptsDirective.html',

        // append
        replace: true,
        // attribute restriction
        restrict: 'E',
        // linking method
        link: function ($scope, element, attrs) {
            $scope.criteriaInput = 'partials/report/directives/criteriaInput.html';

            $scope.criterion = $scope.filter.criterion;

            $scope.removeFilter = function () {
                $scope.$parent.onRemoveFilter($scope.filter, 'filter');
            };

            $scope.setDatePatternFilterType = function (option) {
                $scope.criterion.label = option.label;
                $scope.criterion.datePattern = option.value;
                $scope.onChange();
            };

            $scope.clearFilter = function () {
                for (const i in $scope.criterion) {
                    $scope.criterion[i] = undefined;
                }

                $scope.criterion.textList = [];

                $scope.onChange();
            };

            $scope.promptChanged = function () {
                $scope.onChange();
            };

            // $scope.onDateSet = function (newDate) {
            //     if (angular.isDate(newDate)) {
            //         var year = newDate.getFullYear();
            //         var month = pad(newDate.getMonth() + 1, 2);
            //         var day = pad(newDate.getDate(), 2);
            //         var theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');

            //         $scope.criterion.text1 = theDate;
            //         $scope.criterion.label1 = String(year) + '-' + String(month) + '-' + String(day);

            //         // filter.searchValue = theDate;
            //         // filter.filterValue = theDate;
            //         // filter.dateCustomFilterLabel = undefined;
            //     }

            //     $scope.onChange();
            //     // checkForOnChange(filter);
            // };

            // $scope.onDateEndSet = function (newDate) {
            //     if (angular.isDate(newDate)) {
            //         var year = newDate.getFullYear();
            //         var month = pad(newDate.getMonth() + 1, 2);
            //         var day = pad(newDate.getDate(), 2);
            //         var theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');

            //         $scope.criterion.text2 = theDate;
            //         $scope.criterion.label2 = String(year) + '-' + String(month) + '-' + String(day);
            //         // filter.dateCustomFilterLabel = undefined;
            //     }
            //     // checkForOnChange(filter);
            //     $scope.onChange();
            // };

            $scope.onDateListChange = function (newDate) {
                if (angular.isDate(newDate)) {
                    var year = newDate.getFullYear();
                    var month = pad(newDate.getMonth() + 1, 2);
                    var day = pad(newDate.getDate(), 2);
                    var theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
                    $scope.criterion.text2 = theDate;
                    // filter.dateCustomFilterLabel = undefined;
                }
                // checkForOnChange(filter);
                $scope.onChange();
            };

            // $scope.filterSelectChanged = function (item) {
            //     var theResult = '';

            //     for (var i in $scope.filter.searchValue) {
            //         theResult = theResult + $scope.filter.searchValue[i][filter.id];
            //         if (i < filter.searchValue.length - 1) { theResult += ';'; }
            //     }
            //     $scope.criterion.label1 = theResult;
            //     // checkForOnChange(filter);
            // };

            $scope.$on('updateFilters', function () {
                $scope.update();
            });

            $scope.update = function () {
                $scope.loadFilterValues();
            };

            $scope.loadFilterValues = function () {
                const fQuery = $scope.getQuery($scope.filter);

                return reportModel.fetchData(fQuery).then(function (result) {
                    var possibleValues = new Set();
                    for (const item of result.data) {
                        possibleValues.add(item.f);
                    }

                    $scope.values = Array.from(possibleValues.values());
                });
            };

            $scope.selectFirstValue = function (selectedValue) {
                $scope.criterion.text1 = selectedValue;

                // $scope.filter.searchValue = selectedValue;
                // var searchValue = '';
                // if ($scope.filter.filterType === 'in' || $scope.filter.filterType === 'notIn') {
                //     for (var i in $scope.filter.searchValue) {
                //         searchValue += $scope.filter.searchValue[i][$scope.filter.id];
                //         if (i < $scope.filter.searchValue.length - 1) {
                //             searchValue += ';';
                //         }
                //     }
                // } else {
                //     searchValue = $scope.filter.searchValue;
                // }

                // $scope.filter.filterText1 = searchValue;
                // $scope.filter.filterValue = searchValue;
                // $scope.showList = false;

                // var values = {};
                // values.filterText1 = $scope.filter.filterText1;
                // values.searchValue = $scope.filter.searchValue;
                // values.filterValue = $scope.filter.filterValue;
                // values.dateCustomFilterLabel = $scope.filter.dateCustomFilterLabel;

                $scope.onChange();
            };

            $scope.selectSecondValue = function (selectedValue) {
                $scope.criterion.text2 = selectedValue;
                $scope.onChange();
            };

            $scope.selectListValue = function (selectedValue) {
                var i = $scope.criterion.textList.indexOf(selectedValue);
                if (i >= 0) {
                    $scope.criterion.textList.splice(i, 1);
                } else {
                    $scope.criterion.textList.push(selectedValue);
                }
            };

            $scope.inputChanged = function (filter) {
                $scope.onChange();
            };

            $scope.updateCondition = function (filter, condition) {
                filter.conditionType = condition.conditionType;
                filter.conditionLabel = condition.conditionLabel;
            };

            $scope.getElementFilterOptions = function () {
                switch ($scope.filter.elementType) {
                case 'array':
                    return $scope.filterArrayOptions;
                case 'string':
                    return $scope.filterStringOptions;
                case 'number':
                    return $scope.filterNumberOptions;
                case 'date':
                    return $scope.filterDateOptions;
                default:
                    return [];
                }
            };

            $scope.setFilterType = function (filterOption) {
                $scope.filter.filterType = filterOption.value;
                $scope.filter.filterTypeLabel = filterOption.label;

                $scope.onChange();

                // if (filter.filterType === 'null' || filter.filterType === 'notNull') {
                //     var values = {};
                //     values.filterText1 = filter.filterText1;
                //     values.searchValue = filter.searchValue;
                //     values.filterValue = filter.filterValue;
                //     values.dateCustomFilterLabel = filter.dateCustomFilterLabel;

                //     $scope.onChange($scope.elementId, values);
                // }
            };

            $scope.aggregationChoosed = function (column, variable) {
                if (variable.value === 'original') {
                    delete (column.aggregation);
                } else {
                    column.aggregation = variable.value;
                }

                if (typeof column.originalLabel === 'undefined') {
                    column.originalLabel = column.elementLabel;
                }

                if (variable.value === 'original') {
                    column.elementLabel = column.originalLabel;
                    column.objectLabel = column.originalLabel;
                } else {
                    column.elementLabel = column.originalLabel + ' (' + variable.name + ')';
                    column.objectLabel = column.originalLabel + ' (' + variable.name + ')';
                }
            };

            $scope.isComplete = function () {
                return true;
            };

            function pad (num, size) {
                var s = num + '';
                while (s.length < size) s = '0' + s;
                while (s.length < size) s = '0' + s;
                return s;
            }

            $scope.makePrompt = function () {
                $scope.setPrompt($scope.filter);
            };

            // function checkForOnChange (filter) {
            //     var values = {};
            //     values.filterText1 = filter.filterText1;
            //     values.searchValue = filter.searchValue;
            //     values.filterValue = filter.filterValue;
            //     values.dateCustomFilterLabel = filter.dateCustomFilterLabel;
            //     values.filterText2 = filter.filterText2;
            //     if ((filter.filterType === 'between' || filter.filterType === 'not between') && (typeof filter.filterText2 !== 'undefined' && filter.filterText2 !== '')) {
            //         $scope.onChange($scope.elementId, values);
            //     }
            //     if (filter.filterType !== 'between' && filter.filterType !== 'not between') {
            //         $scope.onChange($scope.elementId, values);
            //     }
            // }

            $scope.fieldAggregations = $scope.$parent.fieldAggregations;

            $scope.conditionTypes = [
                { conditionType: 'and', conditionLabel: 'AND' },
                { conditionType: 'or', conditionLabel: 'OR' },
                { conditionType: 'andNot', conditionLabel: 'AND NOT' },
                { conditionType: 'orNot', conditionLabel: 'OR NOT' }
            ];

            $scope.filterStringOptions = [
                { value: 'equal', label: 'equal' },
                { value: 'in', label: 'in' },
                { value: 'diferentThan', label: 'different than' },
                { value: 'notIn', label: 'not in' },
                { value: 'biggerThan', label: 'bigger than' },
                { value: 'biggerOrEqualThan', label: 'bigger or equal than' },
                { value: 'lessThan', label: 'less than' },
                { value: 'lessOrEqualThan', label: 'less or equal than' },
                { value: 'between', label: 'between' },
                { value: 'notBetween', label: 'not between' },
                { value: 'contains', label: 'contains' },
                { value: 'notContains', label: 'not contains' },
                { value: 'startWith', label: 'start with' },
                { value: 'notStartWith', label: 'not start with' },
                { value: 'endsWith', label: 'ends with' },
                { value: 'notEndsWith', label: 'not ends with' },
                { value: 'like', label: 'like' },
                { value: 'notLike', label: 'not like' },
                { value: 'null', label: 'is null' },
                { value: 'notNull', label: 'is not null' }

            ];
            $scope.filterArrayOptions = [
                { value: 'equal', label: 'equal' },
                { value: 'diferentThan', label: 'different than' }, // TODO: el different than no está funcionando
                { value: 'null', label: 'is null' },
                { value: 'notNull', label: 'is not null' },
                { value: 'in', label: 'in' },
                { value: 'notIn', label: 'not in' }
            ];

            $scope.filterNumberOptions = [
                { value: 'equal', label: 'equal' },
                { value: 'in', label: 'in' },
                { value: 'diferentThan', label: 'different than' },
                { value: 'notIn', label: 'not in' },
                { value: 'biggerThan', label: 'bigger than' },
                { value: 'biggerOrEqualThan', label: 'bigger or equal than' },
                { value: 'lessThan', label: 'less than' },
                { value: 'lessOrEqualThan', label: 'less or equal than' },
                { value: 'between', label: 'between' },
                { value: 'notBetween', label: 'not between' },
                { value: 'null', label: 'is null' },
                { value: 'notNull', label: 'is not null' }
            ];

            $scope.signalOptions = [
                { value: 'equal', label: 'equal' },
                { value: 'diferentThan', label: 'different than' },
                { value: 'biggerThan', label: 'bigger than' },
                { value: 'biggerOrEqualThan', label: 'bigger or equal than' },
                { value: 'lessThan', label: 'less than' },
                { value: 'lessOrEqualThan', label: 'less or equal than' },
                { value: 'between', label: 'between' },
                { value: 'notBetween', label: 'not between' }
            ];

            $scope.datePatternFilters = [
                { value: '#WST-TODAY#', label: 'Today' },
                { value: '#WST-THISWEEK#', label: 'This week' },
                { value: '#WST-THISMONTH#', label: 'This month' },
                { value: '#WST-THISYEAR#', label: 'This year' },
                { value: '#WST-FIRSTQUARTER#', label: 'First quarter' },
                { value: '#WST-SECONDQUARTER#', label: 'Second quarter' },
                { value: '#WST-THIRDQUARTER#', label: 'Third quarter' },
                { value: '#WST-FOURTHQUARTER#', label: 'Fourth quarter' },
                { value: '#WST-FIRSTSEMESTER#', label: 'First semester' },
                { value: '#WST-SECONDSEMESTER#', label: 'Second semester' },
                { value: '#WST-YESTERDAY#', label: 'Yesterday' },
                { value: '#WST-LASTWEEK#', label: 'Last week' },
                { value: '#WST-LASTMONTH#', label: 'Last month' },
                { value: '#WST-LASTYEAR#', label: 'Last year' },
                { value: '#WST-LYFIRSTQUARTER#', label: 'Last year first quarter' },
                { value: '#WST-LYSECONDQUARTER#', label: 'Last year second quarter' },
                { value: '#WST-LYTHIRDQUARTER#', label: 'Last year third quarter' },
                { value: '#WST-LYFOURTHQUARTER#', label: 'Last year fourth quarter' },
                { value: '#WST-LYFIRSTSEMESTER#', label: 'Last year first semester' },
                { value: '#WST-LYSECONDSEMESTER#', label: 'Last year second semester' }
            ];

            $scope.filterDateOptions = [
                { value: 'equal', label: 'equal' },
                { value: 'equal-pattern', label: 'equal (pattern)' },
                // {value:"in",label:"in"},
                { value: 'diferentThan', label: 'different than' },
                { value: 'diferentThan-pattern', label: 'different than (pattern)' },
                // {value:"notIn",label:"not in"},
                { value: 'biggerThan', label: 'bigger than' },
                { value: 'biggerThan-pattern', label: 'bigger than (pattern)' },
                { value: 'biggerOrEqualThan', label: 'bigger or equal than' },
                { value: 'biggerOrEqualThan-pattern', label: 'bigger or equal than (pattern)' },
                { value: 'lessThan', label: 'less than' },
                { value: 'lessThan-pattern', label: 'less than (pattern)' },
                { value: 'lessOrEqualThan', label: 'less or equal than' },
                { value: 'lessOrEqualThan-pattern', label: 'less or equal than (pattern)' },
                { value: 'between', label: 'between' },
                { value: 'notBetween', label: 'not between' },
                { value: 'null', label: 'is null' },
                { value: 'notNull', label: 'is not null' }
                // TODO: in , not in or date elements
            ];
        }
    };
});
