(function () {
    'use strict';

    angular.module('app.reports').component('appFilterPrompt', {
        templateUrl: 'partials/reports/filter-prompt.html',
        controller: FilterPromptController,
        controllerAs: 'vm',
        bindings: {
            isPrompt: '<',
            filter: '<',
            getQuery: '<',
            onChange: '&',
            onRemove: '&',
            setPrompt: '&',
        },
    });

    FilterPromptController.$inject = ['$scope', 'reportModel', 'filterOptions'];

    function FilterPromptController ($scope, reportModel, filterOptions) {
        const vm = this;

        vm.criteriaInput = 'partials/reports/criteria-input.html';
        vm.$onInit = $onInit;
        vm.removeFilter = removeFilter;
        vm.setDatePatternFilterType = setDatePatternFilterType;
        vm.clearFilter = clearFilter;
        vm.promptChanged = promptChanged;
        vm.onDateListChange = onDateListChange;
        vm.update = update;
        vm.loadFilterValues = loadFilterValues;
        vm.selectFirstValue = selectFirstValue;
        vm.selectSecondValue = selectSecondValue;
        vm.selectListValue = selectListValue;
        vm.inputChanged = inputChanged;
        vm.updateCondition = updateCondition;
        vm.getElementFilterOptions = getElementFilterOptions;
        vm.getDatePatternFilters = getDatePatternFilters;
        vm.setFilterType = setFilterType;
        vm.aggregationChoosed = aggregationChoosed;
        vm.makePrompt = makePrompt;
        vm.getButtonFilterPromptMessage = getButtonFilterPromptMessage;

        function $onInit () {
            vm.criterion = vm.filter.criterion;
            $scope.$on('updateFilters', onUpdateFilters);
        }

        function removeFilter () {
            vm.onRemove({ filter: vm.filter });
        }

        function setDatePatternFilterType (option) {
            vm.criterion.label = option.label;
            vm.criterion.datePattern = option.value;
            vm.onChange();
        }

        function clearFilter () {
            for (const i in vm.criterion) {
                vm.criterion[i] = undefined;
            }

            vm.criterion.textList = [];

            vm.onChange();
        }

        function promptChanged () {
            vm.onChange();
        }

        function onDateListChange (newDate) {
            if (angular.isDate(newDate)) {
                var year = newDate.getFullYear();
                var month = pad(newDate.getMonth() + 1, 2);
                var day = pad(newDate.getDate(), 2);
                var theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
                vm.criterion.text2 = theDate;
            }
            vm.onChange();
        }

        function onUpdateFilters () {
            vm.update();
        }

        function update () {
            vm.loadFilterValues();
        }

        function loadFilterValues () {
            const fQuery = vm.getQuery(vm.filter);

            return reportModel.fetchData(fQuery).then(function (result) {
                var possibleValues = new Set();
                for (const item of result.data) {
                    possibleValues.add(item.f);
                }

                vm.values = Array.from(possibleValues.values());
            });
        }

        function selectFirstValue (selectedValue) {
            vm.criterion.text1 = selectedValue;

            vm.onChange();
        }

        function selectSecondValue (selectedValue) {
            vm.criterion.text2 = selectedValue;
            vm.onChange();
        }

        function selectListValue (selectedValue) {
            var i = vm.criterion.textList.indexOf(selectedValue);
            if (i >= 0) {
                vm.criterion.textList.splice(i, 1);
            } else {
                vm.criterion.textList.push(selectedValue);
            }
        }

        function inputChanged (filter) {
            vm.onChange();
        }

        function updateCondition (filter, condition) {
            filter.conditionType = condition.conditionType;
            filter.conditionLabel = condition.conditionLabel;
        }

        function getElementFilterOptions () {
            const type = vm.filter.elementType;
            if (type in filterOptions) {
                return filterOptions[type];
            }

            return [];
        }

        function getDatePatternFilters () {
            return filterOptions.datePattern;
        }

        function setFilterType (filterOption) {
            vm.filter.filterType = filterOption.value;
            vm.filter.filterTypeLabel = filterOption.label;

            vm.onChange();
        }

        function aggregationChoosed (column, variable) {
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
        }

        function makePrompt () {
            vm.setPrompt({ filter: vm.filter });
        }

        function pad (num, size) {
            var s = num + '';
            while (s.length < size) s = '0' + s;
            while (s.length < size) s = '0' + s;
            return s;
        }

        function getButtonFilterPromptMessage (filter) {
            if (filter.filterPrompt) {
                return 'Select to deactivate the runtime';
            } else {
                return 'Make this filter appear in the report interface.';
            }
        }
    }

    angular.module('app.reports').constant('filterOptions', {
        string: [
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
            { value: 'notNull', label: 'is not null' },
        ],
        array: [
            { value: 'equal', label: 'equal' },
            { value: 'diferentThan', label: 'different than' },
            { value: 'null', label: 'is null' },
            { value: 'notNull', label: 'is not null' },
            { value: 'in', label: 'in' },
            { value: 'notIn', label: 'not in' },
        ],
        number: [
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
            { value: 'notNull', label: 'is not null' },
        ],
        datePattern: [
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
        ],
        date: [
            { value: 'equal', label: 'equal' },
            { value: 'equal-pattern', label: 'equal (pattern)' },
            { value: 'diferentThan', label: 'different than' },
            { value: 'diferentThan-pattern', label: 'different than (pattern)' },
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
        ],
    });
})();
