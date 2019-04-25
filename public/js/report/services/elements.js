angular.module('app').service('dataElements', function () {
    this.getElementLabel = function (element) {
        var htmlCode = '';

        htmlCode = '<span class="report-element-label">' + element.objectLabel + '</span>';

        return htmlCode;
    };

    this.getElementValue = function (element, dataColumnClass) {
        var htmlCode = '';
        var columnDefaultStyle = '';

        var theValue = '<div style="overflow:hidden;height:100%;">{{item.' + element.id + '}}</div>';
        if (element.elementType === 'number') { theValue = '<div style="overflow:hidden;height:100%;">{{item.' + element.id + '}}</div>'; }

        if (element.signals) {
            var theStyle = '<style>';
            var theClass = '';
            const columnIndex = '';
            for (var s in element.signals) {
                theStyle += ' .customStyle' + s + '_' + columnIndex + '{color:' + element.signals[s].color + ';background-color:' + element.signals[s]['background-color'] + ';font-size:' + element.signals[s]['font-size'] + ';font-weight:' + element.signals[s]['font-weight'] + ';font-style:' + element.signals[s]['font-style'] + ';}';
                var theComma = '';
                if (s > 0) { theComma = ' , '; }

                var operator = '>';

                switch (element.signals[s].filter) {
                case 'equal':
                    operator = ' == ' + element.signals[s].value1;
                    break;
                case 'diferentThan':
                    operator = ' != ' + element.signals[s].value1;
                    break;
                case 'biggerThan':
                    operator = ' > ' + element.signals[s].value1;
                    break;
                case 'biggerOrEqualThan':
                    operator = ' >= ' + element.signals[s].value1;
                    break;
                case 'lessThan':
                    operator = ' < ' + element.signals[s].value1;
                    break;
                case 'lessOrEqualThan':
                    operator = ' <= ' + element.signals[s].value1;
                    break;
                case 'between':
                    operator = ' >= ' + element.signals[s].value1 + ' && {{item.' + element.id + '}} <= ' + element.signals[s].value2;
                    break;
                case 'notBetween':
                    operator = ' < ' + element.signals[s].value1 + ' || {{item.' + element.id + '}}  > ' + element.signals[s].value2;
                    break;
                }

                theClass += theComma + 'customStyle' + s + '_' + columnIndex + ' : {{item.' + element.id + '}} ' + operator;
            }
            htmlCode += theStyle + '</style>';

            if (element.elementType === 'number') { theValue = '<div ng-class="{' + theClass + '}" style="overflow:hidden;height:100%;" >{{item.' + element.id + '}}</div>'; } else { theValue = '<div ng-class="{' + theClass + '}" style="overflow:hidden;height:100%;" >{{item.' + element.id + '}}</div>'; }
        }

        if (element.link) {
            if (element.link.type === 'report') {
                if (element.elementType === 'number') { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/reports/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + ' | number}}</a>'; } else { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/reports/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + '}}</a>'; }
            }
            if (element.link.type === 'dashboard') {
                if (element.elementType === 'number') { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/dashboards/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + ' | number}}</a>'; } else { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="/#/dashboards/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + '}}</a>'; }
            }
        }

        var columnStyle = '';
        if (element.columnStyle) {
            columnStyle = 'color:' + element.columnStyle.color + ';';

            for (var key in element.columnStyle) {
                columnStyle += key + ':' + element.columnStyle[key] + ';';
            }
        }

        var defaultAligment = '';

        var colWidth = '';

        var colClass = '';

        if (element.elementType === 'number') {
            defaultAligment = 'text-align: right;';
        }

        const hashedID = '';
        htmlCode += '<div id="ROW_' + element.id + '" class="' + dataColumnClass + ' ' + colClass + '" style="' + columnDefaultStyle + columnStyle + colWidth + defaultAligment + '" ng-click="cellClick(\'' + hashedID + '\',item,' + '\'' + element.id + '\'' + ',' + '\'' + element.id + '\'' + ')">' + theValue + ' </div>';

        return htmlCode;
    };
});
