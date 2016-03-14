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

        //console.log('deleting chart column',chart,column);

        var index = chart.dataColumns.indexOf(column);
        //console.log('The column index is: ',index);
        if (index > -1) {

            chart.dataColumns.splice(index, 1);
            /*
            var theValues = [];
            var theNames = {};

            for (var i in $scope.selectedChart.dataColumns)
                {
                    theValues.push($scope.selectedChart.dataColumns[i].id);
                    var valueName = $scope.selectedChart.dataColumns[i].id;
                    theNames[valueName] = $scope.selectedChart.dataColumns[i].elementLabel;
                }

            $scope.selectedChart.chartCanvas.load({

                json: $scope.queries[0].data,
                keys: {
                    value: theValues
                },
                names: theNames

            });
            */

            this.rebuildChart(chart);

        } else {
        //seems that this chart has a query that changed and the column cant be found in
        }
    }

    this.changeChartColumnType = function(chart,column)
    {
        //if (column == '')
        //var index = $scope.selectedChart.dataColumns.indexOf(column);
        //spline, bar , line, area, area-spline, scatter , pie, donut
        //console.log('column Type',column.type,column);

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
        console.log('changign color',color,column.id);
        //chart.chartCanvas.data.colors[column.id] = color;
        var column = "'"+column.id+"'";
        chart.chartCanvas.data.colors[column] = d3.rgb('#ff0000').darker(1)
    }

    this.getChartHTML = function (theChartID)
    {
        /*
        return '<div ng-if="!getChartDataAxis(\''+theChartID+'\')" class="alert alert-warning" style="top:0px;">No selected dimension for this chart, please, drop one Dimension!!</div>'+
               '<div ng-if="!getChartDataColumns(\''+theChartID+'\')" class="alert alert-warning" style="top:100px;">No selected metrics for this chart, please, drop at least one metric!!</div>'+
        */
        return     '<c3chart page-block  bs-loading-overlay bs-loading-overlay-reference-id="OVERLAY_'+theChartID+'" bindto-id="'+theChartID+'" ndType="c3Chart" id="'+theChartID+'" drop="onDropQueryElement($data, $event, \''+theChartID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']">'+
                   '<chart-axis>'+
                    '<chart-axis-x axis-id="x" axis-type="timeseries" axis-x-format="%Y-%m-%d %H:%M:%S">'+
                        '<chart-axis-x-tick tick-format-time="%H:%m:%s"/>'+
                        '</chart-axis-x>'+
                    '</chart-axis>'+
                   '</c3chart>';
    }

/*
    this.getChartLayerHTML = function (theChartID)
    {
        return     '<div class="container chart-temporary-layer" id="'+theChartID+'" ndType="c3ChartLayer" drop="onDropQueryElement($data, $event, \''+theChartID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']">'+
                        '<div ng-if="!getChartDataAxis(\''+theChartID+'\')" class="alert alert-warning">No selected dimension for this chart, please, drop one Dimension!!</div>'+
                        '<div ng-if="!getChartDataColumns(\''+theChartID+'\')" class="alert alert-warning">No selected metrics for this chart, please, drop at least one metric!!</div>'+
                   '</div>';




    }
*/


   this.applyChartSettings = function($scope)
    {
        /*
        $scope.selectedChart.dataPoints
        $scope.selectedChart.dataColumns
        $scope.selectedChart.datax



        $scope.selectedChart.dataColumns = [];

        */

        //datacolumn.type
        //datacolumn.
        //datacolumn.color

        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns)
        {
          // console.log(JSON.stringify($scope.selectedChart.dataColumns[i]));

            theValues.push($scope.selectedChart.dataColumns[i].object.elementName);
            theNames.push($scope.selectedChart.dataColumns[i].object.elementLabel);
        }


        $scope.vm = {};

        //{"id": "top-1", "type": "line", "name": "Top one"}
        //$scope.vm.datacolumns = [{id:'linea1',type:'line',name:'linea1'}];
        //$scope.vm.datax = {"id": "etiq"};
        //$scope.vm.datapoints = [{linea1:123,etiq:'one'},{linea1:234,etiq:'dos'},{linea1:345,etiq:'tres'}];
        //console.log(JSON.stringify($scope.queries[0].data));

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


       /* var chart = c3.generate({
        bindto: '#chart1',
        data: {
            json: $scope.queries[0].data,
            keys: {
                x: 'wst5883cbeb81db4ae3b1d75e8371097e9a_device_name', // it's possible to specify 'x' when category axis
                value: ['wst6058ffeae3444af58d72004e58cc4998_clickssum', 'wst6058ffeae3444af58d72004e58cc4998_impressionssum','wst6058ffeae3444af58d72004e58cc4998_conversionssum'],
            },
            names: {
                wst6058ffeae3444af58d72004e58cc4998_clickssum: 'clicks',
                wst6058ffeae3444af58d72004e58cc4998_impressionssum: 'impressions',
                wst6058ffeae3444af58d72004e58cc4998_conversionssum: 'conversions'
            }
        },
        axis: {
            x: {
                type: 'category'
            }
        } ,
        legend: {
        show:false
    }
    });*/

    //wst5883cbeb81db4ae3b1d75e8371097e9a_device_name":"Mobile","wst6058ffeae3444af58d72004e58cc4998_clickssum":"11325412","wst6058ffeae3444af58d72004e58cc4998_impressionssum":"10835247981","wst6058ffeae3444af58d72004e58cc4998_average_positionsum":null,"wst6058ffeae3444af58d72004e58cc4998_conversionssum":96,"wst6058ffeae3444af58d72004e58cc4998_spendsum":16296400


    }

    this.onChartPropertiesChanged = function($scope,object)
    {

    /*
        for (var i in $scope.queries)
        {
            if ($scope.queries[i].name == $scope.selectedChart.query)
            {
                $scope.selectedChart.dataPoints = $scope.queries[i].data;
            }

        }
    */

    //$scope.selectedChart.datax = $scope.chartModal.dataxObject.object.elementName;
    //$scope.selectedChart.dataPoints = $scope.chartModal.dataxObject.query.data;
    //console.log('data selected',JSON.stringify($scope.chartModal.dataxObject.query));
    //console.log('This chart properties have changed',JSON.stringify($scope.selectedChart));

    }


    this.applyChartSettings4Pie = function($scope)
    {

        var theValues = [];
        var theNames = [];

        for (var i in $scope.selectedChart.dataColumns)
        {
          // console.log(JSON.stringify($scope.selectedChart.dataColumns[i]));

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
