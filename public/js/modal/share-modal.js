import { t } from '../i18n.esm.js';
import { escapeHtml } from '../dom.esm.js';
import Modal from './modal.js';

export default class ShareModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Share')) }</h3>
                </div>

                <div class="modal-body">
                    <div class="shared-space"></div>
                </div>

                <div class="modal-footer">
                    <button type="submit" class="btn btn-primary">${ escapeHtml(t('OK')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const dialog = this.dialog;
        const args = this.args;

        let data = this.buildTree(args.userObjects.items);
        if (args.isAdmin) {
            data = [
                {
                    id: 'root',
                    text: t('root folder'),
                    icon: false,
                    state: {
                        opened: true,
                        selected: args.item.parentFolder === 'root',
                    },
                    children: data,
                }
            ];
        }

        const sharedSpace = $(dialog).find('.shared-space');
        sharedSpace.jstree({
            plugins: ['checkbox'],
            core: {
                data,
                multiple: false,
                dblclick_toggle: false,
                themes: {
                    dots: false,
                },
            },
            checkbox: {
                three_state: false,
            },
        });

        dialog.querySelector('form').addEventListener('submit', function (ev) {
            ev.preventDefault();

            const selected = sharedSpace.jstree(true).get_selected();
            const folderId = selected[0] ?? '';
            dialog.close(JSON.stringify({ folderId }));
        });
    }

    buildTree (nodes) {
        const treeNodes = [];

        const folders = nodes .filter(n => !(n.nodeType === 'dashboard' || n.nodeType === 'report') && n.grants.shareReports);
        for (const folder of folders) {
            const treeNode = {
                id: folder.id,
                text: folder.title,
                icon: false,
                state: {
                    opened: true,
                    selected: folder.id === this.args.item.parentFolder,
                },
                children: this.buildTree(folder.nodes),
            }
            treeNodes.push(treeNode);
        }

        return treeNodes;
    }
}
