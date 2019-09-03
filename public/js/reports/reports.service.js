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
            generateQuery: generateQuery,
            getQueryForFilter: getQueryForFilter,
            getAggregationDescription: getAggregationDescription,
            storeReport: storeReport,
            getStoredReport: getStoredReport,
            getColumnId: getColumnId,
            getColumnDescription: getColumnDescription,
        };

        return service;

        function generateQuery (report) {
            const query = {};

            const prop = report.properties;

            query.columns = prop.columns.concat(
                prop.xkeys,
                prop.ykeys,
                prop.pivotKeys.columns,
                prop.pivotKeys.rows
            );

            query.order = [];
            for (const o of prop.order) {
                query.order.push(o);
            }

            query.filters = [];
            for (const f of prop.filters) {
                query.filters.push(f);
            }

            if (report.reportType === 'pivot') {
                for (const c of prop.ykeys) {
                    query.columns.push(getCountColumn(c));
                }
            }

            if (prop.recordLimit) {
                query.recordLimit = prop.recordLimit;
            }

            query.layerID = report.selectedLayerID;

            return query;
        }

        function getQueryForFilter (report, filter) {
            const query = generateQuery(report);

            query.filters = query.filters.filter(f => f !== filter);

            var newColumn = {
                id: 'f',
                collectionID: filter.collectionID,
                elementID: filter.elementID,
                elementName: filter.elementName,
                elementType: filter.elementType,
                layerID: filter.layerID
            };

            query.columns.push(newColumn);

            return query;
        }

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
            var columnId;

            var aggregation = element.aggregation || element.defaultAggregation;

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
                columnDescription = column.elementLabel;
                if (column.aggregation) {
                    const aggregationDescription = getAggregationDescription(column.aggregation);
                    columnDescription += ' (' + aggregationDescription + ')';
                }
            }

            return columnDescription;
        };

        function getCountColumn (col) {
            return {
                aggregation: 'count',
                collectionID: col.collectionID,
                elementID: col.elementID,
                elementLabel: col.elementLabel,
                elementName: col.elementName,
                elementType: col.elementType,
                filterPrompt: false,
                id: col.id + 'ptc',
                layerID: col.layerID,
            };
        }
    }
})();
