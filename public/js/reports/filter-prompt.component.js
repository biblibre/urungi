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

    FilterPromptController.$inject = ['$scope', 'gettextCatalog', 'api'];

    function FilterPromptController ($scope, gettextCatalog, api) {
        const vm = this;

        vm.$onInit = $onInit;
        vm.clearFilter = clearFilter;
        vm.criteriaInput = 'partials/reports/criteria-input.html';
        vm.getFilterTypeLabel = getFilterTypeLabel;
        vm.getButtonFilterPromptMessage = getButtonFilterPromptMessage;
        vm.getDatePatternFilters = getDatePatternFilters;
        vm.getElementFilterOptions = getElementFilterOptions;
        vm.getFilterValues = getFilterValues;
        vm.inputChanged = inputChanged;
        vm.makePrompt = makePrompt;
        vm.onDateListChange = onDateListChange;
        vm.promptChanged = promptChanged;
        vm.removeFilter = removeFilter;
        vm.selectFirstValue = selectFirstValue;
        vm.selectListValue = selectListValue;
        vm.selectSecondValue = selectSecondValue;
        vm.setDatePatternFilterType = setDatePatternFilterType;
        vm.setFilterType = setFilterType;
        vm.values = [];
        vm.prefillLimit = 15;

        function $onInit () {
            vm.criterion = vm.filter.criterion;
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
                const year = newDate.getFullYear();
                const month = pad(newDate.getMonth() + 1, 2);
                const day = pad(newDate.getDate(), 2);
                const theDate = new Date(year + '-' + month + '-' + day + 'T00:00:00.000Z');
                vm.criterion.text2 = theDate;
            }
            vm.onChange();
        }

        function getFilterValues (term) {
            const options = {
                contains: term,
                limit: (vm.prefillLimit + 1),
            };

            return api.getReportFilterValues(vm.filter, options).then(function (result) {
                const values = result.data.map(row => row.f).filter(f => f !== null && f !== undefined && f.trim() !== '');
                vm.values = values;

                return values;
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
            const i = vm.criterion.textList.indexOf(selectedValue);
            if (i >= 0) {
                vm.criterion.textList.splice(i, 1);
            } else {
                vm.criterion.textList.push(selectedValue);
            }
        }

        function inputChanged (filter) {
            vm.onChange();
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
            return datePatternOptions;
        }

        function setFilterType (filterType) {
            vm.filter.filterType = filterType;

            vm.onChange();
        }

        function makePrompt () {
            vm.setPrompt({ filter: vm.filter });
        }

        function pad (num, size) {
            let s = num + '';
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

        function getFilterTypeLabel (filterType) {
            const labels = {
                equal: gettextCatalog.getString('is equal to'),
                'equal-pattern': gettextCatalog.getString('is equal to (pattern)'),
                diferentThan: gettextCatalog.getString('is different than'),
                'diferentThan-pattern': gettextCatalog.getString('is different than (pattern)'),
                in: gettextCatalog.getString('is in'),
                notIn: gettextCatalog.getString('is not in'),
                biggerThan: gettextCatalog.getString('is bigger than'),
                'biggerThan-pattern': gettextCatalog.getString('is bigger than (pattern)'),
                biggerOrEqualThan: gettextCatalog.getString('is bigger or equal than'),
                'biggerOrEqualThan-pattern': gettextCatalog.getString('is bigger or equal than (pattern)'),
                lessThan: gettextCatalog.getString('is less than'),
                'lessThan-pattern': gettextCatalog.getString('is less than (pattern)'),
                lessOrEqualThan: gettextCatalog.getString('is less or equal than'),
                'lessOrEqualThan-pattern': gettextCatalog.getString('is less or equal than (pattern)'),
                between: gettextCatalog.getString('is between'),
                notBetween: gettextCatalog.getString('is not between'),
                contains: gettextCatalog.getString('contains'),
                notContains: gettextCatalog.getString('does not contain'),
                startWith: gettextCatalog.getString('starts with'),
                notStartWith: gettextCatalog.getString('does not start with'),
                endsWith: gettextCatalog.getString('ends with'),
                notEndsWith: gettextCatalog.getString('does not end with'),
                like: gettextCatalog.getString('is like'),
                notLike: gettextCatalog.getString('is not like'),
                null: gettextCatalog.getString('is null'),
                notNull: gettextCatalog.getString('is not null'),
            };

            if (filterType in labels) {
                return labels[filterType];
            }
        }

        const datePatternOptions = [
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
        ];

        const filterOptions = {
            string: [
                'equal',
                'diferentThan',
                'in',
                'notIn',
                'biggerThan',
                'biggerOrEqualThan',
                'lessThan',
                'lessOrEqualThan',
                'between',
                'notBetween',
                'contains',
                'notContains',
                'startWith',
                'notStartWith',
                'endsWith',
                'notEndsWith',
                'like',
                'notLike',
                'null',
                'notNull',
            ],
            array: [
                'equal',
                'diferentThan',
                'null',
                'notNull',
                'in',
                'notIn',
            ],
            number: [
                'equal',
                'diferentThan',
                'in',
                'notIn',
                'biggerThan',
                'biggerOrEqualThan',
                'lessThan',
                'lessOrEqualThan',
                'between',
                'notBetween',
                'null',
                'notNull',
            ],
            date: [
                'equal',
                'equal-pattern',
                'diferentThan',
                'diferentThan-pattern',
                'biggerThan',
                'biggerThan-pattern',
                'biggerOrEqualThan',
                'biggerOrEqualThan-pattern',
                'lessThan',
                'lessThan-pattern',
                'lessOrEqualThan',
                'lessOrEqualThan-pattern',
                'between',
                'notBetween',
                'null',
                'notNull',
            ],
        };

        function getFilterOptions () {
            return filterOptions;
        }
    }
})();
