import { expand, t } from '../i18n.js';
import { escapeHtml } from '../dom.js';

import Modal from './modal.js';

export default class LayerEditAddAllModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Add all collection elements to the layer')) }</h3>
                </div>

                <div class="modal-body">
                    <span>${ expand(escapeHtml(t('Please confirm that you want to add to the layer all elements of the collection {{name}}')), { name: `<strong>${ escapeHtml(this.args.collection.collectionName) }</strong>` }) }</span>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary" value="confirm">${ escapeHtml(t('Confirm')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    init() {
    }
}
