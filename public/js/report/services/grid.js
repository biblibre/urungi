angular.module('app').service('grid', function () {
    var colClass = '';
    var colWidth = '';
    var columns = [];

    this.refresh = function (columns, id, query, designerMode, properties) {
        this.simpleGrid(columns, id, query, designerMode, properties, function () {});
    };

    this.extendedGridV2 = function (report, mode) {
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
        var headerStyle = 'width:100%;padding-left:0px;background-color:#ccc;';
        var rowStyle = 'width:100%;padding:0px';
        var columnDefaultStyle = 'height:40px;overflow:hidden;padding:2px; border-bottom: 1px solid #ccc;border-right: 1px solid #ccc;';

        if (!theProperties.height) theProperties.height = 400;

        // margins
        // paddings

        if (theProperties) {
            reportStyle += 'background-color: #fff;';
            // reportStyle += 'height:'+theProperties.height+'px;';

            const rowHeight = 35;
            columnDefaultStyle += 'height: ' + rowHeight + 'px;';
            var paddingTop = (rowHeight - 14) / 2;
            columnDefaultStyle += 'padding-top:' + paddingTop + 'px;';

            headerStyle += 'background-color: #fff;';
            headerStyle += 'height: 60px;';
            headerStyle += 'border-bottom: 4px solid #999;';

            columnDefaultStyle += 'border-bottom: 2px solid #ccc;';
        }

        var htmlCode = '<div ' + pageBlock + ' id="REPORT_' + id + '" ndType="extendedGrid" class="container-fluid report-container" style="' + reportStyle + '">';

        columns = report.properties.columns;

        if (columns.length > 4) { colWidth = 'width:' + 100 / columns.length + '%;float:left;'; } else { colClass = 'col-xs-' + 12 / columns.length; }

        // header
        htmlCode += '<div class="container-fluid" style="' + headerStyle + '">';
        for (const col of columns) {
            htmlCode += getHeaderColumn(col);
        }
        htmlCode += '</div>';

        htmlCode += '<div vs-repeat style="width:100%;overflow-y: scroll;border: 1px solid #ccc;align-items: stretch;position: absolute;bottom: 0px;top: 60px;" scrolly="gridGetMoreData(\'' + id + '\')">';

        htmlCode += '<div ndType="repeaterGridItems" class="repeater-data container-fluid" ng-repeat="item in report.query.data | filter:theFilter | orderBy:report.predicate:report.reverse  " style="' + rowStyle + '"  >';

        for (let i = 0; i < columns.length; i++) {
            htmlCode += getDataCell(columns[i], id, i, columnDefaultStyle);
        }

        htmlCode += '</div>';

        htmlCode += '<div ng-if="report.query.data.length == 0" >No data found</div>';

        htmlCode += '</div>';

        htmlCode += '</div>';

        return htmlCode;
    };

    function getHeaderColumn (column) {
        var htmlCode = '';
        htmlCode += '<div class="' + colClass + ' report-repeater-column-header" style="' + colWidth + '"><table style="table-layout:fixed;width:100%"><tr><td style="overflow:hidden;white-space: nowrap;width:95%;">' + column.objectLabel + '</td></tr></table> </div>';

        return htmlCode;
    }

    function getDataCell (column, gridID, columnIndex, columnDefaultStyle) {
        var htmlCode = '';

        var theValue = '<div style="overflow:hidden;height:100%;">{{item.' + column.id + '}}</div>';
        if (column.elementType === 'number') { theValue = '<div style="overflow:hidden;height:100%;">{{item.' + column.id + '}}</div>'; }

        if (column.signals) {
            var theStyle = '<style>';
            var theClass = '';
            for (var s in column.signals) {
                theStyle += ' .customStyle' + s + '_' + columnIndex + '{color:' + column.signals[s].color + ';background-color:' + column.signals[s]['background-color'] + ';font-size:' + column.signals[s]['font-size'] + ';font-weight:' + column.signals[s]['font-weight'] + ';font-style:' + column.signals[s]['font-style'] + ';}';
                var theComma = '';
                if (s > 0) { theComma = ' , '; }

                var operator = '>';

                switch (column.signals[s].filter) {
                case 'equal':
                    operator = ' == ' + column.signals[s].value1;
                    break;
                case 'diferentThan':
                    operator = ' != ' + column.signals[s].value1;
                    break;
                case 'biggerThan':
                    operator = ' > ' + column.signals[s].value1;
                    break;
                case 'biggerOrEqualThan':
                    operator = ' >= ' + column.signals[s].value1;
                    break;
                case 'lessThan':
                    operator = ' < ' + column.signals[s].value1;
                    break;
                case 'lessOrEqualThan':
                    operator = ' <= ' + column.signals[s].value1;
                    break;
                case 'between':
                    operator = ' >= ' + column.signals[s].value1 + ' && {{item.' + column.id + '}} <= ' + column.signals[s].value2;
                    break;
                case 'notBetween':
                    operator = ' < ' + column.signals[s].value1 + ' || {{item.' + column.id + '}}  > ' + column.signals[s].value2;
                    break;
                }

                theClass += theComma + 'customStyle' + s + '_' + columnIndex + ' : {{item.' + column.id + '}} ' + operator;
            }
            htmlCode += theStyle + '</style>';

            if (column.elementType === 'number') { theValue = '<div ng-class="{' + theClass + '}" style="overflow:hidden;height:100%;" >{{item.' + column.id + '}}</div>'; } else { theValue = '<div ng-class="{' + theClass + '}" style="overflow:hidden;height:100%;" >{{item.' + column.id + '}}</div>'; }
        }

        if (column.link) {
            if (column.link.type === 'report') {
                if (column.elementType === 'number') { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/reports/' + column.link._id + '/' + column.link.promptElementID + '/{{item.' + column.id + '}}">{{item.' + column.id + ' | number}}</a>'; } else { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/reports/' + column.link._id + '/' + column.link.promptElementID + '/{{item.' + column.id + '}}">{{item.' + column.id + '}}</a>'; }
            }
            if (column.link.type === 'dashboard') {
                if (column.elementType === 'number') { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/dashboards/' + column.link._id + '/' + column.link.promptElementID + '/{{item.' + column.id + '}}">{{item.' + column.id + ' | number}}</a>'; } else { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/dashboards/' + column.link._id + '/' + column.link.promptElementID + '/{{item.' + column.id + '}}">{{item.' + column.id + '}}</a>'; }
            }
        }

        var columnStyle = '';
        if (column.columnStyle) {
            columnStyle = 'color:' + column.columnStyle.color + ';';

            for (var key in column.columnStyle) {
                columnStyle += key + ':' + column.columnStyle[key] + ';';
            }
        }

        var defaultAligment = '';
        if (column.elementType === 'number') { defaultAligment = 'text-align: right;'; }

        htmlCode += '<div id="ROW_' + gridID + '" class="repeater-data-column ' + colClass + '" style="' + columnDefaultStyle + columnStyle + colWidth + defaultAligment + '" >' + theValue + ' </div>';

        return htmlCode;
    }
});

angular.module('app').directive('scrolly', function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
            var raw = element[0];
            element.bind('scroll', function () {
                if (raw.scrollTop + raw.offsetHeight > raw.scrollHeight) {
                    scope.$apply(attrs.scrolly);
                }
            });
        }
    };
});
