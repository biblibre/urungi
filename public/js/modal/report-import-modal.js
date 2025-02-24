import { t } from '../i18n.js';
import { escapeHtml } from '../dom.js';
import Modal from './modal.js';
import ReportTable from '../report/table.js';

export default class ReportImportModal extends Modal {
    get content() {
        return `
            <div class="modal-header">
                <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                <h3 class="modal-title">${ escapeHtml(t('Choose a report to add to the dashboard')) }</h3>
            </div>

            <div class="modal-body">
                <div id="report-list-table-wrapper"></div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
            </div>
        `;
    }

    init() {
        const dialog = this.dialog;

        const table = new ReportTable({
            hideButtonsColumn: true,
            onReportClick: ev => { this.onReportClick(ev); },
        });
        const tableWrapper = dialog.querySelector('#report-list-table-wrapper');
        table.render(tableWrapper);
    }

    onReportClick (ev) {
        ev.preventDefault();
        const reportId = ev.target.getAttribute('data-report-id');
        this.dialog.close(reportId);
    }
}
