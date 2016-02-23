app.service('c3Charts' , function () {


this.rebuildChart = function(chart)
    {
        console.log('rebuilding chart');

        var theValues = [];
        var theNames = {};

        //console.log('axisfield',chart.dataAxis.id)

        var axisField = '';
        if (chart.dataAxis)
            axisField = chart.dataAxis.id;

            console.log('axisfield',axisField);

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

                console.log('column id',elementName,chart.dataColumns[i].id)
                if (chart.dataColumns[i].id == elementName)
                {
                    columnFound = true; //columnsForDelete.push(i);
                    console.log('column found',elementName);
                }

            }

            if (columnFound == false)
               {
                columnsForDelete.push(i);
                console.log('pushing a column for delete',i)
                }
        }

        console.log('there are ',columnsForDelete.length,'columns for delete');

        for (var cfd in columnsForDelete)
        {
           chart.dataColumns.splice(columnsForDelete[cfd],1);
           console.log('deleting ',columnsForDelete)
        }

        //remove query if not dataColumns and not data Axis

        if (axisIsInQuery == false && chart.dataColumns.length)
        {
            chart.query = null;
            chart.queryName = null;
        }


        console.log('the data columns ',chart.dataColumns);


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
                console.log('the values',theChartCode ,theValues, chart.query.data);

                if (!chart.height)
                    chart.height = 300;


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

            chart.chartCanvas = chartCanvas;
        }

        for (var c in chart.dataColumns)
        {
            if (chart.dataColumns[c].type != 'line')
                chart.chartCanvas.transform(chart.dataColumns[c].type, chart.dataColumns[c].id);

        }


    }


    this.deleteChartColumn = function(chart,column)
    {

        console.log('deleting chart column',chart,column);

        var index = chart.dataColumns.indexOf(column);
        console.log('The column index is: ',index);
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
        console.log('column Type',column.type,column);

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
                                chart.chartCanvas.transform('pie', column.id);
                            } else
                            if (column.type == 'pie')
                            {
                                column.type = 'donut';
                                chart.chartCanvas.transform('donut', column.id);
                            } else
                            if (column.type == 'donut')
                            {
                                column.type = 'line';
                                chart.chartCanvas.transform('line', column.id);
                            }

    }

    this.getChartHTML = function (theChartID)
    {
        //return '<div>hola chart</div>';
        /*$scope.lastChartID = $scope.lastChartID+1;
        var theChartID = 'chart'+$scope.lastChartID;
        $scope.charts.push({charID:theChartID,dataPoints:[],dataColumns:[],datax:{},height:300});*/
        //return '<c3chart page-block ndType="c3Chart"  bindto-id="'+theChartID+'" chart-data="charts['+$scope.lastChartID+'].dataPoints" chart-columns="charts['+$scope.lastChartID+'].datacolumns" chart-x="charts['+$scope.lastChartID+'].datax">'+
        //return '<div ndType="c3Chart" id="'+theChartID+'" drop="onDropQueryElement($data, $event, \''+theChartID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']"><c3chart page-block  bindto-id="'+theChartID+'" >'+
        return '<c3chart page-block  bindto-id="'+theChartID+'" ndType="c3Chart" id="'+theChartID+'" drop="onDropQueryElement($data, $event, \''+theChartID+'\')" drop-effect="copy" drop-accept="[\'json/custom-object\',\'json/column\']">'+

                   //' <chart-column column-id="data-1"'+
                   //'    column-values="30,200,100,400,150,250" '+
                   //'   column-type="line"/>  '+

                   '<chart-axis>'+
                    '<chart-axis-x axis-id="x" axis-type="timeseries" axis-x-format="%Y-%m-%d %H:%M:%S">'+
                        '<chart-axis-x-tick tick-format-time="%H:%m:%s"/>'+
                    '</chart-axis-x>'+
                '</chart-axis>'+
                   '</c3chart>';




    }

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
           console.log(JSON.stringify($scope.selectedChart.dataColumns[i]));

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


});
