/* global c3:false */

angular.module('app').service('c3Charts', function () {
    this.rebuildChart = function (report, id) {
        var theValues = [];
        var theStackValues = {};
        var theTypes = {};
        var theNames = {};
        var theGroups = [];
        var theData = [];

        var query = report.query;
        var chart = report.properties.chart;

        var axisField = '';
        if (chart.dataAxis) { axisField = chart.dataAxis.id; }
        // var axisIsInQuery = false;

        var stackField = '';
        if (chart.stackDimension) { stackField = chart.stackDimension.id; }
        // var stackIsInQuery = false;

        chart.noUnicityWarning = false;
        // Indicates that for a single (axisField * stackField) value there are multiple entries
        // This causes some of the charts to display weird or misleading results

        if (!query.data) {
            noty({text: 'no data to display', timeout: 2000, type: 'warning'});
            return;
        }

        for (const dtc of chart.dataColumns) {
            theValues.push(dtc.id);
            theTypes[dtc.id] = dtc.type || 'bar';
            theNames[dtc.id] = dtc.elementLabel;
        }

        if (stackField && chart.type === 'line') {
            /* A second field has been entered as a dimension.
            * The chart must in this case be displayed as stacked bars.
            * Due to the way c3 functions, the way to do this is by ctreating a data column for each possible value
            * of the second dimension.
            * the name of the data column will be [name of ykey] + '-' + [ field value ]
            */

            chart.stacked = true;

            var mapOnAxis = {};

            for (const valueKey of theValues) {
                theStackValues[valueKey] = [];
            }

            var newData = [];

            query.data.map(function (item) {
                if (!item[axisField]) {
                    return;
                }

                const x = item[axisField];

                if (!mapOnAxis[x]) {
                    mapOnAxis[x] = [];
                }

                mapOnAxis[x].push(item);
            });

            const reducer = function (accumulator, oldItem) {
                if (!oldItem[stackField]) {
                    return accumulator;
                }

                var currentItem = accumulator;

                for (const valueKey of theValues) {
                    if (oldItem[valueKey] !== undefined) {
                        const combinedKey = String(oldItem[stackField]) + '-' + valueKey;

                        if (theStackValues[valueKey].indexOf(combinedKey) < 0) {
                            theStackValues[valueKey].push(combinedKey);

                            theTypes[combinedKey] = theTypes[valueKey];

                            if (theValues.length === 1) {
                                theNames[combinedKey] = String(oldItem[stackField]);
                            } else {
                                theNames[combinedKey] = theNames[valueKey] + ' : ' + String(oldItem[stackField]);
                            }
                        }

                        if (currentItem[combinedKey]) {
                            newData.push(currentItem);
                            var newItem = {};
                            newItem[axisField] = currentItem[axisField];
                            chart.noUnicityWarning = true;
                            currentItem = newItem;
                        }

                        currentItem[combinedKey] = oldItem[valueKey];
                    }
                }

                return currentItem;
            };

            for (const x in mapOnAxis) {
                const newItem = {};
                newItem[axisField] = x;
                newData.push(mapOnAxis[x].reduce(reducer, newItem));
            }

            theValues = [];
            theGroups = [];
            for (const valueKey in theStackValues) {
                var col = chart.dataColumns.find(c => c.id === valueKey);
                if (!col.doNotStack) {
                    theGroups.push(theStackValues[valueKey]);
                }
                theValues = theValues.concat(theStackValues[valueKey]);
            }

            theData = newData;

            chart.stackKeys = theStackValues;
        } else {
            theData = query.data;
            theGroups = undefined;
            chart.stacked = false;
        }

        var theChartCode = '#' + id;

        if (!chart.height) { chart.height = 300; }

        const c3Config = {
            bindto: theChartCode,
            size: {
                height: chart.height,
            },
            tooltip: {
                order: function (t1, t2) {
                    return t1.id > t2.id;
                }
            }
        };

        if (report.properties.chart.legendPosition === 'top') {
            c3Config.padding = {
                top: 50,
            };
            c3Config.legend = {
                position: 'inset',
                inset: {
                    anchor: 'top-left',
                    x: 10,
                    y: -50,
                    step: undefined
                }
            };
        } else if (report.properties.chart.legendPosition === 'right') {
            c3Config.legend = {
                position: 'right',
            };
        }

        switch (chart.type) {
        case 'pie':
        case 'donut':
            var theColumns = [];
            if (axisField && theValues) {
                for (const i in query.data) {
                    const groupField = query.data[i][axisField];
                    const valueField = query.data[i][theValues[0]];
                    theColumns.push([groupField, valueField]);
                }
            }

            c3Config.data = {
                columns: theColumns,
                type: chart.type
            };
            break;

        case 'gauge':
            c3Config.data = {
                columns: [
                    [theValues[0], query.data[0][theValues[0]]]
                ],
                type: chart.type
            };
            break;

        case 'line' :
            c3Config.data = {
                json: theData,
                keys: {
                    x: axisField,
                    value: theValues
                },
                types: theTypes,
                names: theNames,
                groups: theGroups
            };
            c3Config.axis = {
                x: {
                    type: 'category',
                    tick: {
                        culling: {
                            max: 20
                        },
                        format: function (i) {
                            const max = 20;
                            let name = this.config.axis_x_categories[i];
                            if (name === null) {
                                name = 'NULL';
                            } else if (name.length > max) {
                                name = name.substr(0, max - 1) + '…';
                            }

                            return name;
                        },
                        multiline: false,
                        rotate: 45
                    }
                }
            };

            const hasNegativeValues = theData.some(row => {
                return theValues.some(key => {
                    return row[key] < 0;
                });
            });
            if (hasNegativeValues) {
                c3Config.grid = {
                    y: {
                        lines: [
                            { value: 0 },
                        ],
                    },
                };
            }

            break;
        }

        chart.chartCanvas = c3.generate(c3Config);
    };

    this.changeChartColumnType = function (chart, column) {
        if (chart.stacked) {
            for (const key of chart.stackKeys[column.id]) {
                chart.chartCanvas.transform(column.type, key);
            }
        } else {
            chart.chartCanvas.transform(column.type, column.id);
        }
    };

    this.changeStack = function (chart) {
        var theGroups = [];
        for (const valueKey in chart.stackKeys) {
            var col = chart.dataColumns.find(c => c.id === valueKey);
            if (!col.doNotStack) {
                theGroups.push(chart.stackKeys[valueKey]);
            }
        }
        chart.chartCanvas.groups(theGroups);
    };

    this.getChartHTML = function (report, mode, id) {
        var html = '';

        if (mode === 'edit') {
            html = '<div page-block ndType="c3Chart" id="' + id + '" >';
        } else {
            html = '<div id="' + id + '" >';
        }
        html = html + '</div>';
        return html;
    };

    this.chartColumnTypeOptions = [
        {
            id: 'spline',
            name: 'Spline',
            image: 'images/spline.png'
        },
        {
            id: 'bar',
            name: 'Bar',
            icon: 'fa fa-bar-chart'
        },
        {
            id: 'area',
            name: 'Area',
            icon: 'fa fa-area-chart'
        },
        {
            id: 'line',
            name: 'Line',
            icon: 'fa fa-line-chart'
        },
        {
            id: 'area-spline',
            name: 'Area spline',
            image: 'images/area-spline.png'
        },
        {
            id: 'scatter',
            name: 'Scatter',
            image: 'images/scatter.png'
        }
    ];

    this.chartSectorTypeOptions = [
        {
            id: 'pie',
            name: 'Pie',
            image: 'images/pie.png'
        },
        {
            id: 'donut',
            name: 'Donut',
            image: 'images/donut.png'
        }
    ];
});
