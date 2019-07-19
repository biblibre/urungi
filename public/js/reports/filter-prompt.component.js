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

    FilterPromptController.$inject = ['$scope', 'gettextCatalog', 'reportModel'];

    function FilterPromptController ($scope, gettextCatalog, reportModel) {
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
        }

        function getElementFilterOptions () {
            const type = vm.filter.elementType;
            const filterOptions = getFilterOptions();
            if (type in filterOptions) {
                return filterOptions[type];
            }

            return [];
        }

        function getDatePatternFilters () {
            const filterOptions = getFilterOptions();

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
                return gettextCatalog.getString('Select to deactivate the runtime');
            } else {
                return gettextCatalog.getString('Make this filter appear in the report interface.');
            }
        }

        const filterOptions = {
            string: [
                { value: 'equal', label: gettextCatalog.getString('equal') },
                { value: 'in', label: gettextCatalog.getString('in') },
                { value: 'diferentThan', label: gettextCatalog.getString('different than') },
                { value: 'notIn', label: gettextCatalog.getString('not in') },
                { value: 'biggerThan', label: gettextCatalog.getString('bigger than') },
                { value: 'biggerOrEqualThan', label: gettextCatalog.getString('bigger or equal than') },
                { value: 'lessThan', label: gettextCatalog.getString('less than') },
                { value: 'lessOrEqualThan', label: gettextCatalog.getString('less or equal than') },
                { value: 'between', label: gettextCatalog.getString('between') },
                { value: 'notBetween', label: gettextCatalog.getString('not between') },
                { value: 'contains', label: gettextCatalog.getString('contains') },
                { value: 'notContains', label: gettextCatalog.getString('not contains') },
                { value: 'startWith', label: gettextCatalog.getString('start with') },
                { value: 'notStartWith', label: gettextCatalog.getString('not start with') },
                { value: 'endsWith', label: gettextCatalog.getString('ends with') },
                { value: 'notEndsWith', label: gettextCatalog.getString('not ends with') },
                { value: 'like', label: gettextCatalog.getString('like') },
                { value: 'notLike', label: gettextCatalog.getString('not like') },
                { value: 'null', label: gettextCatalog.getString('is null') },
                { value: 'notNull', label: gettextCatalog.getString('is not null') },
            ],
            array: [
                { value: 'equal', label: gettextCatalog.getString('equal') },
                { value: 'diferentThan', label: gettextCatalog.getString('different than') },
                { value: 'null', label: gettextCatalog.getString('is null') },
                { value: 'notNull', label: gettextCatalog.getString('is not null') },
                { value: 'in', label: gettextCatalog.getString('in') },
                { value: 'notIn', label: gettextCatalog.getString('not in') },
            ],
            number: [
                { value: 'equal', label: gettextCatalog.getString('equal') },
                { value: 'in', label: gettextCatalog.getString('in') },
                { value: 'diferentThan', label: gettextCatalog.getString('different than') },
                { value: 'notIn', label: gettextCatalog.getString('not in') },
                { value: 'biggerThan', label: gettextCatalog.getString('bigger than') },
                { value: 'biggerOrEqualThan', label: gettextCatalog.getString('bigger or equal than') },
                { value: 'lessThan', label: gettextCatalog.getString('less than') },
                { value: 'lessOrEqualThan', label: gettextCatalog.getString('less or equal than') },
                { value: 'between', label: gettextCatalog.getString('between') },
                { value: 'notBetween', label: gettextCatalog.getString('not between') },
                { value: 'null', label: gettextCatalog.getString('is null') },
                { value: 'notNull', label: gettextCatalog.getString('is not null') },
            ],
            datePattern: [
                { value: '#WST-TODAY#', label: gettextCatalog.getString('Today') },
                { value: '#WST-THISWEEK#', label: gettextCatalog.getString('This week') },
                { value: '#WST-THISMONTH#', label: gettextCatalog.getString('This month') },
                { value: '#WST-THISYEAR#', label: gettextCatalog.getString('This year') },
                { value: '#WST-FIRSTQUARTER#', label: gettextCatalog.getString('First quarter') },
                { value: '#WST-SECONDQUARTER#', label: gettextCatalog.getString('Second quarter') },
                { value: '#WST-THIRDQUARTER#', label: gettextCatalog.getString('Third quarter') },
                { value: '#WST-FOURTHQUARTER#', label: gettextCatalog.getString('Fourth quarter') },
                { value: '#WST-FIRSTSEMESTER#', label: gettextCatalog.getString('First semester') },
                { value: '#WST-SECONDSEMESTER#', label: gettextCatalog.getString('Second semester') },
                { value: '#WST-YESTERDAY#', label: gettextCatalog.getString('Yesterday') },
                { value: '#WST-LASTWEEK#', label: gettextCatalog.getString('Last week') },
                { value: '#WST-LASTMONTH#', label: gettextCatalog.getString('Last month') },
                { value: '#WST-LASTYEAR#', label: gettextCatalog.getString('Last year') },
                { value: '#WST-LYFIRSTQUARTER#', label: gettextCatalog.getString('Last year first quarter') },
                { value: '#WST-LYSECONDQUARTER#', label: gettextCatalog.getString('Last year second quarter') },
                { value: '#WST-LYTHIRDQUARTER#', label: gettextCatalog.getString('Last year third quarter') },
                { value: '#WST-LYFOURTHQUARTER#', label: gettextCatalog.getString('Last year fourth quarter') },
                { value: '#WST-LYFIRSTSEMESTER#', label: gettextCatalog.getString('Last year first semester') },
                { value: '#WST-LYSECONDSEMESTER#', label: gettextCatalog.getString('Last year second semester') }
            ],
            date: [
                { value: 'equal', label: gettextCatalog.getString('equal') },
                { value: 'equal-pattern', label: gettextCatalog.getString('equal (pattern)') },
                { value: 'diferentThan', label: gettextCatalog.getString('different than') },
                { value: 'diferentThan-pattern', label: gettextCatalog.getString('different than (pattern)') },
                { value: 'biggerThan', label: gettextCatalog.getString('bigger than') },
                { value: 'biggerThan-pattern', label: gettextCatalog.getString('bigger than (pattern)') },
                { value: 'biggerOrEqualThan', label: gettextCatalog.getString('bigger or equal than') },
                { value: 'biggerOrEqualThan-pattern', label: gettextCatalog.getString('bigger or equal than (pattern)') },
                { value: 'lessThan', label: gettextCatalog.getString('less than') },
                { value: 'lessThan-pattern', label: gettextCatalog.getString('less than (pattern)') },
                { value: 'lessOrEqualThan', label: gettextCatalog.getString('less or equal than') },
                { value: 'lessOrEqualThan-pattern', label: gettextCatalog.getString('less or equal than (pattern)') },
                { value: 'between', label: gettextCatalog.getString('between') },
                { value: 'notBetween', label: gettextCatalog.getString('not between') },
                { value: 'null', label: gettextCatalog.getString('is null') },
                { value: 'notNull', label: gettextCatalog.getString('is not null') }
            ],
        };

        function getFilterOptions () {
            return filterOptions;
        }
    }
})();
