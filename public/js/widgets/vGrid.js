app.service('verticalGrid' , function (dataElements) {


this.getVerticalGrid = function(report,mode)
    {
            if (report.id == undefined)
                var id = report._id;
                else
                var id = report.id;

            hashedID = report.query.id;
            var theProperties = report.properties;
            var pageBlock = "page-block";


            if (mode == 'preview')
                {
                   pageBlock = "";
                }


            var reportStyle = 'width:100%;padding-left:0px;padding-right:0px;';
            var headerStyle = 'width:100%;padding-left:0px;background-color:#ccc;';
            var rowStyle = 'width:100%;padding:0px';
            var columnDefaultStyle = 'height:40px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;';


            if (!theProperties.backgroundColor) theProperties.backgroundColor = "#FFFFFF";
            if (!theProperties.height) theProperties.height = 400;
            if (!theProperties.headerHeight) theProperties.headerHeight = 30;
            if (!theProperties.rowHeight) theProperties.rowHeight = 20;
            if (!theProperties.headerBackgroundColor) theProperties.headerBackgroundColor = "#FFFFFF";
            if (!theProperties.headerBottomLineWidth) theProperties.headerBottomLineWidth = 4;
            if (!theProperties.headerBottomLineColor) theProperties.headerBottomLineColor = "#999999";
            if (!theProperties.rowBorderColor) theProperties.rowBorderColor = "#CCCCCC";
            if (!theProperties.rowBottomLineWidth) theProperties.rowBottomLineWidth = 1;
            if (!theProperties.columnLineWidht) theProperties.columnLineWidht = 0;

            if (theProperties)
                {
                    reportStyle += 'background-color:'+theProperties.backgroundColor+';';
                    //reportStyle += 'height:'+theProperties.height+'px;';

                    var theRepeatHeight = theProperties.height - theProperties.headerHeight;
                    repeatHeight = 'height:'+theRepeatHeight+'px;';

                    columnDefaultStyle += 'height:'+theProperties.rowHeight+'px;';
                    var paddingTop = (theProperties.rowHeight - 14) /2;
                    columnDefaultStyle += 'padding-top:'+paddingTop+'px;';

                    headerStyle += 'background-color:'+theProperties.headerBackgroundColor+';';
                    headerStyle += 'height:'+theProperties.headerHeight+'px;';
                    headerStyle += 'border-bottom: '+theProperties.headerBottomLineWidth+'px solid '+theProperties.headerBottomLineColor+';';

                    columnDefaultStyle += 'border-bottom: '+theProperties.rowBottomLineWidth+'px solid '+theProperties.rowBorderColor+';';
                    columnDefaultStyle += 'border-right: '+theProperties.columnLineWidht+'px solid '+theProperties.rowBorderColor+';';
                }


            var htmlCode = '<div '+pageBlock+' id="REPORT_'+id+'" ndType="extendedGrid" class="container-fluid report-container" style="'+reportStyle+'">';

            columns = report.properties.columns;


            htmlCode += '<div vs-repeat style="width:100%;overflow-y: auto;border: 1px solid #ccc;align-items: stretch;position: absolute;bottom: 0px;top: 0px;" scrolly="gridGetMoreData(\''+id+'\')">';

            htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid" ng-repeat="item in getQuery(\''+hashedID+'\').data | filter:theFilter | orderBy:getReport(\''+hashedID+'\').predicate:getReport(\''+hashedID+'\').reverse  " style="'+rowStyle+'"  >';

            htmlCode += getRowData(columns);

            htmlCode += '</div>';

            htmlCode += '<div ng-if="getQuery(\''+hashedID+'\').data.length == 0" >No data found</div>';

            htmlCode += '</div>';


    htmlCode += '</div>';
            return htmlCode;

    }



function getRowData(columns)
    {
        var htmlCode = '';

        htmlCode += '<div class="col-md-12 vertical-grid-record-container" >';

        for(var i = 0; i < columns.length; i++)
            {
                htmlCode += '<div class="col-md-12 vertical-grid-column-container" >';

                    htmlCode += '<div class="col-md-3 vertical-grid-label-column" >';
                        htmlCode += dataElements.getElementLabel(columns[i]);
                    htmlCode += '</div>';

                    htmlCode += '<div class="col-md-9 vertical-grid-column-value" >';
                        htmlCode += dataElements.getElementValue(columns[i],'vertical-grid-data-column');
                    htmlCode += '</div>';

                htmlCode += '</div>';
            }

        htmlCode += '</div>';

        return htmlCode;
    }

});
