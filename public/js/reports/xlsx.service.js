/* global XLSX: false, Blob: false, datenum: false */

(function () {
    'use strict';

    angular.module('app.reports').factory('xlsxService', xlsxService);

    xlsxService.$inject = ['FileSaver', 'reportsService'];

    function xlsxService (FileSaver, reportsService) {
        const service = {
            saveReportAsXLSX: saveReportAsXLSX,
        };

        return service;

        function saveReportAsXLSX (report) {
            var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
            var ws_name = report.reportName;

            var wb = new Workbook();
            var ws = sheet_from_array_of_arrays(report);

            wb.SheetNames.push(ws_name);
            wb.Sheets[ws_name] = ws;

            var wbout = XLSX.write(wb, wopts);

            function s2ab (s) {
                var buf = new ArrayBuffer(s.length);
                var view = new Uint8Array(buf);
                for (let i = 0; i !== s.length; ++i) {
                    view[i] = s.charCodeAt(i) & 0xFF;
                }

                return buf;
            }

            FileSaver.saveAs(new Blob([s2ab(wbout)], { type: '' }), ws_name + '.xlsx');
        };
        function Workbook () {
            if (!(this instanceof Workbook)) return new Workbook();
            this.SheetNames = [];
            this.Sheets = {};
        }

        function sheet_from_array_of_arrays (report) {
            var data = report.query.data;
            var ws = {};
            var range = { s: { c: 10000000, r: 10000000 }, e: { c: 0, r: 0 } };
            for (var i = 0; i < report.properties.columns.length; i++) {
                if (range.s.r > 0) range.s.r = 0;
                if (range.s.c > i) range.s.c = i;
                if (range.e.r < 0) range.e.r = 0;
                if (range.e.c < i) range.e.c = i;

                var cell = { v: reportsService.getColumnDescription(report.properties.columns[i]) };
                var cell_ref = XLSX.utils.encode_cell({ c: i, r: 0 });
                if (typeof cell.v === 'number') cell.t = 'n';
                else if (typeof cell.v === 'boolean') cell.t = 'b';
                else if (cell.v instanceof Date) {
                    cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                    cell.v = datenum(cell.v);
                } else cell.t = 's';

                ws[cell_ref] = cell;
            }

            for (let R = 0; R !== data.length; ++R) {
                for (let i = 0; i < report.properties.columns.length; i++) {
                    // var elementName = report.properties.columns[i].collectionID.toLowerCase()+'_'+report.properties.columns[i].elementName;
                    var elementID = 'e' + report.properties.columns[i].elementID.toLowerCase();
                    var elementName = elementID.replace(/[^a-zA-Z ]/g, '');

                    if (report.properties.columns[i].aggregation) {
                        elementID = 'e' + report.properties.columns[i].elementID.toLowerCase() + report.properties.columns[i].aggregation.substring(0, 3);
                        elementName = elementID.replace(/[^a-zA-Z ]/g, '');
                    } else {
                        elementName = elementName + 'raw';
                    }
                    if (range.s.r > R + 1) range.s.r = R + 1;
                    if (range.s.c > i) range.s.c = i;
                    if (range.e.r < R + 1) range.e.r = R + 1;
                    if (range.e.c < i) range.e.c = i;

                    let cell;
                    console.log(elementName);
                    if (report.properties.columns[i].elementType === 'number' && data[R][elementName]) {
                        cell = { v: Number(data[R][elementName]) };
                    } else {
                        cell = { v: data[R][elementName] };
                    }
                    cell_ref = XLSX.utils.encode_cell({ c: i, r: R + 1 });
                    if (typeof cell.v === 'number') cell.t = 'n';
                    else if (typeof cell.v === 'boolean') cell.t = 'b';
                    else if (cell.v instanceof Date) {
                        cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                        cell.v = datenum(cell.v);
                    } else cell.t = 's';

                    cell.s = { fill: { fgColor: { rgb: 'FFFF0000' } } };

                    ws[cell_ref] = cell;
                }
            }
            if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);

            return ws;
        }
    }
})();
