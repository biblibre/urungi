/* global ClipboardJS: false */
import { t } from '../i18n.esm.js';
import { escapeHtml } from '../dom.esm.js';
import Modal from './modal.js';

export default class ShareModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Share to...')) }</h3>
                </div>

                <div class="modal-body">
                    <h4>${ escapeHtml(t('Everyone')) }</h4>
                    <p class="help-block">${ escapeHtml(t('Anyone who has the link will be able to see it')) }</p>

                    <div class="checkbox">
                        <label>
                            <input type="checkbox" value="1" name="isPublic">
                            ${ escapeHtml(t('Public')) }
                        </label>
                    </div>

                    <div class="form-group">
                      <label>${ escapeHtml(t('Public URL')) }</label>

                      <div class="input-group">
                        <input id="copy-link-${ this.args.item._id }" class="form-control" type="text" readonly value="${ escapeHtml(this.args.url) }">
                        <span class="input-group-btn">
                            <button type="button" class="btn btn-default" ngclipboard ngclipboard-success="vm.onCopySuccess(e)" data-clipboard-target="#copy-link-${ this.args.item._id }">
                                <i class="fa fa-clipboard"></i>
                            </button>
                        </span>
                      </div>
                    </div>

                    <h4>${ escapeHtml(t('Authenticated users')) }</h4>

                    <p class="help-block">${ escapeHtml(t('Authenticated users will be able to see it in the shared space')) }</p>

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

        const copyButton = dialog.querySelector('[data-clipboard-target]');
        const clipboard = new ClipboardJS(copyButton);
        clipboard.on('success', e => {
            e.clearSelection();
            $(e.trigger).tooltip({ title: t('Copied'), trigger: 'manual' })
                .on('shown.bs.tooltip', function () {
                    setTimeout(() => {
                        $(this).tooltip('destroy');
                    }, 1000);
                })
                .tooltip('show');
        });

        const form = dialog.querySelector('form');

        form.elements.isPublic.checked = args.item.isPublic;

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();

            const isPublic = form.elements.isPublic.checked;
            const selected = sharedSpace.jstree(true).get_selected();
            const folderId = selected[0] ?? '';
            dialog.close(JSON.stringify({ folderId, isPublic }));
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
