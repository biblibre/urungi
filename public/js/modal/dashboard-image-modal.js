import { t } from '../i18n.js';
import { el, escapeHtml } from '../dom.js';
import api from '../api.js';
import Modal from './modal.js';
import * as notify from '../notify.js';

export default class DashboardImageModal extends Modal {
    get content() {
        return `
            <form method="dialog">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Select an image')) }</h3>
                </div>

                <div class="modal-body">
                    <ul class="nav nav-tabs nav-tabs-justified" role="tablist">
                        <li role="presentation" class="active"><a href="#dashboard-image-modal-my-images" aria-controls="dashboard-image-modal-my-images" role="tab" data-toggle="tab">${ escapeHtml(t('My Images')) }</a></li>
                        <li role="presentation"><a href="#dashboard-image-modal-public-images" aria-controls="dashboard-image-modal-public-images" role="tab" data-toggle="tab">${ escapeHtml(t('Public Images')) }</a></li>
                        <li role="presentation"><a href="#dashboard-image-modal-iconset" aria-controls="dashboard-image-modal-iconset" role="tab" data-toggle="tab">${ escapeHtml(t('Icon set')) }</a></li>
                        <li role="presentation"><a href="#dashboard-image-modal-image-url" aria-controls="dashboard-image-modal-image-url" role="tab" data-toggle="tab">${ escapeHtml(t('Image URL')) }</a></li>
                    </ul>

                    <div class="tab-content">
                        <div role="tabpanel" class="tab-pane active" id="dashboard-image-modal-my-images">
                            <ul class="files-modal-list"></ul>

                            <label for="dashboard-image-modal-file-upload">${ escapeHtml(t('Choose image to upload')) }</label>
                            <input type="file" id="dashboard-image-modal-file-upload" name="file">
                            <div class="notify-messages"></div>
                        </div>

                        <div role="tabpanel" class="tab-pane" id="dashboard-image-modal-public-images">
                            <ul class="files-modal-list">
                                <li ng-repeat="file in vm.catalogImages">
                                    <a class="hand-cursor file-selection" ng-click="vm.onFileSelected(file)">
                                        <img ng-src="{{ file.url }}" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div role="tabpanel" class="tab-pane" id="dashboard-image-modal-iconset">
                            <ul class="files-modal-list">
                                <li ng-repeat="file in vm.catalogIcons">
                                    <a class="hand-cursor file-selection" ng-click="vm.onFileSelected(file)">
                                        <img ng-src="{{ file.url }}" />
                                    </a>
                                </li>
                            </ul>
                        </div>

                        <div role="tabpanel" class="tab-pane" id="dashboard-image-modal-image-url">
                            <div class="form-group">
                                <label>${ escapeHtml(t('URL')) }</label>
                                <input type="text" class="form-control" name="url" placeholder="Image URL" size="40">
                            </div>
                            <button type="submit" class="btn btn-primary">${ escapeHtml(t('Submit')) }</button>
                        </div>
                    </div>
                </div>

                <div class="modal-footer">
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const dialog = this.dialog;

        const form = dialog.querySelector('form');

        this.loadFiles();

        const publicImagesUl = el('ul.files-modal-list');

        for (let i = 1; i < 100; ++i) {
            const idx = Number(i).toString().padStart(2, '0');

            const file = {
                url: `resources/images/tumbnails100/JPEG/photo-${idx}_1.jpg`,
                source1400: `resources/images/width1400/JPEG/photo-${idx}_1.jpg`,
                source700: `resources/images/width700/JPEG/photo-${idx}_1.jpg`,
            };
            const img = el('img', { src: file.url });

            const link = el('a.hand-cursor.file-selection', img);
            link.addEventListener('click', () => {
                dialog.close(JSON.stringify(file));
            });

            const li = el('li', link);
            publicImagesUl.append(li);
        }
        dialog.querySelector('#dashboard-image-modal-public-images').replaceChildren(publicImagesUl);

        const iconsUl = el('ul.files-modal-list');
        for (let i = 1; i < 55; ++i) {
            const idx = Number(i).toString().padStart(2, '0');

            const url = `resources/images/icons/icon-${idx}.png`
            const img = el('img', { src: url });

            const link = el('a.hand-cursor.file-selection', img);
            link.addEventListener('click', () => {
                dialog.close(JSON.stringify({ url }));
            });

            const li = el('li', link);
            iconsUl.append(li);
        }
        dialog.querySelector('#dashboard-image-modal-iconset').replaceChildren(iconsUl);

        form.elements.file.addEventListener('change', ev => {
            const messagesBox = dialog.querySelector('.notify-messages');
            const files = ev.target.files;
            if (files.length > 0) {
                const file = files[0];
                if (!file.type.startsWith('image/')) {
                    notify.error(t('You may only upload images'), { appendTo: messagesBox });
                    return;
                }

                api.uploadFile(file).then(({ data }) => {
                    this.loadFiles();
                }, err => {
                    notify.error(t('Image upload failed') + ' : ' + err.message, { appendTo: messagesBox });
                });
            }
        })

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            const file = { url: form.elements.url.value };
            dialog.close(JSON.stringify(file));
        });
    }

    loadFiles () {
        const myImagesUl = this.dialog.querySelector('#dashboard-image-modal-my-images ul');
        api.getFiles().then(({data}) => {
            myImagesUl.replaceChildren();
            const files = data.files;
            for (const file of files) {
                const img = el('img', { src: file.url });

                const link = el('a.hand-cursor.file-selection', img);
                link.addEventListener('click', () => {
                    this.dialog.close(JSON.stringify(file));
                });

                const li = el('li', link);
                myImagesUl.append(li);
            }
        });
    }
}
