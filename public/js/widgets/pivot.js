app.service('pivot', function (dataElements) {

    this.getPivotTableSetup = function (report) {

        const pivotKeys = report.properties.pivotKeys;
        const data = report.query.data;
        const ykeys = report.properties.ykeys;
        
        const dimensionSets = {};
        const dimensions = {};
        const dimensionList = {};
        
        for(dimInfo of (pivotKeys.column.concat(pivotKeys.row))){
            dimensionList[dimInfo.id] = dimInfo
        }

        for(dim in dimensionList){
            dimensionSets[dim] = new Set();
        }

        for(const entry of data){
            for(dim in dimensionList){
                if(entry[dim]){
                    dimensionSets[dim].add(entry[dim]);
                }
            }
        }
        

        for(dim in dimensionList){
            var values = [];
            for(v of dimensionSets[dim].values()){
                values.push({
                    id : v,
                    label : v
                });
            }

            dimensions[dim] = {
                label : dimensionList[dim].objectLabel,
                values : function (context) {
                    return values;
                }
            };
        }

        const horizontalDimensions = [];
        const verticalDimensions = [];

        for(dim of pivotKeys.row){
            horizontalDimensions.push(dim.id);
        }

        for(dim of pivotKeys.column){
            verticalDimensions.push(dim.id);
        }

        const valueDataFields = [];

        for(ykey of ykeys){
            valueDataFields.push(ykey.id + ykey.aggregation);
        }

        function dataCellRenderer(items, colContext, rowContext, opts){
            var html = '<span>';
            for(ykey of ykeys){
                html += '<div>';
                html += String(wantedValue(ykey, items.default));
                html += '</div>';
            }
            html += '</span>';

            return html;
        }

        var params = {
            configuration: false, 
            data: data,
            horizontalDimensions : horizontalDimensions,
            verticalDimensions : verticalDimensions,
            dimensions : dimensions,
            valueDataFields : valueDataFields,
            dataCellRenderer : dataCellRenderer
        };

        // params = blob();
        
        console.log(params);

        var pivotID = 'pivot-' + report._id;

        return {
            html : '<div id="' + pivotID + '" > ERROR - could not display pivot table </div>',
            params : params,
            jquerySelector : '#' + pivotID
        };
    }

    function wantedValue(ykey, item){
        if(item.count === 0 ){
            return ' - ';
        }
        if(ykey.aggregation === 'count'){
            return item.sum[ykey.id + ykey.aggregation];
        }
        if(item.count === 1){
            return item.max[ykey.id + ykey.aggregation];
        }
        
        return item[ykey.aggregation][ykey.id + ykey.aggregation];
    }

    function blob(){
        var data = [
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 1,
                day : 10,
                amount : 34,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 1,
                day : 10,
                amount : 34,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 1,
                day : 10,
                amount : 48,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 1,
                day : 10,
                amount : 58,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 1,
                day : 10,
                amount : 12,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 1,
                day : 10,
                amount : 19,
            },
    
            // Feb
            
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 2,
                day : 14,
                amount : 24,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 2,
                day : 4,
                amount : 16,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 2,
                day : 19,
                amount : 30,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 2,
                day : 20,
                amount : 98,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 2,
                day : 19,
                amount : 24,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 2,
                day : 10,
                amount : 14,
            },
            
            // Mar
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 3,
                day : 14,
                amount : 21,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 3,
                day : 4,
                amount : 26,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 3,
                day : 19,
                amount : 39,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 3,
                day : 20,
                amount : 49,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 3,
                day : 19,
                amount : 22,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 3,
                day : 10,
                amount : 24,
            },
            
            // Apr
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 4,
                day : 14,
                amount : 10,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 4,
                day : 4,
                amount : 29,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 4,
                day : 19,
                amount : 27,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 4,
                day : 20,
                amount : 29,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 4,
                day : 19,
                amount : 32,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 4,
                day : 10,
                amount : 34,
            },
            
            
            // May
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 5,
                day : 14,
                amount : 40,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 5,
                day : 4,
                amount : 19,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 5,
                day : 19,
                amount : 37,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 5,
                day : 20,
                amount : 22,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 5,
                day : 19,
                amount : 36,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 5,
                day : 10,
                amount : 39,
            },
            
            // Jun
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 6,
                day : 14,
                amount : 40,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 6,
                day : 4,
                amount : 15,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 6,
                day : 19,
                amount : 15,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 6,
                day : 20,
                amount : 23,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 6,
                day : 19,
                amount : 29,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 6,
                day : 10,
                amount : 31,
            },
            
            // Jul
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 7,
                day : 14,
                amount : 38,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 7,
                day : 4,
                amount : 26,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 7,
                day : 19,
                amount : 13,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 7,
                day : 20,
                amount : 21,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 7,
                day : 19,
                amount : 45,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 7,
                day : 10,
                amount : 20,
            },
            
            // Aug
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 8,
                day : 14,
                amount : 30,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 8,
                day : 4,
                amount : 21,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 8,
                day : 19,
                amount : 38,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 8,
                day : 20,
                amount : 14,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 8,
                day : 19,
                amount : 25,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 8,
                day : 10,
                amount : 31,
            },
            
            // Sep
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 9,
                day : 14,
                amount : 24,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 9,
                day : 4,
                amount : 18,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 9,
                day : 19,
                amount : 10,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 9,
                day : 20,
                amount : 24,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 9,
                day : 19,
                amount : 45,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 9,
                day : 10,
                amount : 21,
            },
            
            // Oct
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 10,
                day : 14,
                amount : 26,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 10,
                day : 4,
                amount : 46,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 10,
                day : 19,
                amount : 48,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 10,
                day : 20,
                amount : 17,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 10,
                day : 19,
                amount : 20,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 10,
                day : 10,
                amount : 3,
            },
            
            // Nov
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 11,
                day : 14,
                amount : 10,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 11,
                day : 4,
                amount : 39,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 11,
                day : 19,
                amount : 16,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 11,
                day : 20,
                amount : 22,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 11,
                day : 19,
                amount : 26,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 11,
                day : 10,
                amount : 26,
            },
            
            // Dec
            {
                employee : {id:1, label:'John Brown'},
                department : 1,
                year : 2013,
                month : 12,
                day : 14,
                amount : 12,
            },
            {
                employee : {id:2, label:'Bill Green'},
                department : 1,
                year : 2013,
                month : 12,
                day : 4,
                amount : 15,
            },
            {
                employee : {id:3, label:'Daniel White'},
                department : 2,
                year : 2013,
                month : 12,
                day : 19,
                amount : 18,
            },
            {
                employee : {id:4, label:'Bryan Gold'},
                department : 2,
                year : 2013,
                month : 12,
                day : 20,
                amount : 13,
            },
            {
                employee : {id:5, label:'Suzy Fowler'},
                department : 3,
                year : 2013,
                month : 12,
                day : 19,
                amount : 29,
            },
            {
                employee : {id:6, label:'Julia Smith'},
                department : 3,
                year : 2013,
                month : 12,
                day : 10,
                amount : 12,
            },
            
        ];
        $.each(data, function(idx, value){
            value.total = 1;
        });
        
        var dimensions = {
            employee : {
                label :'Employee', 
            },
            department : {
                label :'Department', 
                values : function(context) {
                    return [
                        {id:1, label:'Administration'}, 
                        {id:2, label:'Logistics'}, 
                        {id:3, label:'Accounting'}
                    ];
                },
            },
            year : {
                label :'Year', 
            },
            month : {
                label :'Month', 
                values : function(context) {
                    return [
                        {id:1, label:'Jan'}, 
                        {id:2, label:'Feb'}, 
                        {id:3, label:'Mar'}, 
                        {id:4, label:'Apr'}, 
                        {id:5, label:'May'}, 
                        {id:6, label:'Jun'}, 
                        {id:7, label:'Jul'}, 
                        {id:8, label:'Aug'}, 
                        {id:9, label:'Sep'}, 
                        {id:10, label:'Oct'}, 
                        {id:11, label:'Nov'}, 
                        {id:12, label:'Dec'}, 
                    ];
                },
            },
            total : {
                label :'Total', 
                values : function(context) {
                    return [
                        {id:1, label:'Total'}, 
                    ];
                },
            },
        };

        return {
            data : data,
            dimensions : dimensions,
            verticalDimensions : ["total", "year", "month"],
            horizontalDimensions : ["department", "employee"],
            valueDataFields : ['amount'],
            configuration : false,
            resizable : true,
            resizableWidth : true,
            resizableHeight : false,
        };
    }

    // the following is old unused code. Kept just in case during the developpment of the pivot table, should be deleted afterwards

    this.getCrossTableGrid = async function (report) {


        const template = await $templateRequest('partials/widgets/pivot.html');

        return '<div id="pivot">TEEEEEXT</div>';

        const data = report.query.data;

        const columnId = report.properties.pivotKeys.column.id;
        const rowId = report.properties.pivotKeys.row.id;

        var columnFields = new Map();
        var rowFields = new Map();

        var columnIndex = 0;
        var rowIndex = 0;

        for(const entry of data){
            if(!columnFields.has(entry[columnId])){
                columnFields.set(entry[columnId], columnIndex);
                columnIndex++;
            }
            if(!rowFields.has(entry[rowId])){
                rowFields.set(entry[rowId], rowIndex);
                rowIndex++;
            }
        }

        const columnHead = columnFields.keys();
        const rowHead = rowFields.keys();

        var matrix = new Array(rowIndex);
        for(var i = 0; i < rowIndex; i++){
            matrix[i] = new Array(columnIndex);
        }

        const ykeys = report.properties.ykeys;

        for(const entry of data){
            const i = rowFields.get(entry[rowId]);
            const j = columnFields.get(entry[columnId]);
            if( i != undefined && j != undefined ){
                matrix[i][j] = entry;
            }
        }


        html = '<table id="theTable" style="width:100%">';

        for(const row of matrix){
            html += '<tr>';
            for(const content of row){
                html += '<td>';
                    html += getContentData(content, ykeys);
                html += '</td>';
            }
            html += '</tr>';
        }

        html += '</table>';


        return html;

        let id;
        if (typeof report.id === 'undefined') {
            id = report._id;
        } else {
            id = report.id;
        }

        const hashedID = report.query.id;
        var theProperties = report.properties;
        var pageBlock = 'page-block';

        if (mode === 'preview') {
            pageBlock = '';
        }

        var reportStyle = 'width:100%;padding-left:0px;padding-right:0px;';
        var rowStyle = 'width:100%;padding:0px';

        if (!theProperties.backgroundColor) theProperties.backgroundColor = '#FFFFFF';
        if (!theProperties.height) theProperties.height = 400;
        if (!theProperties.headerHeight) theProperties.headerHeight = 30;
        if (!theProperties.rowHeight) theProperties.rowHeight = 20;
        if (!theProperties.headerBackgroundColor) theProperties.headerBackgroundColor = '#FFFFFF';
        if (!theProperties.headerBottomLineWidth) theProperties.headerBottomLineWidth = 4;
        if (!theProperties.headerBottomLineColor) theProperties.headerBottomLineColor = '#999999';
        if (!theProperties.rowBorderColor) theProperties.rowBorderColor = '#CCCCCC';
        if (!theProperties.rowBottomLineWidth) theProperties.rowBottomLineWidth = 1;
        if (!theProperties.columnLineWidht) theProperties.columnLineWidht = 0;

        if (theProperties) {
            reportStyle += 'background-color:' + theProperties.backgroundColor + ';';
        }

        var htmlCode = '<div ' + pageBlock + ' id="REPORT_' + id + '" ndType="extendedGrid" class="container-fluid report-container" style="' + reportStyle + '">';

        const columns = report.properties.columns;

        htmlCode += '<div vs-repeat style="width:100%;overflow-y: auto;border: 1px solid #ccc;align-items: stretch;position: absolute;bottom: 0px;top: 0px;" scrolly="gridGetMoreData(\'' + id + '\')">';

        htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid" ng-repeat="item in getQuery(\'' + hashedID + '\').data | filter:theFilter | orderBy:getReport(\'' + hashedID + '\').predicate:getReport(\'' + hashedID + '\').reverse  " style="' + rowStyle + '"  >';

        htmlCode += '</div>';

        htmlCode += '<div ng-if="getQuery(\'' + hashedID + '\').data.length == 0" >No data found</div>';

        htmlCode += '</div>';

        htmlCode += '</div>';
        return htmlCode;

    }

    function getContentData (content, ykeys) {
        if(content){
            return '<span>' + String(content[ykeys[0].id]) + '</span>';
        }else{
            return '<span> - </span>';
        }
    }
})