angular.module('app').service('dataElements', function () {
    this.getElementValue = function (element, dataColumnClass) {
        let htmlCode = '';
        const columnDefaultStyle = '';

        let theValue = '<div style="overflow:hidden;height:100%;">{{item.' + element.id + '}}</div>';
        if (element.elementType === 'number') { theValue = '<div style="overflow:hidden;height:100%;">{{item.' + element.id + '}}</div>'; }

        if (element.signals) {
            let theStyle = '<style>';
            let theClass = '';
            const columnIndex = '';
            for (const s in element.signals) {
                theStyle += ' .customStyle' + s + '_' + columnIndex + '{color:' + element.signals[s].color + ';background-color:' + element.signals[s]['background-color'] + ';font-size:' + element.signals[s]['font-size'] + ';font-weight:' + element.signals[s]['font-weight'] + ';font-style:' + element.signals[s]['font-style'] + ';}';
                let theComma = '';
                if (s > 0) { theComma = ' , '; }

                let operator = '>';

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
                if (element.elementType === 'number') { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="reports/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + ' | number}}</a>'; } else { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="reports/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + '}}</a>'; }
            }
            if (element.link.type === 'dashboard') {
                if (element.elementType === 'number') { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="dashboards/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + ' | number}}</a>'; } else { theValue = '<a class="columnLink" style="overflow:hidden;height:100%;" href="dashboards/' + element.link._id + '/' + element.link.promptElementID + '/{{item.' + element.id + '}}">{{item.' + element.id + '}}</a>'; }
            }
        }

        let columnStyle = '';
        if (element.columnStyle) {
            columnStyle = 'color:' + element.columnStyle.color + ';';

            for (const key in element.columnStyle) {
                columnStyle += key + ':' + element.columnStyle[key] + ';';
            }
        }

        let defaultAligment = '';

        const colWidth = '';

        const colClass = '';

        if (element.elementType === 'number') {
            defaultAligment = 'text-align: right;';
        }

        const hashedID = '';
        htmlCode += '<div id="ROW_' + element.id + '" class="' + dataColumnClass + ' ' + colClass + '" style="' + columnDefaultStyle + columnStyle + colWidth + defaultAligment + '" ng-click="cellClick(\'' + hashedID + '\',item,' + '\'' + element.id + '\'' + ',' + '\'' + element.id + '\'' + ')">' + theValue + ' </div>';

        return htmlCode;
    };
});
