import { t, expand } from '../i18n.esm.js';
import { escapeHtml } from '../dom.esm.js';

import Modal from './modal.js';

export default class DuplicateModal extends Modal {
    get content() {
        const name = this.args.name;
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal">&times;</button>
                    <h3 class="modal-title">${ escapeHtml(expand(t("Duplicate '{{name}}' ?"), { name })) }</h3>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="duplicate-modal-new-name">${ escapeHtml(t('Choose a new name for the copy :')) }</label>
                        <input id="duplicate-modal-new-name" type="text" class="form-control" name="new-name" required value="${ escapeHtml(expand(t('Copy of {{name}}'), { name })) }" autofocus>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                    <button class="btn btn-info">${ escapeHtml(t('Duplicate')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const dialog = this.dialog;
        const args = this.args;
        dialog.querySelector('form').addEventListener('submit', function (ev) {
            ev.preventDefault();
            const newName = this.elements['new-name'].value;
            args.duplicate(newName).then(() => {
                dialog.close('1');
            });
        });
    }
}
