import i18n from '../../i18n.js';

angular.module('app.report').component('appFilterPrompt', {
    templateUrl: 'partials/report/report.filter-prompt.component.html',
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

FilterPromptController.$inject = ['$scope', 'api'];

function FilterPromptController ($scope, api) {
    const vm = this;

    vm.$onInit = $onInit;
    vm.clearFilter = clearFilter;
    vm.criteriaInput = 'partials/report/report.criteria-input.html';
    vm.getFilterTypeLabel = getFilterTypeLabel;
    vm.getDatePatternFilters = getDatePatternFilters;
    vm.getDateString = getDateString;
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

    function $onInit () {
        vm.criterion = vm.filter.criterion;
        if (!vm.filter.suggestions) {
            vm.filter.suggestions = {
                show: true,
                limit: 15,
                unlimited: false
            };
        }

        if (vm.filter.elementType === 'date') {
            const re = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
            const text1Result = re.exec(vm.criterion.text1);
            if (text1Result) {
                const { year, month, day } = text1Result.groups;
                vm.date1 = new Date(year, parseInt(month) - 1, day);
            }
            const text2Result = re.exec(vm.criterion.text2);
            if (text2Result) {
                const { year, month, day } = text2Result.groups;
                vm.date2 = new Date(year, parseInt(month) - 1, day);
            }
        }
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
        };

        if (vm.filter.suggestions.show) {
            if (!vm.filter.suggestions.unlimited) {
                const limit = parseInt(vm.filter.suggestions.limit, 10);
                options.limit = limit > 0 ? limit : 15;
            }

            return api.getReportFilterValues(vm.filter, options).then(function (result) {
                const values = result.data.map(row => row.f).filter(f => f !== null && f !== undefined && f.trim() !== '');
                vm.values = values;
                return values;
            });
        }
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

    function getDateString (date) {
        return [
            date.getFullYear(),
            (date.getMonth() + 1).toString().padStart(2, '0'),
            date.getDate().toString().padStart(2, '0'),
        ].join('-');
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

    function getFilterTypeLabel (filterType) {
        const labels = {
            equal: i18n.gettext('is equal to'),
            'equal-pattern': i18n.gettext('is equal to (pattern)'),
            diferentThan: i18n.gettext('is different than'),
            'diferentThan-pattern': i18n.gettext('is different than (pattern)'),
            in: i18n.gettext('is in'),
            notIn: i18n.gettext('is not in'),
            biggerThan: i18n.gettext('is bigger than'),
            'biggerThan-pattern': i18n.gettext('is bigger than (pattern)'),
            biggerOrEqualThan: i18n.gettext('is bigger or equal than'),
            'biggerOrEqualThan-pattern': i18n.gettext('is bigger or equal than (pattern)'),
            lessThan: i18n.gettext('is less than'),
            'lessThan-pattern': i18n.gettext('is less than (pattern)'),
            lessOrEqualThan: i18n.gettext('is less or equal than'),
            'lessOrEqualThan-pattern': i18n.gettext('is less or equal than (pattern)'),
            between: i18n.gettext('is between'),
            notBetween: i18n.gettext('is not between'),
            contains: i18n.gettext('contains'),
            notContains: i18n.gettext('does not contain'),
            startWith: i18n.gettext('starts with'),
            notStartWith: i18n.gettext('does not start with'),
            endsWith: i18n.gettext('ends with'),
            notEndsWith: i18n.gettext('does not end with'),
            like: i18n.gettext('is like'),
            notLike: i18n.gettext('is not like'),
            null: i18n.gettext('is null'),
            notNull: i18n.gettext('is not null'),
            empty: i18n.gettext('is empty'),
            notEmpty: i18n.gettext('is not empty'),
        };

        if (filterType in labels) {
            return labels[filterType];
        }
    }

    const datePatternOptions = [
        { value: '#WST-TODAY#', label: i18n.gettext('Today') },
        { value: '#WST-THISWEEK#', label: i18n.gettext('This week') },
        { value: '#WST-THISMONTH#', label: i18n.gettext('This month') },
        { value: '#WST-THISYEAR#', label: i18n.gettext('This year') },
        { value: '#WST-FIRSTQUARTER#', label: i18n.gettext('First quarter') },
        { value: '#WST-SECONDQUARTER#', label: i18n.gettext('Second quarter') },
        { value: '#WST-THIRDQUARTER#', label: i18n.gettext('Third quarter') },
        { value: '#WST-FOURTHQUARTER#', label: i18n.gettext('Fourth quarter') },
        { value: '#WST-FIRSTSEMESTER#', label: i18n.gettext('First semester') },
        { value: '#WST-SECONDSEMESTER#', label: i18n.gettext('Second semester') },
        { value: '#WST-YESTERDAY#', label: i18n.gettext('Yesterday') },
        { value: '#WST-LASTWEEK#', label: i18n.gettext('Last week') },
        { value: '#WST-LASTMONTH#', label: i18n.gettext('Last month') },
        { value: '#WST-LASTYEAR#', label: i18n.gettext('Last year') },
        { value: '#WST-LYFIRSTQUARTER#', label: i18n.gettext('Last year first quarter') },
        { value: '#WST-LYSECONDQUARTER#', label: i18n.gettext('Last year second quarter') },
        { value: '#WST-LYTHIRDQUARTER#', label: i18n.gettext('Last year third quarter') },
        { value: '#WST-LYFOURTHQUARTER#', label: i18n.gettext('Last year fourth quarter') },
        { value: '#WST-LYFIRSTSEMESTER#', label: i18n.gettext('Last year first semester') },
        { value: '#WST-LYSECONDSEMESTER#', label: i18n.gettext('Last year second semester') }
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
            'empty',
            'notEmpty',
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
            'empty',
            'notEmpty',
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
