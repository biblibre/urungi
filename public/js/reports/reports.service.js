(function () {
    'use strict';

    angular.module('app.reports').factory('reportsService', reportsService);

    reportsService.$inject = ['gettext', 'gettextCatalog'];

    function reportsService (gettext, gettextCatalog) {
        let storedReport = {};
        const aggregations = {
            sum: gettext('Sum'),
            avg: gettext('Avg'),
            min: gettext('Min'),
            max: gettext('Max'),
            count: gettext('Count'),
            countDistinct: gettext('Count distinct'),
        };

        const service = {
            getAggregationDescription: getAggregationDescription,
            storeReport: storeReport,
            getStoredReport: getStoredReport,
            getColumnId: getColumnId,
            getColumnDescription: getColumnDescription,
            checkPrompts: checkPrompts,
            checkPrompt: checkPrompt
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
                return gettextCatalog.getString(aggregations[aggregation]);
            }
        }

        function storeReport (report) {
            storedReport = report;
        }

        function getStoredReport () {
            return storedReport;
        }

        /*
         * The id of a column (column.id) differs from the id of the element
         * which that column uses (column.elementID). This allows for multiple
         * columns which use the same element, for example to use different
         * aggregations
         */
        function getColumnId (element) {
            let columnId;

            const aggregation = element.aggregation || element.defaultAggregation;

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
