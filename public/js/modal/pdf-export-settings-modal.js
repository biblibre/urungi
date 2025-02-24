import { t } from '../i18n.js';
import { escapeHtml } from '../dom.js';
import Modal from './modal.js';

export class PdfExportSettingsModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Settings for PDF export')) }</h3>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <div class="checkbox">
                            <label>
                                <input type="checkbox" name="displayHeaderFooter">
                                <span>${ escapeHtml(t('Add header and footer')) }</span>
                            </label>
                        </div>
                    </div>

                    <div class="header-and-footer-group">
                        <div class="form-group">
                            <label>${ escapeHtml(t('Header template')) }</label>
                            <textarea rows="3" class="form-control code" name="headerTemplate"></textarea>
                            <div class="help-block">
                                ${ escapeHtml(t('HTML template for the print header. The default is to show the date on the right.')) }
                            </div>

                            <label>${ escapeHtml(t('Footer template')) }</label>
                            <textarea rows="3" class="form-control code" name="footerTemplate"></textarea>
                            <div class="help-block">
                                ${ escapeHtml(t('HTML template for the print footer. The default is to show the page number and the total number of pages on the right.')) }
                            </div>

                            <div class="help-block">
                                <span>
                                    ${ escapeHtml(t('Header and footer templates should be valid HTML markup with following classes used to inject printing values into them:')) }
                                </span>
                                <ul>
                                    <li><code>date</code> <span>${ escapeHtml(t('formatted print date')) }</span></li>
                                    <li><code>title</code> <span>${ escapeHtml(t('document title')) }</span></li>
                                    <li><code>url</code> <span>${ escapeHtml(t('document location')) }</span></li>
                                    <li><code>pageNumber</code> <span>${ escapeHtml(t('current page number')) }</span></li>
                                    <li><code>totalPages</code> <span>${ escapeHtml(t('total pages in the document')) }</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary">${ escapeHtml(t('Confirm')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const dialog = this.dialog;
        const form = dialog.querySelector('form');

        form.elements.displayHeaderFooter.addEventListener('change', ev => {
            if (ev.target.checked) {
                form.querySelector('.header-and-footer-group').classList.remove('hidden');
            } else {
                form.querySelector('.header-and-footer-group').classList.add('hidden');
            }
        });
        form.elements.displayHeaderFooter.dispatchEvent(new Event('change'));

        form.elements.headerTemplate.value = '<div style="font-size: 10px; width: 100%; padding: 0 12px;"><span style="float: right" class="date"></span></div>';
        form.elements.footerTemplate.value = '<div style="font-size: 10px; width: 100%; padding: 0 12px;"><span style="float: right;"><span class="pageNumber"></span> / <span class="totalPages"></span></span></div>';

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();

            const settings = Object.fromEntries(new FormData(form));
            settings.displayHeaderFooter = form.elements.displayHeaderFooter.checked;
            dialog.close(JSON.stringify(settings));
        });
    }
}
