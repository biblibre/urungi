angular.module('app').service('pivot', function () {
    this.getPivotTableSetup = function (report) {
        const pivotKeys = report.properties.pivotKeys;
        const data = report.query.data;
        const ykeys = report.properties.ykeys;

        const dimensions = {};
        const dimensionList = {};

        var pivotID = 'pivot-' + report._id;

        for (const dimInfo of (pivotKeys.columns.concat(pivotKeys.rows))) {
            dimensionList[dimInfo.id] = {
                info: dimInfo,
                set: new Set()
            };
        }

        // Replace null values by the string 'NULL' so they get displayed
        for (const entry of data) {
            for (const dim in dimensionList) {
                if (entry[dim] == null) {
                    entry[dim] = 'NULL';
                }
            }
        }

        for (const entry of data) {
            for (const dim in dimensionList) {
                if (entry[dim]) {
                    dimensionList[dim].set.add(entry[dim]);
                }
            }
        }

        for (const dim in dimensionList) {
            var valueList = [];

            for (const v of dimensionList[dim].set.values()) {
                const value = {
                    id: v,
                    label: v
                };
                valueList.push(value);
            }

            dimensions[dim] = new DimensionDescription(dimensionList[dim].info.objectLabel, valueList);
        }

        const horizontalDimensions = [];
        const verticalDimensions = [];

        for (const dim of pivotKeys.rows) {
            horizontalDimensions.push(dim.id);
        }

        for (const dim of pivotKeys.columns) {
            verticalDimensions.push(dim.id);
        }

        const valueDataFields = [];
        const dataFieldInfo = {};

        for (const ykey of ykeys) {
            valueDataFields.push(ykey.id);
            dataFieldInfo[ykey.id] = ykey;
        }

        function dataCellRenderer (items, colContext, rowContext, opts) {
            var html = '<span>';
            for (const ykey of ykeys) {
                html += '<div>';
                if (items[ykey.id]) {
                    html += String(items[ykey.id]);
                } else {
                    html += ' - ';
                }
                html += '</div>';
            }
            html += '</span>';

            return html;
        }

        var params = {
            configuration: false,
            data: data,
            horizontalDimensions: horizontalDimensions,
            verticalDimensions: verticalDimensions,
            dimensions: dimensions,
            valueDataFields: valueDataFields,
            dataFieldInfo: dataFieldInfo,
            dataCellRenderer: dataCellRenderer,
            map: map,
            reduce: reduce,
            resizable: false,
        };

        return {
            html: '<div id="' + pivotID + '" > ERROR - could not display pivot table </div>',
            params: params,
            jquerySelector: '#' + pivotID
        };
    };

    function DimensionDescription (label, valueList) {
        this.label = label;
        this.valueList = valueList;
        this.values = function () {
            return this.valueList;
        };
    }

    function map (rowContext, colContext, data) {
        if (!data) {
            return [];
        }
        var res = [];
        var filter = [];
        var i;

        for (i = 0; i < rowContext.length; i++) {
            const value = rowContext[i];
            filter.push(value);
        }

        for (i = 0; i < colContext.length; i++) {
            const value = colContext[i];
            filter.push(value);
        }

        for (i = 0; i < data.length; i++) {
            var item = data[i];
            if (applyFilter2(item, filter)) {
                res.push(item);
            }
        }
        return { 'default': res };
    }

    function reduce (mapItems) {
        var aggregValues = {};

        for (const field of this.valueDataFields) {
            var result;

            switch (this.dataFieldInfo[field].aggregation) {
            case 'min':
                result = Number.POSITIVE_INFINITY;
                for (const item of mapItems['default']) {
                    if (item[field] && item[field] < result) {
                        result = item[field];
                    }
                }
                break;

            case 'max':
                result = Number.NEGATIVE_INFINITY;
                for (const item of mapItems['default']) {
                    if (item[field] && item[field] > result) {
                        result = item[field];
                    }
                }
                break;

            case 'sum':
            case 'count':
                result = 0;
                for (const item of mapItems['default']) {
                    if (item[field]) { result += item[field]; }
                }
                break;

            case 'avg':
                var numer = 0;
                var denom = 0;
                for (const item of mapItems['default']) {
                    if (item[field]) {
                        numer += item[field] * item[ this.dataFieldInfo[field].id + 'ptc' ];
                        denom += item[ this.dataFieldInfo[field].id + 'ptc' ];
                    }
                }
                if (denom) {
                    result = numer / denom;
                } else {
                    result = undefined;
                }
                break;

            default:
                result = undefined;
                if (mapItems['default'][0]) {
                    result = mapItems['default'][0][field];
                }
            }

            aggregValues[field] = result;
        }

        return aggregValues;
    }

    function applyFilter2 (test, filter) {
        for (var i = 0; i < filter.length; i++) {
            var filterItem = filter[i];
            // var dimName = filterItem.dimName;
            // var o1 = filterItem.id;
            var o2 = test[filterItem.dimName];
            if (typeof (o2) === 'object' && o2 != null) {
                o2 = o2.id;
            }
            // if(o1 != Number.POSITIVE_INFINITY) {
            if (filterItem.id !== o2) { // && o2 != -1) {
                return false;
            }
            // }
        }
        return true;
    }
});
