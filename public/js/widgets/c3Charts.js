app.service('c3Charts' , function () {


this.rebuildChart = function(report)
    {
        var theValues = [];
        var theTypes = {};
        var theNames = {};
        var query = report.query;
        var chart = report.properties.chart;
        var reportID = report.id;

        var axisField = '';
        if (chart.dataAxis)
            axisField = chart.dataAxis.id;

        var axisIsInQuery = false;

        if (chart.dataAxis)
            for (var d in query.datasources)
                {
                    for (var c in query.datasources[d].collections)
                        {
                            for (var qc in query.datasources[d].collections[c].columns)
                                {
                                    //var elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase()+'_'+query.datasources[d].collections[c].columns[qc].elementName;
                                    var elementID = 'wst'+query.datasources[d].collections[c].columns[qc].elementID.toLowerCase();
                                    var elementName = elementID.replace(/[^a-zA-Z ]/g,'');

                                    if (query.datasources[d].collections[c].columns[qc].aggregation)
                                        {
                                       // elementName = query.datasources[d].collections[c].columns[qc].collectionID.toLowerCase()+'_'+query.datasources[d].collections[c].columns[qc].elementName+query.datasources[d].collections[c].columns[qc].aggregation;
                                        var elementID = 'wst'+query.datasources[d].collections[c].columns[qc].elementID.toLowerCase()+query.datasources[d].collections[c].columns[qc].aggregation;
                                        var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                                        }

                                    if (elementName == chart.dataAxis.id)
                                    {
                                        axisIsInQuery = true;
                                    }
                                }
                        }
                }

        if (axisIsInQuery == false)
        {
            axisField = null;
            if (chart.dataAxis)
                chart.dataAxis.id = null;

        }


        var columnsForDelete = [];
        for (var i in chart.dataColumns)
        {
            var columnFound = false;
            //remove column if not in query
            for (var qc in query.columns)
            {
                //var elementName = query.columns[qc].collectionID.toLowerCase()+'_'+query.columns[qc].elementName;
                var elementID = 'wst'+query.columns[qc].elementID.toLowerCase();
                var elementName = elementID.replace(/[^a-zA-Z ]/g,'');

                if (query.columns[qc].aggregation)
                    {
                        var elementID = 'wst'+query.columns[qc].elementID.toLowerCase()+query.columns[qc].aggregation;
                        var elementName = elementID.replace(/[^a-zA-Z ]/g,'');
                    }

                console.log('this is the data column name',elementName);
                if (chart.dataColumns[i].id == elementName)
                {
                    columnFound = true; //columnsForDelete.push(i);
                }

            }


            if (columnFound == false)
               {
                ////columnsForDelete.push(i);
                }
        }


        for (var cfd in columnsForDelete)
        {
           chart.dataColumns.splice(columnsForDelete[cfd],1);

        }

        //remove query if not dataColumns and not data Axis

        if (axisIsInQuery == false && chart.dataColumns.length)
        {
            //this is not suitable for gauge as there is not dataColumns, only metrics, so I comented the 2 lines below
            //chart.query = null;
            //chart.queryName = null;
        }



        for (var i in chart.dataColumns)
        {
            if (chart.dataColumns[i].id != undefined)
            {
                if (chart.dataColumns[i].aggregation)
                    var valueName = chart.dataColumns[i].id+chart.dataColumns[i].aggregation;
                    else
                    var valueName = chart.dataColumns[i].id;

                theValues.push(valueName);
                theTypes[valueName] = chart.dataColumns[i].type;
            }
            theNames[valueName] = chart.dataColumns[i].elementLabel;

        }

    console.log('the names',theNames);

        if (query)
        {
            var theChartCode = '#CHART_'+reportID;

                if (!chart.height)
                    chart.height = 300;

                if (chart.type == 'pie' || chart.type == 'donut')
                {

                    var theColumns = [];
                    if (axisField && theValues)
                    {
                        for (var i in query.data)
                        {
                            var groupField = query.data[i][axisField];
                            var valueField = query.data[i][theValues[0]];
                            theColumns.push([query.data[i][axisField],query.data[i][theValues[0]]]);
                        }
                    }


                    var chartCanvas = c3.generate({
                        bindto: theChartCode,
                        data: {
                             columns: theColumns,
                            type : chart.type
                        },

                         size: {
                            height:chart.height
                         }
                    });
                } else {

                    if (chart.type == 'gauge')
                        {
                        var chartCanvas = c3.generate({
                        bindto: theChartCode,
                        data: {
                             columns: [theValues[0], query.data[0][theValues[0]]],
                            type : chart.type
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
                            height:chart.height
                         }
                        });

                        } else {
                            var chartCanvas = c3.generate({
                                bindto: theChartCode,
                                data: {
                                    json: query.data,
                                    keys: {
                                        x: axisField,
                                        value: theValues
                                    },
                                    types: theTypes,
                                    names: theNames
                                },
                                axis: {
                                    x: {
                                        type: 'category'
                                    }
                                },
                                 size: {
                                    height:chart.height
                                 }
                            });
                        }
                }
            chart.chartCanvas = chartCanvas;

        }

        if (chart.type != 'line')
        for (var c in chart.dataColumns)
        {

        }
    }

    this.refreshChartData = function(chart)
    {
            //chart.chartCanvas.load.json = query.data;

            if (chart.dataAxis)
            axisField = chart.dataAxis.id;

            var theValues = [];
            var theNames = [];

            for (var i in chart.dataColumns)
                {
                    if (chart.dataColumns[i].id != undefined)
                    {
                        theValues.push(chart.dataColumns[i].id);
                        var valueName = chart.dataColumns[i].id;

                        theNames[valueName] = chart.dataColumns[i].elementLabel;
                    }
                }

            if (chart.type == 'pie' || chart.type == 'donut')
                {
                    var theColumns = [];
                    if (axisField && theValues)
                    {
                        for (var i in query.data)
                        {
                            var groupField = query.data[i][axisField];
                            var valueField = query.data[i][theValues[0]];
                            theColumns.push([query.data[i][axisField],query.data[i][theValues[0]]]);
                        }
                    }

                    chart.chartCanvas.data({
                             columns: theColumns,
                            type : chart.type
                        });


                } else {
                    chart.chartCanvas.data({
                            json: query.data,
                            keys: {
                                x: axisField,
                                value: theValues
                            },
                            names: theNames
                    });
                }

    }

    this.deleteChartColumn = function(chart,column)
    {

        var index = chart.dataColumns.indexOf(column);
        if (index > -1) {

            chart.dataColumns.splice(index, 1);

            this.rebuildChart(chart);

        } else {
            //seems that this chart has a query that changed and the column cant be found in

        }
    }

    this.changeChartColumnType = function(chart,column)
    {
        if (column.aggregation)
            var columnID = column.id+column.aggregation;
            else
            var columnID = column.id;

        if (column.type == 'line' || column.type == undefined)
        {
            column.type = 'spline';
            chart.chartCanvas.transform('spline', columnID);
        } else
            if (column.type == 'spline')
            {
                column.type = 'bar';
                chart.chartCanvas.transform('bar', columnID);
            } else
                if (column.type == 'bar')
                {
                    column.type = 'area';
                    chart.chartCanvas.transform('area', columnID);
                } else
                    if (column.type == 'area')
                    {
                        column.type = 'area-spline';
                        chart.chartCanvas.transform('area-spline', columnID);
                    } else
                        if (column.type == 'area-spline')
                        {
                            column.type = 'scatter';
                            chart.chartCanvas.transform('scatter', columnID);
                        } else
                            if (column.type == 'scatter')
                            {
                            /*    column.type = 'pie';
                                //chart.chartCanvas.transform('pie', columnID);
                                chart.chartCanvas.transform('pie');
                            } else
                            if (column.type == 'pie')
                            {
                                column.type = 'donut';
                                //chart.chartCanvas.transform('donut', columnID);
                                chart.chartCanvas.transform('donut');
                            } else
                            if (column.type == 'donut')
                            {*/
                                column.type = 'line';
                                chart.chartCanvas.transform('line', columnID);
                            }

    }


    this.transformChartColumnType = function(chart,column)
    {
        if (column.aggregation)
            var columnID = column.id+column.aggregation;
            else
            var columnID = column.id;


        if (column.type == 'spline')
        {
            chart.chartCanvas.transform('spline', columnID);
        } else
            if (column.type == 'bar')
            {
                chart.chartCanvas.transform('bar', columnID);
            } else
                if (column.type == 'area')
                {
                    chart.chartCanvas.transform('area', columnID);
                } else
                    if (column.type == 'area-spline')
                    {
                        chart.chartCanvas.transform('area-spline', columnID);
                    } else
                        if (column.type == 'scatter')
                        {
                            chart.chartCanvas.transform('scatter', columnID);
                        } else
                            if (column.type == 'line')
                            {
                                chart.chartCanvas.transform('line', columnID);
                            }

    }

    this.changeChartColumnColor = function(chart,column,color)
    {
        if (column.aggregation)
            var columnID = column.id+column.aggregation;
            else
            var columnID = column.id;

        chart.chartCanvas.data.colors[columnID] = '#ff0000';//d3.rgb('#ff0000').darker(1);
        chart.chartCanvas.flush();
        column.color = d3.rgb('#ff0000').darker(1);

    }

    this.getChartHTML = function (report,theChartID,mode)
    {
        var html = '';

        if (mode == 'edit')
            //html = '<c3chart page-block  bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+theChartID+'" bindto-id="'+theChartID+'" ndType="c3Chart" id="'+theChartID+'" drop="onDropQueryElement($data, $event, \''+theChartID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']">';
            html = '<c3chart page-block ndType="c3Chart" bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+theChartID+'" bindto-id="CHART_'+theChartID+'" id="CHART_'+theChartID+'" >';
            else
            html = '<c3chart bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+theChartID+'" bindto-id="CHART_'+theChartID+'" id="CHART_'+theChartID+'" >';
            /*
            html = html + '<chart-axis>'+
                    '<chart-axis-x axis-id="x" axis-type="timeseries" axis-x-format="%Y-%m-%d %H:%M:%S">'+
                        '<chart-axis-x-tick tick-format-time="%H:%m:%s"/>'+
                        '</chart-axis-x>'+
                    '</chart-axis>'+*/
            html = html +       '</c3chart>';
        return html;
    }

   this.applyChartSettings = function($scope)
    {

        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns)
        {
            theValues.push($scope.selectedChart.dataColumns[i].object.elementName);
            theNames.push($scope.selectedChart.dataColumns[i].object.elementLabel);
        }


        $scope.vm = {};

        var chart = c3.generate({
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
        } /*,
        legend: {
            show:false
        }*/
    });




    

    }

    this.onChartPropertiesChanged = function($scope,object)
    {


    }


    this.applyChartSettings4Pie = function($scope)
    {

        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns)
        {
            theValues.push($scope.selectedChart.dataColumns[i].object.elementName);
            theNames.push($scope.selectedChart.dataColumns[i].object.elementLabel);
        }


        $scope.vm = {};


        var chart = c3.generate({
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
        } /*,
        legend: {
            show:false
        }*/
    });


    }


    this.setChartData = function(data,dimension,metrics,type)
    {



            if (dimension)
            axisField = dimension.id;

            var theValues = [];
            var theNames = [];

            for (var i in metrics)
                {
                    if (metrics[i].id != undefined)
                    {
                        theValues.push(metrics[i].id);
                        var valueName = metrics[i].id;

                        theNames[valueName] = metrics[i].elementLabel;
                    }
                }

            if (type == 'pie' || type == 'donut')
                {
                    var theColumns = [];
                    if (axisField && theValues)
                    {
                        for (var i in data)
                        {
                            var groupField = data[i][axisField];
                            var valueField = data[i][theValues[0]];
                            theColumns.push([data[i][axisField],data[i][theValues[0]]]);
                        }
                    }


                    chart.chartCanvas.data({
                             columns: theColumns,
                            type : chart.type
                        });


                } else {
                    chart.chartCanvas.data({
                            json: query.data,
                            keys: {
                                x: axisField,
                                value: theValues
                            },
                            names: theNames
                    });
                }

    }


});
