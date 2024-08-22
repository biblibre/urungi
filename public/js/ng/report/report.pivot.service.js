(function () {
    'use strict';

    angular.module('app.report').factory('pivot', pivot);

    pivot.$inject = ['numeral', 'moment', 'i18n'];

    function pivot (numeral, moment, i18n) {
        const service = {
            createPivotTable,
        };

        return service;

        function createPivotTable (element, report, rows) {
            const input = function (callback) {
                const columns = report.properties.ykeys.concat(report.properties.pivotKeys.columns, report.properties.pivotKeys.rows);
                for (const row of rows) {
                    const newRow = {};
                    for (const column of columns) {
                        const label = column.label || column.layerObject.elementLabel;
                        newRow[label] = row[column.id];
                    }
                    callback(newRow);
                }
            };
            const options = getPivotTableOptions(report);
            element.pivot(input, options);
        }

        function getPivotTableOptions (report) {
            const ykey = report.properties.ykeys[0];
            const layerObject = ykey.layerObject;

            let formatFn = x => x;
            const format = ykey.format || layerObject.format;
            if (format) {
                if (ykey.elementType === 'number') {
                    formatFn = x => numeral(x).format(format);
                } else if (ykey.elementType === 'date' && !ykey.aggregation) {
                    formatFn = x => moment(x).format(format);
                }
            }

            let aggregator;
            const aggregatorTemplates = $.pivotUtilities.aggregatorTemplates;
            switch (ykey.aggregation) {
            case 'count':
                aggregator = aggregatorTemplates.count(formatFn);
                break;
            case 'countDistinct':
                aggregator = aggregatorTemplates.countUnique(formatFn);
                break;
            case 'sum':
                aggregator = aggregatorTemplates.sum(formatFn);
                break;
            case 'avg':
                aggregator = aggregatorTemplates.average(formatFn);
                break;
            case 'min':
                aggregator = aggregatorTemplates.min(formatFn);
                break;
            case 'max':
                aggregator = aggregatorTemplates.max(formatFn);
                break;
            default:
                aggregator = aggregatorTemplates.uniques(x => x[0], formatFn);
            }

            const pivotKeys = report.properties.pivotKeys;
            const cols = pivotKeys.columns.map(e => {
                return e.label || e.layerObject.elementLabel;
            });
            const rows = pivotKeys.rows.map(e => {
                return e.label || e.layerObject.elementLabel;
            });

            const options = {
                dataClass: $.pivotUtilities.SubtotalPivotData,
                cols,
                rows,
                aggregator: aggregator([layerObject.elementLabel]),
                renderer: $.pivotUtilities.subtotal_renderers['Table With Subtotal'],
                rendererOptions: {
                    rowSubtotalDisplay: {
                        hideOnExpand: true,
                    },
                    colSubtotalDisplay: {
                        hideOnExpand: true,
                    },
                    collapseColsAt: 0,
                    collapseRowsAt: 0,
                    localeStrings: {
                        totals: i18n.gettext('Totals'),
                    },
                },
            };

            return options;
        }
    }
})();
