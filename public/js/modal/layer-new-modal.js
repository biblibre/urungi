import { t } from '../i18n.esm.js';
import { escapeHtml } from '../dom.esm.js';
import api from '../api.esm.js';

import Modal from './modal.js';

export default class LayerNewModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h4 class="modal-title">${ escapeHtml(t('Layer Properties')) }</h4>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="new-layer-name" class="control-label">${ escapeHtml(t('Layer name')) }</label>
                        <input id="new-layer-name" name="name" type="text" class="form-control" required autofocus>
                    </div>

                    <div class="form-group">
                        <label class="control-label" for="new-layer-description">${ escapeHtml(t('Layer description')) }</label>
                        <textarea id="new-layer-description" name="description" class="form-control" rows="5" style="resize: vertical;"></textarea>
                    </div>

                    <div class="form-group">
                        <label class="control-label" for="new-layer-datasource">${ escapeHtml(t('Data source')) }</label>
                        <select class="form-control" id="new-layer-datasource" name="datasourceID" required>
                            <option value=""></option>
                        </select>
                    </div>

                    <div class="notify-messages"></div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn btn-white" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                    <button type="submit" class="btn btn-info">${ escapeHtml(t('Save layer')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const dialog = this.dialog;

        api.getDatasources().then(({data}) => {
            const select = dialog.querySelector('form').elements.datasourceID;
            for (const datasource of data.data) {
                select.add(new Option(datasource.name, datasource._id));
            }
        });

        dialog.querySelector('form').addEventListener('submit', function (ev) {
            ev.preventDefault();

            const layer = {
                name: this.elements.name.value,
                description: this.elements.description.value,
                datasourceID: this.elements.datasourceID.value,
                status: 'Not active',
            };

            api.createLayer(layer).then(() => {
                dialog.close('1');
            }, err => {
                const messagesContainer = this.querySelector('.notify-messages');
                window.Urungi.notify.error(err, { appendTo: messagesContainer });
            });
        });
    }
}
