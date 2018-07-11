/* global c3:false, d3: false */

app.service('c3Charts', function () {
    this.rebuildChart = function (report) {
        var theValues = [];
        var theStackValues = {};
        var theTypes = {};
        var theNames = {};
        var theGroups = [];
        var theData = [];

        var query = report.query;
        var chart = report.properties.chart;
        var reportID = report.id || report._id;

        console.log(chart);

        var axisField = '';
        if (chart.dataAxis) { axisField = chart.dataAxis.id; }
        var axisIsInQuery = false;

        var stackField = '';
        if (chart.stackDimension) { stackField = chart.stackDimension.id; }
        var stackIsInQuery = false;

        chart.noUnicityWarning = false;
        // Indicates that for a single (axisField * stackField) value there are multiple entries
        // This causes some of the charts to display weird or misleading results

        if (!query.data) {
            console.log('no data to display');
            return;
        }

        if (chart.dataAxis) {
            for (const d in query.datasources) {
                for (const c in query.datasources[d].collections) {
                    for (const qc in query.datasources[d].collections[c].columns) {
                    // var elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase()+'_'+query.datasources[d].collections[c].columns[qc].elementName;
                        var elementID = 'wst' + query.datasources[d].collections[c].columns[qc].elementID.toLowerCase();
                        var elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                        if (query.datasources[d].collections[c].columns[qc].aggregation) {
                        // elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase()+'_'+query.datasources[d].collections[c].columns[qc].elementName+query.datasources[d].collections[c].columns[qc].aggregation;
                            elementID = 'wst' + query.datasources[d].collections[c].columns[qc].elementID.toLowerCase() + query.datasources[d].collections[c].columns[qc].aggregation;
                            elementName = elementID.replace(/[^a-zA-Z ]/g, '');
                        }

                        if (elementName === chart.dataAxis.id) {
                            axisIsInQuery = true;
                        }
                    }
                }
            }
        }

        if (!axisIsInQuery) {
            axisField = null;
            if (chart.dataAxis) { chart.dataAxis.id = null; }
        }

        if (chart.stackDimension) {
            for (const d in query.datasources) {
                for (const c in query.datasources[d].collections) {
                    for (const qc in query.datasources[d].collections[c].columns) {
                    // var elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase()+'_'+query.datasources[d].collections[c].columns[qc].elementName;
                        elementID = 'wst' + query.datasources[d].collections[c].columns[qc].elementID.toLowerCase();
                        elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                        if (query.datasources[d].collections[c].columns[qc].aggregation) {
                        // elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase()+'_'+query.datasources[d].collections[c].columns[qc].elementName+query.datasources[d].collections[c].columns[qc].aggregation;
                            elementID = 'wst' + query.datasources[d].collections[c].columns[qc].elementID.toLowerCase() + query.datasources[d].collections[c].columns[qc].aggregation;
                            elementName = elementID.replace(/[^a-zA-Z ]/g, '');
                        }

                        if (elementName === chart.stackDimension.id) {
                            stackIsInQuery = true;
                            chart.stacked = true;
                        }
                    }
                }
            }
        }

        if (!stackIsInQuery) {
            stackField = null;
            if (chart.stackDimension) { chart.stackDimension.id = null; }
            chart.stacked = false;
        }

        var columnsForDelete = [];
        for (const i in chart.dataColumns) {
            var columnFound = false;
            // remove column if not in query
            for (const qc in query.columns) {
                // var elementName = query.columns[qc].collectionID.toLowerCase()+'_'+query.columns[qc].elementName;
                elementID = 'wst' + query.columns[qc].elementID.toLowerCase();
                elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                if (query.columns[qc].aggregation) {
                    elementID = 'wst' + query.columns[qc].elementID.toLowerCase() + query.columns[qc].aggregation;
                    elementName = elementID.replace(/[^a-zA-Z ]/g, '');
                }

                if (chart.dataColumns[i].id === elementName) {
                    columnFound = true; // columnsForDelete.push(i);
                }
            }

            if (!columnFound) {
                /// /columnsForDelete.push(i);
            }
        }

        for (var cfd in columnsForDelete) {
            chart.dataColumns.splice(columnsForDelete[cfd], 1);
        }

        // remove query if not dataColumns and not data Axis

        if (!axisIsInQuery && chart.dataColumns.length) {
            // this is not suitable for gauge as there is not dataColumns, only metrics, so I comented the 2 lines below
            // chart.query = null;
            // chart.queryName = null;
        }

        for (const i in chart.dataColumns) {
            let valueName;
            if (typeof chart.dataColumns[i].id !== 'undefined') {
                if (chart.dataColumns[i].aggregation) {
                    valueName = chart.dataColumns[i].id + chart.dataColumns[i].aggregation;
                } else {
                    valueName = chart.dataColumns[i].id;
                }

                theValues.push(valueName);
                theTypes[valueName] = chart.dataColumns[i].type || 'bar';
            }
            theNames[valueName] = chart.dataColumns[i].elementLabel;
        }

        if (stackField && chart.type === 'line') {
            /* A second field has been entered as a dimension.
            * The chart must in this case be displayed as stacked bars.
            * Due to the way c3 functions, the way to do this is by ctreating a data column for each possible value
            * of the second dimension.
            * the name of the data column will be [name of ykey] + '-' + [ field value ]
            */

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
                theGroups.push(theStackValues[valueKey]);
                theValues = theValues.concat(theStackValues[valueKey]);
            }

            theData = newData;

            chart.stackKeys = theStackValues;
        } else {
            theData = query.data;
            theGroups = undefined;
        }

        var theChartCode = '#CHART_' + reportID;

        if (!chart.height) { chart.height = 300; }

        let canvasArgs;

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

            canvasArgs = {
                bindto: theChartCode,
                data: {
                    columns: theColumns,
                    type: chart.type
                },

                size: {
                    height: chart.height
                }
            };
            break;

        case 'gauge':
            canvasArgs = {
                bindto: theChartCode,
                data: {
                    columns: [theValues[0], query.data[0][theValues[0]]],
                    type: chart.type
                },
                gauge: {
                    //        label: {
                    //            format: function(value, ratio) {
                    //                return value;
                    //            },
                    //            show: false // to turn off the min/max labels.
                    //        },
                    //    min: 0, // 0 is default, //can handle negative min e.g. vacuum / voltage / current flow / rate of change
                    //    max: (query.data[0][theValues[0]]*2), // 100 is default
                    //    units: '' //' %',
                    //    width: 39 // for adjusting arc thickness
                },

                size: {
                    height: chart.height
                }
            };
            break;

        case 'line' :
            canvasArgs = {
                bindto: theChartCode,
                data: {
                    json: theData,
                    keys: {
                        x: axisField,
                        value: theValues
                    },
                    types: theTypes,
                    names: theNames,
                    groups: theGroups
                },
                axis: {
                    x: {
                        type: 'category',
                        tick: {
                            culling: {
                                max: 20
                            },
                            multiline: false,
                            rotate: 45
                        }
                    }
                },
                size: {
                    height: chart.height
                }
            };

            break;
        }

        console.log(canvasArgs);
        chart.chartCanvas = c3.generate(canvasArgs);
        
    };

    this.deleteChartColumn = function (chart, column) {
        var index = chart.dataColumns.indexOf(column);
        if (index > -1) {
            chart.dataColumns.splice(index, 1);

            this.rebuildChart(chart);
        } else {
            // seems that this chart has a query that changed and the column cant be found in

        }
    };

    this.changeChartColumnType = function (chart, column) {
        let columnID;
        if (column.aggregation) {
            columnID = column.id + column.aggregation;
        } else {
            columnID = column.id;
        }

        if (column.type === 'line' || typeof column.type === 'undefined') {
            column.type = 'spline';
            chart.chartCanvas.transform('spline', columnID);
        } else if (column.type === 'spline') {
            column.type = 'bar';
            chart.chartCanvas.transform('bar', columnID);
        } else if (column.type === 'bar') {
            column.type = 'area';
            chart.chartCanvas.transform('area', columnID);
        } else if (column.type === 'area') {
            column.type = 'area-spline';
            chart.chartCanvas.transform('area-spline', columnID);
        } else if (column.type === 'area-spline') {
            column.type = 'scatter';
            chart.chartCanvas.transform('scatter', columnID);
        } else if (column.type === 'scatter') {
            column.type = 'line';
            chart.chartCanvas.transform('line', columnID);
        }
    };

    this.transformChartColumnType = function (chart, column) {
        let columnID;

        if (column.aggregation) {
            columnID = column.id + column.aggregation;
        } else {
            columnID = column.id;
        }

        if (chart.stacked) {
            for (const key of chart.stackKeys[columnID]) {
                chart.chartCanvas.transform(column.type, key);
            }
        } else {
            chart.chartCanvas.transform(column.type, columnID);
        }
    };

    this.changeChartColumnColor = function (chart, column, color) {
        let columnID;
        if (column.aggregation) {
            columnID = column.id + column.aggregation;
        } else {
            columnID = column.id;
        }

        chart.chartCanvas.data.colors[columnID] = '#ff0000';// d3.rgb('#ff0000').darker(1);
        chart.chartCanvas.flush();
        column.color = d3.rgb('#ff0000').darker(1);
    };

    this.getChartHTML = function (report, mode) {
        var html = '';

        const theChartID = report.id || report._id;

        if (mode === 'edit') {
            html = '<c3chart page-block ndType="c3Chart" bindto-id="CHART_' + theChartID + '" id="CHART_' + theChartID + '" >';
        } else {
            html = '<c3chart bindto-id="CHART_' + theChartID + '" id="CHART_' + theChartID + '" >';
        }
        html = html + '</c3chart>';
        return html;
    };

    this.applyChartSettings = function ($scope) {
        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns) {
            theValues.push($scope.selectedChart.dataColumns[i].object.elementName);
            theNames.push($scope.selectedChart.dataColumns[i].object.elementLabel);
        }

        $scope.vm = {};

        c3.generate({
            bindto: '#chart1',
            data: {
                json: $scope.selectedChart.query.data,
                keys: {
                    x: 'wst5883cbeb81db4ae3b1d75e8371097e9a_device_name', // it's possible to specify 'x' when category axis
                    value: theValues,
                },
                names: theNames
            },
            axis: {
                x: {
                    type: 'category'
                }
            }
        });
    };

    this.onChartPropertiesChanged = function ($scope, object) {

    };

    this.applyChartSettings4Pie = function ($scope) {
        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns) {
            theValues.push($scope.selectedChart.dataColumns[i].object.elementName);
            theNames.push($scope.selectedChart.dataColumns[i].object.elementLabel);
        }

        $scope.vm = {};

        c3.generate({
            bindto: '#chart1',
            data: {
                json: $scope.selectedChart.query.data,
                keys: {
                    x: 'wst5883cbeb81db4ae3b1d75e8371097e9a_device_name', // it's possible to specify 'x' when category axis
                    value: theValues,
                },
                names: theNames
            },
            axis: {
                x: {
                    type: 'category'
                }
            }
        });
    };
});
