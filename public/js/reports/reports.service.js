(function () {
    'use strict';

    angular.module('app.reports').factory('reportsService', reportsService);

    reportsService.$inject = [];

    function reportsService () {
        const service = {
            generateQuery: generateQuery,
            getQueryForFilter: getQueryForFilter,
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
                datasourceID: filter.datasourceID,
                elementID: filter.elementID,
                elementName: filter.elementName,
                elementType: filter.elementType,
                layerID: filter.layerID
            };

            query.columns.push(newColumn);

            return query;
        }

        function getCountColumn (col) {
            return {
                aggregation: 'count',
                collectionID: col.collectionID,
                datasourceID: col.datasourceID,
                elementID: col.elementID,
                elementLabel: col.elementLabel,
                elementName: col.elementName,
                elementType: col.elementType,
                filterPrompt: false,
                id: col.id + 'ptc',
                layerID: col.layerID,
                objectLabel: col.objectLabel + ' count'
            };
        }
    }
})();
