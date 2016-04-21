app.service('c3Charts' , function () {


this.rebuildChart = function(chart)
    {

        var theValues = [];
        var theNames = {};

        var axisField = '';
        if (chart.dataAxis)
            axisField = chart.dataAxis.id;

        var axisIsInQuery = false;

        //Is the axis field in the query
        if (chart.dataAxis)
            for (var qc in chart.query.columns)
                {
                    var elementName = chart.query.columns[qc].collectionID.toLowerCase()+'_'+chart.query.columns[qc].elementName;

                    if (chart.query.columns[qc].aggregation)
                        elementName = chart.query.columns[qc].collectionID.toLowerCase()+'_'+chart.query.columns[qc].elementName+chart.query.columns[qc].aggregation;


                    if (elementName == chart.dataAxis.id)
                    {
                        axisIsInQuery = true;
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
            for (var qc in chart.query.columns)
            {
                var elementName = chart.query.columns[qc].collectionID.toLowerCase()+'_'+chart.query.columns[qc].elementName;

                if (chart.query.columns[qc].aggregation)
                        elementName = chart.query.columns[qc].collectionID.toLowerCase()+'_'+chart.query.columns[qc].elementName+chart.query.columns[qc].aggregation;

              //  console.log('column id',elementName,chart.dataColumns[i].id)
                if (chart.dataColumns[i].id == elementName)
                {
                    columnFound = true; //columnsForDelete.push(i);
                //    console.log('column found',elementName);
                }

            }

            if (columnFound == false)
               {
                columnsForDelete.push(i);
                //console.log('pushing a column for delete',i)
                }
        }

        //console.log('there are ',columnsForDelete.length,'columns for delete');

        for (var cfd in columnsForDelete)
        {
           chart.dataColumns.splice(columnsForDelete[cfd],1);
          // console.log('deleting ',columnsForDelete)
        }

        //remove query if not dataColumns and not data Axis

        if (axisIsInQuery == false && chart.dataColumns.length)
        {
            chart.query = null;
            chart.queryName = null;
        }


       // console.log('the data columns ',chart.dataColumns);


        for (var i in chart.dataColumns)
        {
            if (chart.dataColumns[i].id != undefined)
            {
                theValues.push(chart.dataColumns[i].id);
                var valueName = chart.dataColumns[i].id;

                theNames[valueName] = chart.dataColumns[i].elementLabel;
            }
        }


        if (chart.query)
        {
            var theChartCode = '#'+chart.chartID;

                if (!chart.height)
                    chart.height = 300;

                if (chart.type == 'pie' || chart.type == 'donut')
                {

                    var theColumns = [];
                    if (axisField && theValues)
                    {
                        for (var i in chart.query.data)
                        {
                            var groupField = chart.query.data[i][axisField];
                            var valueField = chart.query.data[i][theValues[0]];
                            theColumns.push([chart.query.data[i][axisField],chart.query.data[i][theValues[0]]]);
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

                    var chartCanvas = c3.generate({
                        bindto: theChartCode,
                        data: {
                            json: chart.query.data,
                            keys: {
                                x: axisField,
                                value: theValues
                            },
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



            chart.chartCanvas = chartCanvas;
        }

        for (var c in chart.dataColumns)
        {
            if (chart.dataColumns[c].type != 'line')
                chart.chartCanvas.transform(chart.dataColumns[c].type, chart.dataColumns[c].id);

        }
    }

    this.refreshChartData = function(chart)
    {
            console.log('refreshing data for chart',chart.query.data);

            //chart.chartCanvas.load.json = chart.query.data;


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
                        for (var i in chart.query.data)
                        {
                            var groupField = chart.query.data[i][axisField];
                            var valueField = chart.query.data[i][theValues[0]];
                            theColumns.push([chart.query.data[i][axisField],chart.query.data[i][theValues[0]]]);
                        }
                    }

                    chart.chartCanvas.data({
                             columns: theColumns,
                            type : chart.type
                        });


                } else {
                    chart.chartCanvas.data({
                            json: chart.query.data,
                            keys: {
                                x: axisField,
                                value: theValues
                            },
                            names: theNames
                    });

                }




            /*
            .load({
        json: [
            {name: 'www.site1.com', upload: 800, download: 500, total: 400},
            {name: 'www.site2.com', upload: 600, download: 600, total: 400},
            {name: 'www.site3.com', upload: 400, download: 800, total: 500},
            {name: 'www.site4.com', upload: 400, download: 700, total: 500},
        ],
        keys: {
            value: ['upload', 'download'],
        }*/

            /*
            var chartCanvas = c3.generate({
                        bindto: theChartCode,
                        data: {
                            json: chart.query.data,
                            keys: {
                                x: axisField,
                                value: theValues
                            },
                            names: theNames
                        }
            */
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
        if (column.type == 'line')
        {
            column.type = 'spline';
            chart.chartCanvas.transform('spline', column.id);
        } else
            if (column.type == 'spline')
            {
                column.type = 'bar';
                chart.chartCanvas.transform('bar', column.id);
            } else
                if (column.type == 'bar')
                {
                    column.type = 'area';
                    chart.chartCanvas.transform('area', column.id);
                } else
                    if (column.type == 'area')
                    {
                        column.type = 'area-spline';
                        chart.chartCanvas.transform('area-spline', column.id);
                    } else
                        if (column.type == 'area-spline')
                        {
                            column.type = 'scatter';
                            chart.chartCanvas.transform('scatter', column.id);
                        } else
                            if (column.type == 'scatter')
                            {
                                column.type = 'pie';
                                //chart.chartCanvas.transform('pie', column.id);
                                chart.chartCanvas.transform('pie');
                            } else
                            if (column.type == 'pie')
                            {
                                column.type = 'donut';
                                //chart.chartCanvas.transform('donut', column.id);
                                chart.chartCanvas.transform('donut');
                            } else
                            if (column.type == 'donut')
                            {
                                column.type = 'line';
                                chart.chartCanvas.transform('line', column.id);
                            }

    }

    this.changeChartColumnColor = function(chart,column,color)
    {
        var column = "'"+column.id+"'";
        chart.chartCanvas.data.colors[column] = d3.rgb('#ff0000').darker(1)
    }

    this.getChartHTML = function (theChartID)
    {
        return     '<c3chart page-block  bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+theChartID+'" bindto-id="'+theChartID+'" ndType="c3Chart" id="'+theChartID+'" drop="onDropQueryElement($data, $event, \''+theChartID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']">'+
                   '<chart-axis>'+
                    '<chart-axis-x axis-id="x" axis-type="timeseries" axis-x-format="%Y-%m-%d %H:%M:%S">'+
                        '<chart-axis-x-tick tick-format-time="%H:%m:%s"/>'+
                        '</chart-axis-x>'+
                    '</chart-axis>'+
                   '</c3chart>';
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


});
