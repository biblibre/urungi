(function () {
    'use strict';

    angular.module('app.report').factory('reportsService', reportsService);

    reportsService.$inject = ['$window', 'i18n'];

    function reportsService ($window, i18n) {
        const aggregations = {
            sum: i18n.gettext('Sum'),
            avg: i18n.gettext('Avg'),
            min: i18n.gettext('Min'),
            max: i18n.gettext('Max'),
            count: i18n.gettext('Count'),
            countDistinct: i18n.gettext('Count distinct'),
        };

        const service = {
            getAggregationDescription,
            storeReport,
            getStoredReport,
            getColumnId,
            getColumnDescription,
            checkPrompts,
            checkPrompt
        };

        return service;

        /**
         * Returns a human-readable description of an aggregation function
         *
         * @param {string} aggregation - Name of the aggregation function
         * @returns {string} The translated human-readable description of the
         *     aggregation function
         */
        function getAggregationDescription (aggregation) {
            if (aggregation in aggregations) {
                return i18n.gettext(aggregations[aggregation]);
            }
        }

        function storeReport (report) {
            $window.sessionStorage.setItem('storedReport', JSON.stringify(report));
        }

        function getStoredReport () {
            const json = $window.sessionStorage.getItem('storedReport');
            if (!json) {
                return null;
            }

            $window.sessionStorage.removeItem('storedReport');
            return JSON.parse(json);
        }

        /*
         * The id of a column (column.id) differs from the id of the element
         * which that column uses (column.elementID). This allows for multiple
         * columns which use the same element, for example to use different
         * aggregations
         */
        function getColumnId (element) {
            let columnId;

            const aggregation = element.aggregation;

            if (!aggregation) {
                columnId = 'e' + element.elementID.toLowerCase() + 'raw';
            } else {
                columnId = 'e' + element.elementID.toLowerCase() + aggregation.substring(0, 3);
            }

            return columnId;
        }

        function getColumnDescription (column) {
            let columnDescription = column.label;
            if (!columnDescription) {
                columnDescription = column.layerObject.elementLabel;
                if (column.aggregation) {
                    const aggregationDescription = getAggregationDescription(column.aggregation);
                    columnDescription += ' (' + aggregationDescription + ')';
                }
            }

            return columnDescription;
        };

        // Checks if a prompt is correctly filled (criteria by filterType)
        function checkPrompt (prompt) {
            if (!prompt.criterion) {
                return false;
            }

            if (prompt.elementType === 'date') {
                if (prompt.filterType === 'between' || prompt.filterType === 'notBetween') {
                    return !!(prompt.criterion.text1 && prompt.criterion.text2);
                }
                if (prompt.filterType.endsWith('-pattern')) {
                    return !!prompt.criterion.datePattern;
                }

                return !!prompt.criterion.text1;
            }

            if (prompt.filterType === 'between' || prompt.filterType === 'notBetween') {
                return !!(prompt.criterion.text1 && prompt.criterion.text2);
            }
            if (prompt.filterType === 'in' || prompt.filterType === 'not in') {
                return Array.isArray(prompt.criterion.textList) && prompt.criterion.textList.length > 0;
            }

            return !!prompt.criterion.text1;
        }

        function checkPrompts (prompts) {
            return prompts.every(checkPrompt);
        }
    }
})();
