/* global TomSelect: false */
import { t } from '../i18n.js';
import api from '../api.js';
import { el } from '../dom.js';
import '../../s/tom-select/tom-select.js';

class ReportFilterForm extends HTMLElement {
    setFilter (filter, initialValue) {
        this.filter = filter;

        const form = el('form.form-inline');
        const label = filter.promptTitle ? filter.promptTitle : filter.elementName;
        const formGroup = el('.form-group', el('label.control-label', label), ' ');
        if (this.isEdit()) {
            formGroup.append(this.getFilterTypeSelect(filter), ' ')
        }

        const inputs = el('.inputs');

        initialValue ??= {};
        Object.assign(filter.criterion, initialValue);

        if (filter.elementType === 'date') {
            if (this.isPatternType(filter)) {
                const select = this.getDatePatternSelect(filter);
                inputs.append(select);
            } else if (false === ['null', 'notNull', 'empty', 'notEmpty'].includes(filter.filterType)) {
                inputs.append(el('input.form-control', { type: 'date', name: 'text1', value: filter.criterion?.text1 }));

                if (filter.filterType === 'between' || filter.filterType === 'notBetween') {
                    inputs.append(' ', el('input.form-control', { type: 'date', name: 'text2', value: filter.criterion?.text2 }));
                }
            }
        } else {
            if (filter.filterType === 'in' || filter.filterType === 'notIn') {
                inputs.append(el('select.form-control', { name: 'textList', multiple: true }));
            } else if (false === ['null', 'notNull', 'empty', 'notEmpty'].includes(filter.filterType)) {
                inputs.append(el('select.form-control', { name: 'text1' }));

                if (filter.filterType === 'between' || filter.filterType === 'notBetween') {
                    inputs.append(' ', el('select.form-control', { name: 'text2' }));
                }
            }
        }

        formGroup.append(inputs);
        form.append(formGroup);
        this.replaceChildren(form);

        this.initializeTomSelect(filter);
    }

    isPatternType (filter) {
        const patternTypes = [
            'equal-pattern',
            'diferentThan-pattern',
            'biggerThan-pattern',
            'biggerOrEqualThan-pattern',
            'lessThan-pattern',
            'lessOrEqualThan-pattern',
        ];

        return patternTypes.includes(filter.filterType);
    }

    getDatePatternSelect (filter) {
        const select = el('select.form-control', { name: 'datePattern' });
        select.add(new Option('', ''));
        select.add(new Option(t('Today'), '#WST-TODAY#'));
        select.add(new Option(t('This week'), '#WST-THISWEEK#'));
        select.add(new Option(t('This month'), '#WST-THISMONTH#'));
        select.add(new Option(t('This year'), '#WST-THISYEAR#'));
        select.add(new Option(t('First quarter'), '#WST-FIRSTQUARTER#'));
        select.add(new Option(t('Second quarter'), '#WST-SECONDQUARTER#'));
        select.add(new Option(t('Third quarter'), '#WST-THIRDQUARTER#'));
        select.add(new Option(t('Fourth quarter'), '#WST-FOURTHQUARTER#'));
        select.add(new Option(t('First semester'), '#WST-FIRSTSEMESTER#'));
        select.add(new Option(t('Second semester'), '#WST-SECONDSEMESTER#'));
        select.add(new Option(t('Yesterday'), '#WST-YESTERDAY#'));
        select.add(new Option(t('Last week'), '#WST-LASTWEEK#'));
        select.add(new Option(t('Last month'), '#WST-LASTMONTH#'));
        select.add(new Option(t('Last year'), '#WST-LASTYEAR#'));
        select.add(new Option(t('Last year first quarter'), '#WST-LYFIRSTQUARTER#'));
        select.add(new Option(t('Last year second quarter'), '#WST-LYSECONDQUARTER#'));
        select.add(new Option(t('Last year third quarter'), '#WST-LYTHIRDQUARTER#'));
        select.add(new Option(t('Last year fourth quarter'), '#WST-LYFOURTHQUARTER#'));
        select.add(new Option(t('Last year first semester'), '#WST-LYFIRSTSEMESTER#'));
        select.add(new Option(t('Last year second semester'), '#WST-LYSECONDSEMESTER#'));

        if (filter.criterion?.datePattern) {
            select.value = filter.criterion.datePattern;
        }

        return select;
    }

    initializeTomSelect (filter) {
        this.querySelectorAll('select').forEach(select => {
            if (!select.name || select.name === 'datePattern') {
                return;
            }

            const tomSelectSettings = {
                valueField: 'f',
                labelField: 'f',
                searchField: ['f'],
                preload: 'focus',
                create: true,
                persist: false,
                dropdownParent: 'body',
                render: {
                    option_create: data => {
                        return el('.create', t('Add'), ' ', el('strong', data.input));
                    }
                },
                plugins: {
                    remove_button: {
                        title: t('Remove this item'),
                    }
                }
            };

            if (filter.suggestions?.show) {
                let limit = filter.suggestions?.limit ?? 15;
                if (filter.suggestions.unlimited) {
                    limit = null;
                }
                tomSelectSettings.load = function (query, callback) {
                    api.getReportFilterValues(filter, { contains: query, limit }).then(result => {
                        const values = result.data.data.filter(row => row.f !== null && String(row.f).trim() !== '');
                        callback(values);
                    });
                };
                tomSelectSettings.maxOptions = limit;
            }

            if (select.name === 'textList') {
                if (filter.criterion?.textList) {
                    tomSelectSettings.options = filter.criterion.textList.map(f => ({ f }));
                    tomSelectSettings.items = filter.criterion.textList;
                }
            } else {
                if (filter.criterion?.[select.name]) {
                    tomSelectSettings.options = [ { f: filter.criterion[select.name] } ];
                    tomSelectSettings.items = [ filter.criterion[select.name] ];
                }
                tomSelectSettings.maxItems = 1;
            }

            new TomSelect(select, tomSelectSettings);
        });
    }

    getFilterTypeSelect (filter) {
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

        const select = el('select.form-control');

        for (const option of filterOptions[filter.elementType]) {
            select.add(new Option(this.getFilterTypeLabel(option), option))
        }

        select.value = filter.filterType;
        select.addEventListener('change', ev => {
            filter.filterType = select.value;
            this.setFilter(filter);
        });

        return select;
    }

    getFilterTypeLabel (filterType) {
        const labels = {
            equal: t('is equal to'),
            'equal-pattern': t('is equal to (pattern)'),
            diferentThan: t('is different than'),
            'diferentThan-pattern': t('is different than (pattern)'),
            in: t('is in'),
            notIn: t('is not in'),
            biggerThan: t('is bigger than'),
            'biggerThan-pattern': t('is bigger than (pattern)'),
            biggerOrEqualThan: t('is bigger or equal than'),
            'biggerOrEqualThan-pattern': t('is bigger or equal than (pattern)'),
            lessThan: t('is less than'),
            'lessThan-pattern': t('is less than (pattern)'),
            lessOrEqualThan: t('is less or equal than'),
            'lessOrEqualThan-pattern': t('is less or equal than (pattern)'),
            between: t('is between'),
            notBetween: t('is not between'),
            contains: t('contains'),
            notContains: t('does not contain'),
            startWith: t('starts with'),
            notStartWith: t('does not start with'),
            endsWith: t('ends with'),
            notEndsWith: t('does not end with'),
            like: t('is like'),
            notLike: t('is not like'),
            null: t('is null'),
            notNull: t('is not null'),
            empty: t('is empty'),
            notEmpty: t('is not empty'),
        };

        if (filterType in labels) {
            return labels[filterType];
        }
    }

    isEdit () {
        return this.getAttribute('mode') === 'edit';
    }

    getValue () {
        const value = {};
        for (const select of this.querySelectorAll('select[name]')) {
            if (select.multiple) {
                value[select.name] = Array.from(select.selectedOptions).map(option => option.value);
            } else {
                value[select.name] = select.value;
            }
        }
        for (const input of this.querySelectorAll('input[name]')) {
            value[input.name] = input.value;
        }

        return value;
    }
}

window.customElements.define('app-report-filter-form', ReportFilterForm);
