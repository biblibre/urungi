/* global c3:false, numeral: false */
import i18n from '../i18n.js';
import * as notify from '../notify.js';
import { getColumnDescription } from './util.js';

export function rebuildChart (report, bindto, data, chart) {
    let theValues = [];
    const theStackValues = {};
    const theTypes = {};
    const theNames = {};
    let theGroups = [];
    let theData = [];
    let axisField = '';
    if (chart.dataAxis) { axisField = chart.dataAxis.id; }
    // var axisIsInQuery = false;

    let stackField = '';
    if (chart.stackDimension) { stackField = chart.stackDimension.id; }
    // var stackIsInQuery = false;

    if (!data) {
        notify.notice(i18n.gettext('no data to display'));
        return;
    }

    for (const dtc of chart.dataColumns) {
        theValues.push(dtc.id);
        theTypes[dtc.id] = dtc.type || 'bar';
        theNames[dtc.id] = getColumnDescription(dtc);
    }

    if (stackField && chart.type === 'line') {
        /* A second field has been entered as a dimension.
        * The chart must in this case be displayed as stacked bars.
        * Due to the way c3 functions, the way to do this is by ctreating a data column for each possible value
        * of the second dimension.
        * the name of the data column will be [name of ykey] + '-' + [ field value ]
        */

        chart.stacked = true;

        const mapOnAxis = {};

        for (const valueKey of theValues) {
            theStackValues[valueKey] = [];
        }

        const newData = [];

        data.forEach(function (item) {
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

            let currentItem = accumulator;

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
                        const newItem = {};
                        newItem[axisField] = currentItem[axisField];
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
            const col = chart.dataColumns.find(c => c.id === valueKey);
            if (!col.doNotStack) {
                theGroups.push(theStackValues[valueKey]);
            }
            theValues = theValues.concat(theStackValues[valueKey]);
        }

        theData = newData;

        chart.stackKeys = theStackValues;
    } else {
        theData = data;
        theGroups = undefined;
        chart.stacked = false;
    }

    if (!chart.height) { chart.height = 300; }

    const dataFormat = {};

    for (const column of report.properties.ykeys) {
        dataFormat[column.id] = column.format;
    }

    const c3Config = {
        bindto,
        size: {
            height: chart.height,
        },
        tooltip: {
            order: function (t1, t2) {
                return t1.id > t2.id;
            },
            format: {
                value: function (value, ratio, id, index) {
                    if (chart.type === 'donut' || chart.type === 'pie') {
                        value = numeral(value).format(report.properties.ykeys[0].format);
                    } else if (dataFormat[id]) {
                        value = numeral(value).format(dataFormat[id]);
                    }
                    return value;
                }
            }
        }
    };

    if (chart.legendPosition === 'top') {
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
    } else if (chart.legendPosition === 'right') {
        c3Config.legend = {
            position: 'right',
        };
    }

    if (chart.legendPosition === 'none') {
        c3Config.legend = {
            hide: true,
        };
    }

    switch (chart.type) {
    case 'pie':
    case 'donut':
        {
            const theColumns = [];
            if (axisField && theValues) {
                for (const i in data) {
                    const groupField = data[i][axisField] !== null ? data[i][axisField] : 'NULL';
                    const valueField = data[i][theValues[0]];
                    theColumns.push([groupField, valueField]);
                }
            }

            c3Config.data = {
                columns: theColumns,
                type: chart.type,
                order: null

            };
        }
        break;

    case 'gauge':
        c3Config.data = {
            columns: [
                [theValues[0], data[0][theValues[0]]]
            ],
            names: theNames,
            type: chart.type,
        };
        c3Config.gauge = {
            max: report.properties.maxValue,
        };
        break;

    case 'line' :
        c3Config.data = {
            json: theData,
            keys: {
                x: axisField,
                value: theValues.sort()
            },
            types: theTypes,
            names: theNames,
            groups: theGroups,
            order: null
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
            },
        };

        if (hasNegativeValues(theData, theValues)) {
            c3Config.grid = {
                y: {
                    lines: [
                        { value: 0 },
                    ],
                },
            };
        }

        break;

    case 'pyramid':
        getC3ConfigForPyramid(c3Config, data, chart);
        break;
    }

    chart.chartCanvas = c3.generate(c3Config);
    $(bindto).parent().on('overflow', function () {
        chart.chartCanvas.flush();
    });
}

function hasNegativeValues (data, values) {
    return data.some(row => {
        return values.some(key => {
            return row[key] < 0;
        });
    });
}

export function getCategoryForPyramid (metric, limits) {
    let previousLimit = Number.NEGATIVE_INFINITY;
    for (const limit of limits) {
        if ((metric < limit && metric >= previousLimit)) {
            if (previousLimit === Number.NEGATIVE_INFINITY) {
                return `< ${limit}`;
            }
            return `${previousLimit} - ${limit}`;
        }
        previousLimit = limit;
    }
    return `> ${previousLimit}`;
}

export function getC3ConfigForPyramid (c3Config, data, chart) {
    const population = {};
    const populationKeys = {};
    const limits = chart.range
        ? chart.range.split('/').map((e) => parseInt(e), 10).sort((a, b) => a - b)
        : [20, 30, 40, 50, 60];

    const categories = limits.map(n => getCategoryForPyramid(n - 1, limits));
    categories.push(getCategoryForPyramid(limits[limits.length - 1] + 1, limits));

    for (const result of data) {
        const dimension = result[chart.dataAxis.id];
        const metric = result[chart.dataColumns[0].id];
        const category = getCategoryForPyramid(metric, limits);

        if (!dimension || !metric) {
            continue;
        }
        if (!population[dimension]) {
            population[dimension] = {};
        }
        if (!population[dimension][category]) {
            population[dimension][category] = 0;
        }

        population[dimension][category]++;
        populationKeys[category] = 1;
    }

    const columns = [];
    let maxValue = 1;

    for (const dimension in population) {
        const column = [];
        column.push(dimension);

        for (const key of categories) {
            column.push(population[dimension][key] || 0);
            if (population[dimension][key] > maxValue) {
                maxValue = population[dimension][key];
            }
        }
        columns.push(column);
    }

    for (let i = 1; columns[0].length > i; i++) {
        columns[0][i] = -columns[0][i];
    }

    c3Config.data = {
        columns,
        type: 'bar',
        groups: [columns.map(result => result[0])],
    };
    c3Config.axis = {
        rotated: true,
        x: {
            type: 'categories',
            categories: categories.reverse()
        },
        y: {
            tick: {
                format: function (d) {
                    return (parseInt(d) === d) ? Math.abs(d) : null;
                },
            },
            min: -maxValue,
            max: maxValue
        }

    };
    c3Config.grid = {
        y: {
            lines: [{ value: 0 }]
        }
    };

    return c3Config;
}

export const chartColumnTypeOptions = [
    {
        id: 'spline',
        name: i18n.gettext('Spline'),
        image: 'images/spline.png'
    },
    {
        id: 'bar',
        name: i18n.gettext('Bar'),
        icon: 'fa fa-bar-chart'
    },
    {
        id: 'area',
        name: i18n.gettext('Area'),
        icon: 'fa fa-area-chart'
    },
    {
        id: 'line',
        name: i18n.gettext('Line'),
        icon: 'fa fa-line-chart'
    },
    {
        id: 'area-spline',
        name: i18n.gettext('Area spline'),
        image: 'images/area-spline.png'
    },
    {
        id: 'scatter',
        name: i18n.gettext('Scatter'),
        image: 'images/scatter.png'
    }
];

export const chartSectorTypeOptions = [
    {
        id: 'pie',
        name: i18n.gettext('Pie'),
        image: 'images/pie.png'
    },
    {
        id: 'donut',
        name: i18n.gettext('Donut'),
        image: 'images/donut.png'
    }
];
