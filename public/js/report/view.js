import '../custom-element/report-view.js';
import '../custom-element/report-filter-form.js';
import { getReportDefinition } from './util.js';
import api from '../api.js';
import { t } from '../i18n.js';
import * as notify from '../notify.js';
import { PdfExportSettingsModal } from '../modal/pdf-export-settings-modal.js';
import { saveReportAsXLSX } from './xlsx.js';

const searchParams = new URLSearchParams(location.search);
const filters = JSON.parse(searchParams.get('filters') ?? '{}');

const reportView = document.querySelector('app-reportview');
const reportId = reportView.getAttribute('data-report-id');
const report = await getReportDefinition(reportId);
reportView.setReport(report);
reportView.repaint({ fetchData: true, filters });

const promptsForm = document.querySelector('#prompts-form');
for (const filter of report.properties.filters.filter(f => f.filterPrompt)) {
    const reportFilterForm = document.createElement('app-report-filter-form');
    const id = filter.id + filter.filterType;
    reportFilterForm.setFilter(filter, filters[id]);
    reportFilterForm.addEventListener('change', function (ev) {
        filters[id] = reportFilterForm.getValue()
        reportView.repaint({ fetchData: true, filters });
    });
    filters[id] = reportFilterForm.getValue()

    promptsForm.append(reportFilterForm);
}

const exportButtonGroup = document.querySelector('#export-button-group');

const exportAsXLSX = exportButtonGroup.querySelector('.js-export-as-xlsx');
exportAsXLSX.addEventListener('click', ev => {
    ev.preventDefault();
    exportButtonGroup.querySelector('button').disabled = true;
    api.getReportData(report, { filters }).then(function (res) {
        const blob = saveReportAsXLSX(report, res.data.data);
        downloadBlob(blob, report.reportName + '.xlsx');
    }, () => {
        notify.error(t('The export failed. Please contact the system administrator.'));
    }).finally(() => {
        exportButtonGroup.querySelector('button').disabled = false;
    });
});

const exportAsPNG = exportButtonGroup.querySelector('.js-export-as-png');
exportAsPNG.addEventListener('click', ev => {
    ev.preventDefault();
    exportButtonGroup.querySelector('button').disabled = true;
    const settings = {
        filters,
    };
    api.getReportAsPNG(reportId, settings).then(res => {
        download(res.data.data, 'image/png', report.reportName + '.png');
    }, () => {
        notify.error(t('The export failed. Please contact the system administrator.'));
    }).finally(() => {
        exportButtonGroup.querySelector('button').disabled = false;
    });
});

const exportAsPDF = exportButtonGroup.querySelector('.js-export-as-pdf');
exportAsPDF.addEventListener('click', ev => {
    ev.preventDefault();
    exportButtonGroup.querySelector('button').disabled = true;

    const modal = new PdfExportSettingsModal();
    modal.open().then(json => {
        const settings = JSON.parse(json);
        settings.filters = filters;
        return api.getReportAsPDF(reportId, settings).then(res => {
            download(res.data.data, 'application/pdf', report.reportName + '.pdf');
        }, () => {
            notify.error(t('The export failed. Please contact the system administrator.'));
        });
    }).finally(() => {
        exportButtonGroup.querySelector('button').disabled = false;
    });
});

function download (data, type, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = 'data:' + type + ';base64,' + data;
    a.dispatchEvent(new MouseEvent('click'));
}

function downloadBlob (blob, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = URL.createObjectURL(blob);
    a.dispatchEvent(new MouseEvent('click'));
    URL.revokeObjectURL(a.href);
}
