import { t } from '../i18n.js';
import ReportTable from './table.js';

const table = new ReportTable();
const tableWrapper = document.getElementById('report-list-table-wrapper');
table.render(tableWrapper);

if (location.hash === '#intro') {
    showIntro();
}
document.getElementById('showIntroButton').addEventListener('click', function () {
    showIntro();
});

function showIntro() {
    window.introJs().setOptions({
        nextLabel: t('Next'),
        prevLabel: t('Back'),
        doneLabel: t('Done'),
        steps: [
            {
                title: t('Reports'),
                intro: t('Here you can create and execute reports.'),
            },
            {
                title: t('Reports'),
                intro: '<p>' +
                t('Choose a report type and drag and drop elements from the selected layer to compose your report.') +
                '</p><p>' +
                t('You can also add runtime filters to split your data in real time.') +
                '</p>',
            },
            {
                element: '#new-report-button',
                title: t('New Report'),
                intro: t('Click here to create a new report.'),
            },
            {
                element: '#report-list-table-wrapper',
                title: t('Reports list'),
                intro: '<p><strong>' +
                t('Here all your reports are listed.') +
                '</strong></p><p>' +
                t('Click over a report\'s name to execute it.') +
                '</p><p>' +
                t('You can also modify or drop the report, clicking into the modify or delete buttons.') +
                '</p>',
            },
            {
                element: '.btn.edit',
                title: t('Edit report'),
                intro: t('Click here to modify the report.'),
            },
            {
                element: '.btn.duplicate',
                title: t('Duplicate report'),
                intro: t('Click here to duplicate the report.'),
            },
            {
                element: '.btn.delete',
                title: t('Delete report'),
                intro:
                '<p><strong>' +
                t('Click here to delete the report.') +
                '</strong></p><p>' +
                t('Once deleted the report will not be recoverable again.') +
                '</p><p>' +
                t('Requires 2 step confirmation.') +
                '</p>',
            },
        ]
    }).start();
}
