angular.module('app').service('verticalGrid', function (dataElements) {
    this.getVerticalGrid = function (report, mode) {
        let id;
        if (typeof report.id === 'undefined') {
            id = report._id;
        } else {
            id = report.id;
        }

        var theProperties = report.properties;
        var pageBlock = 'page-block';

        if (mode === 'preview') {
            pageBlock = '';
        }

        var reportStyle = 'width:100%;padding-left:0px;padding-right:0px;';
        var rowStyle = 'width:100%;padding:0px';

        if (!theProperties.height) theProperties.height = 400;

        if (theProperties) {
            reportStyle += 'background-color: #fff;';
        }

        var htmlCode = '<div ' + pageBlock + ' id="REPORT_' + id + '" ndType="extendedGrid" class="container-fluid report-container" style="' + reportStyle + '">';

        const columns = report.properties.columns;

        htmlCode += '<div vs-repeat style="width:100%;overflow-y: auto;border: 1px solid #ccc;align-items: stretch;position: absolute;bottom: 0px;top: 0px;" scrolly="gridGetMoreData(\'' + id + '\')">';

        htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid" ng-repeat="item in report.query.data | filter:theFilter | orderBy:report.predicate:report.reverse  " style="' + rowStyle + '"  >';

        htmlCode += getRowData(columns);

        htmlCode += '</div>';

        htmlCode += '<div ng-if="report.query.data.length == 0" >No data found</div>';

        htmlCode += '</div>';

        htmlCode += '</div>';
        return htmlCode;
    };

    function getRowData (columns) {
        var htmlCode = '';

        htmlCode += '<div class="col-md-12 vertical-grid-record-container" >';

        for (var i = 0; i < columns.length; i++) {
            htmlCode += '<div class="col-md-12 vertical-grid-column-container" >';

            htmlCode += '<div class="col-md-3 vertical-grid-label-column" >';
            htmlCode += dataElements.getElementLabel(columns[i]);
            htmlCode += '</div>';

            htmlCode += '<div class="col-md-9 vertical-grid-column-value" >';
            const ev = dataElements.getElementValue(columns[i], 'vertical-grid-data-column');
            htmlCode += ev;
            htmlCode += '</div>';

            htmlCode += '</div>';
        }

        htmlCode += '</div>';

        return htmlCode;
    }
});
