(function () {
    'use strict';

    angular.module('app.reports').factory('grid', grid);

    grid.$inject = ['moment', 'numeral', 'api', 'layerService', 'reportsService'];

    function grid (moment, numeral, api, layerService, reportsService) {
        const service = {
            createGrid: createGrid,
        };

        return service;

        function createGrid (element, report, rows, options) {
            if (!options) {
                options = {};
            }

            let html = '<div class="report-grid">';
            html += '<table>';

            if (options.vertical) {
                html += '<colgroup><col style="width: 25%;"></col></colgroup>';
            }

            if (!options.vertical) {
                html += '<thead><tr>';
                for (const column of report.properties.columns) {
                    html += '<th>' + getColumnDescription(column) + '</th>';
                }
                html += '</tr></thead>';
            }

            if (options.vertical) {
                for (const row of rows) {
                    html += '<tbody>';
                    for (const column of report.properties.columns) {
                        html += '<tr>';
                        html += '<th scope="row">' + getColumnDescription(column) + '</th>';
                        html += '<td>';
                        html += formatValue(row[column.id], column);
                        html += '</td>';
                        html += '</tr>';
                    }
                    html += '</tbody>';
                }
            } else {
                html += '<tbody>';
                for (const row of rows) {
                    html += '<tr>';
                    for (const column of report.properties.columns) {
                        const value = formatValue(row[column.id], column);
                        html += '<td>';
                        html += value;
                        html += '</td>';
                    }
                    html += '</tr>';
                }
                html += '</tbody>';
            }

            const totals = new Map();
            for (const column of report.properties.columns) {
                if (column.calculateTotal && (column.elementType === 'number' || ['count', 'countDistinct'].includes(column.aggregation))) {
                    const total = rows.reduce(function (acc, cur) {
                        return acc + Number(cur[column.id]);
                    }, 0);
                    totals.set(column.id, formatValue(total, column));
                }
            }

            if (totals.size > 0) {
                html += '<tfoot>';
                if (options.vertical) {
                    for (const column of report.properties.columns) {
                        if (totals.has(column.id)) {
                            html += '<tr>';
                            html += '<th scope="row">Total (' + getColumnDescription(column) + ')</th>';
                            html += '<td>' + totals.get(column.id) + '</td>';
                            html += '</tr>';
                        }
                    }
                } else {
                    html += '<tr>';
                    for (const column of report.properties.columns) {
                        html += '<th>';
                        if (totals.has(column.id)) {
                            html += totals.get(column.id);
                        }
                        html += '</th>';
                    }
                    html += '</tr>';
                }
                html += '</tfoot>';
            }
            html += '</table>';
            html += '</div>';

            element.html(html);
        }

        function getColumnDescription (column) {
            return reportsService.getColumnDescription(column);
        }

        function formatValue (value, column) {
            const layerObject = column.layerObject;
            const format = column.format || layerObject.format;
            if (format) {
                if (column.elementType === 'number') {
                    value = numeral(value).format(format);
                } else if (column.elementType === 'date') {
                    value = moment(value).format(format);
                }
            }

            return value;
        }
    }
})();
