(function () {
    'use strict';

    const { t, dom: { el } } = window.Urungi;

    class ImportTableElement extends HTMLTableElement {
        constructor () {
            super();
            this.classList.add('table', 'table-condensed');
            this.createTHead().insertRow().append(el('th', t('Name')), el('th', t('Status')));
            this.createTBody();
        }

        addRow (name, status) {
            this.tBodies[0].insertRow().append(el('td', name), el('td', status));
        }

        add (name, doc) {
            if (doc.$errors.length > 0) {
                const status = el('span', { class: 'text-danger' }, doc.$errors.join(', '));
                this.addRow(name, status);
            } else if (doc.$exists) {
                const status = el('label.text-info',
                    t('Already exists. Overwrite ?'),
                    ' ',
                    el('input', { type: 'checkbox', name: 'overwrite[' + doc._id + ']' })
                );
                this.addRow(name, status);
            } else {
                const status = el('span', { class: 'text-success' }, t('OK'));
                this.addRow(name, status);
            }
        }
    }

    window.ImportTableElement = ImportTableElement;
    window.customElements.define('app-import-table', ImportTableElement, { extends: 'table' });
})();
