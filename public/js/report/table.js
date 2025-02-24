import api from '../api.js';
import { t, expand } from '../i18n.js';
import { el } from '../dom.js';
import DeleteModal from '../modal/delete-modal.js';
import DuplicateModal from '../modal/duplicate-modal.js';
import ShareModal from '../modal/share-modal.js';
import Table from '../table.js';

export default class ReportTable extends Table {
    constructor (options = {}) {
        super(options);

        this.sortBy ??= 'reportName';
        this.sortOrder ??= 'asc';
    }

    fetch (params) {
        const apiParams = {
            page: params.page || 1,
            populate: 'layer',
        };
        if (params.sortBy) {
            apiParams.sort = params.sortBy;
        }
        if (params.sortOrder === 'desc') {
            apiParams.sortType = '-1';
        }
        apiParams.filters = JSON.stringify(params.filters);

        return api.getReports(apiParams).then(res => {
            return { pages: res.data.pages, data: res.data.items };
        });
    }

    getColumns () {
        const columns = [
            {
                name: t('Name'),
                order: 'reportName',
                filter: 'reportName',
                width: '40%',
                render: report => {
                    const div = el('div');
                    const link = el('a', { href: `reports/view/${report._id}`, 'data-report-id': report._id }, report.reportName);
                    div.append(link);

                    const badgeList = el('.badge-list');
                    if (report.isPublic) {
                        badgeList.append(el('span.badge', t('public')), ' ');
                    }
                    if (report.parentFolder) {
                        badgeList.append(el('span.badge', t('shared')));
                    }
                    div.append(badgeList);

                    if (this.options.onReportClick) {
                        link.addEventListener('click', this.options.onReportClick);
                    }

                    return div;
                },
            },
            {
                name: t('Layer'),
                order: 'layerName',
                filter: 'layer.name',
                width: '15%',
                render: report => {
                    return report.layerName;
                },
            },
            {
                name: t('Author'),
                order: 'author',
                filter: 'author',
                width: '15%',
                render: report => {
                    return report.author;
                },
            },
            {
                name: t('Created on'),
                order: 'createdOn',
                width: '15%',
                render: report => {
                    if (report.createdOn) {
                        const dateTimeFormat = new window.Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
                        return dateTimeFormat.format(Date.parse(report.createdOn));
                    }
                    return '';
                },
            }
        ];

        if (!this.options.hideButtonsColumn) {
            columns.push({
                width: '15%',
                render: report => {
                    const shareButton = el('a.btn.btn-silver',
                        {
                            title: t('Share'),
                        },
                        el('i.fa.fa-share-alt'),
                    );
                    shareButton.addEventListener('click', () => this.onShare(report));

                    const editButton = el('a.btn.btn-silver.edit',
                        {
                            title: t('Edit this report'),
                            href: `reports/edit/${report._id}`,
                        },
                        el('i.fa.fa-pencil'),
                    );

                    const duplicateButton = el('a.btn.btn-silver.duplicate',
                        { title: t('Duplicate this report') },
                        el('i.fa.fa-copy')
                    );
                    duplicateButton.addEventListener('click', () => this.onDuplicate(report));

                    const deleteButton = el('a.btn.btn-danger.delete',
                        { title: t('Delete this report') },
                        el('i.fa.fa-trash-o')
                    );
                    deleteButton.addEventListener('click', () => this.onDelete(report));

                    const buttonGroup = el('div.btn-group.btn-group-sm',
                        shareButton,
                        editButton,
                        duplicateButton,
                        deleteButton
                    );

                    return el('div', { style: 'text-align: right' }, buttonGroup);
                },
            });
        }

        return columns;
    }

    onDelete (report) {
        const modal = new DeleteModal({
            title: expand(t('Delete {{name}}'), { name: report.reportName }),
            delete: () => {
                return api.deleteReport(report._id);
            }
        });
        modal.open().then(() => {
            this.draw();
        }, () => {});
    }

    async onShare (report) {
        const user = await api.getCurrentUser();
        const baseURI = new URL(document.baseURI);
        const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));
        const url = location.protocol + '//' + location.host + base + '/reports/view/' + report._id;
        const modal = new ShareModal({
            item: report,
            url: url,
            userObjects: await api.getUserObjects().then(res => res.data),
            isAdmin: user.isAdmin(),
        });
        modal.open().then(json => {
            const { isPublic, folderId } = JSON.parse(json);
            const isShared = !!folderId;
            return api.updateReport(report._id, { parentFolder: folderId, isPublic, isShared }).then(() => {
                this.draw();
            });
        }, () => {});
    }

    async onDuplicate (report) {
        const modal = new DuplicateModal({
            name: report.reportName,
            duplicate: function (newName) {
                return api.duplicateReport({ reportId: report._id, newName });
            },
        });
        modal.open().then(() => {
            this.draw();
        }, () => {});
    }
}

