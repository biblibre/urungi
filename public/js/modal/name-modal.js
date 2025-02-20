import { t } from '../i18n.esm.js';
import { el } from '../dom.esm.js';
import Modal from './modal.js';

export class NameModal extends Modal {
    get content() {
        return el('form', { method: 'dialog' },
            el('.modal-header',
                el('button.close', { type: 'button', 'aria-hidden': 'true', 'data-dismiss': 'modal' },
                    el('i.fa.fa-close')
                ),
                el('h3.modal-title', this.args.title)
            ),
            el('.modal-body',
                el('.form-group',
                    el('label', { for: 'name-modal-name' }, t('Name') + ' ' + t('(required)')),
                    el('input#name-modal-name.form-control', { type: 'text', required: true, name: 'name', autofocus: true })
                )
            ),
            el('.modal-footer',
                el('button.btn.btn-primary', t('OK')),
                el('button.btn', { 'data-dismiss': 'modal' }, t('Cancel')),
            )
        );
    }

    init() {
        const dialog = this.dialog;
        dialog.querySelector('form').addEventListener('submit', function (ev) {
            ev.preventDefault();
            dialog.close(ev.target.elements.name.value);
        });
    }
}

export default NameModal;
