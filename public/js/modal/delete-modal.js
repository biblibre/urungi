import { t } from '../i18n.js';
import { el, escapeHtml } from '../dom.js';
import Modal from './modal.js';

export default class DeleteModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${escapeHtml(this.args.title)}</h3>
                </div>

                <div class="modal-body">
                    <div class="alert alert-warning">${ escapeHtml(t('Warning: deletion is definitive and cannot be undone.')) }</div>

                    <div class="messages"></div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                    <button class="btn btn-danger">${ escapeHtml(t('Delete')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const dialog = this.dialog;
        const args = this.args;
        dialog.querySelector('form').addEventListener('submit', function (ev) {
            ev.preventDefault();
            args.delete().then(() => {
                dialog.close('deleted');
            }).catch(err => {
                const msg = el('.alert.alert-danger', { role: 'alert' }, err);
                dialog.querySelector('.messages').replaceChildren(msg);
            });
        });
    }
}
