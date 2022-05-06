/* global XLSX: false, datenum: false */

(function () {
    'use strict';

    angular.module('app.reports').factory('xlsxService', xlsxService);

    xlsxService.$inject = ['FileSaver', 'reportsService'];

    function xlsxService (FileSaver, reportsService) {
        const service = {
            saveReportAsXLSX: saveReportAsXLSX,
        };

        return service;

        function saveReportAsXLSX (report, data) {
            var wopts = { bookType: 'xlsx', bookSST: false, type: 'binary' };
            var ws_name = report.reportName;

            var wb = new Workbook();
            var ws = sheet_from_array_of_arrays(report, data);

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

        function sheet_from_array_of_arrays (report, data) {
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
                    if (range.s.r > R + 1) range.s.r = R + 1;
                    if (range.s.c > i) range.s.c = i;
                    if (range.e.r < R + 1) range.e.r = R + 1;
                    if (range.e.c < i) range.e.c = i;

                    let cell;
                    const columnId = reportsService.getColumnId(report.properties.columns[i]);
                    if (report.properties.columns[i].elementType === 'number' && data[R][columnId]) {
                        cell = { v: Number(data[R][columnId]) };
                    } else {
                        cell = { v: data[R][columnId] };
                    }
                    cell_ref = XLSX.utils.encode_cell({ c: i, r: R + 1 });
                    if (typeof cell.v === 'number') cell.t = 'n';
                    else if (typeof cell.v === 'boolean') cell.t = 'b';
                    else if (cell.v instanceof Date) {
                        cell.t = 'n'; cell.z = XLSX.SSF._table[14];
                        cell.v = datenum(cell.v);
                    } else cell.t = 's';

                    ws[cell_ref] = cell;
                }
            }
            if (range.s.c < 10000000) ws['!ref'] = XLSX.utils.encode_range(range);

            return ws;
        }
    }
})();
