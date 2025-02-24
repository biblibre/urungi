import { el, escapeHtml } from '../dom.js';
import { t } from '../i18n.js';
import api from '../api.js';
import { newID } from '../layerUtils.js';

import Modal from './modal.js';

export default class DeleteModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Add new SQL')) }</h3>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label class="control-label" for="layer-edit-sql-collection-name">${ escapeHtml(t('Type a name for this dataset')) } ${ escapeHtml(t('(required)')) }</label>
                        <input type="text" class="form-control" id="layer-edit-sql-collection-name" name="collectionName" placeholder="${ t('Type a name for this dataset') }" required>
                    </div>

                    <div class="form-group">
                        <label class="control-label" for="layer-edit-sql-sql-query">${ escapeHtml(t('SQL query')) } ${ escapeHtml(t('(required)')) }</label>
                        <textarea class="form-control" id="layer-edit-sql-sql-query" name="sqlQuery" required></textarea>
                    </div>

                    <div class="messages"></div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary">${ escapeHtml(t('Save')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const { dialog, args } = this;

        const form = dialog.querySelector('form');
        form.addEventListener('submit', ev => { this.onSubmit(ev); });

        // Populate form
        if (args.collection) {
            for (const el of form.elements) {
                if (el.name && Object.hasOwn(args.collection, el.name)) {
                    el.value = args.collection[el.name]
                }
                el.dispatchEvent(new Event('change'));
            }
        }
    }

    onSubmit (ev) {
        ev.preventDefault();

        const { dialog, args } = this;

        const form = dialog.querySelector('form');
        const formData = Object.fromEntries(new FormData(form));
        const { sqlQuery, collectionName } = formData;
        api.getSqlQueryCollection(args.layer.datasourceID, { sqlQuery, collectionName }).then(res => {
            const collection = res.data;
            if (args.collection) {
                collection.collectionID = args.collection.collectionID;

                for (const element of collection.elements) {
                    element.collectionID = args.collection.collectionID;
                    element.collectionName = args.collection.collectionName;

                    const elementInCurrentCollection = args.collection.elements.find(e => e.elementName === element.elementName);
                    if (elementInCurrentCollection) {
                        element.elementID = elementInCurrentCollection.elementID;
                        element.elementRole = elementInCurrentCollection.elementRole;
                        element.elementLabel = elementInCurrentCollection.elementLabel;
                    } else {
                        element.elementID = newID(args.layer);
                    }
                }

                if (!formData.confirm) {
                    const lostElements = [];
                    for (const element of args.collection.elements) {
                        if (!collection.elements.some(e => e.elementName === element.elementName)) {
                            lostElements.push(element);
                        }
                    }

                    if (lostElements.length > 0) {
                        const msg = el('.alert.alert-danger', { role: 'alert' }, t('The following columns will be removed :'));
                        const ul = el('ul');
                        for (const element of lostElements) {
                            ul.append(el('li', element.elementName));
                        }
                        const checkbox = el('label',
                            el('input', { type: 'checkbox', name: 'confirm' }),
                            ' ',
                            t('Confirm')
                        );
                        msg.append(ul, checkbox);
                        dialog.querySelector('.messages').replaceChildren(msg);

                        return;
                    }
                }
            } else {
                collection.collectionID = 'C' + newID(args.layer);

                for (const element of collection.elements) {
                    element.elementID = newID(args.layer);
                    element.collectionID = collection.collectionID;
                    element.collectionName = collection.collectionName;
                }
            }

            dialog.close(JSON.stringify(collection));
        }, err => {
            const msg = el('.alert.alert-danger', { role: 'alert' }, err);
            dialog.querySelector('.messages').replaceChildren(msg);
        });
    }
}
