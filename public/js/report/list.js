import * as api from '../api.esm.js';
import { t, expand } from '../i18n.esm.js';
import { el } from '../dom.esm.js';
import DeleteModal from '../modal/delete-modal.js';
import DuplicateModal from '../modal/duplicate-modal.js';
import ShareModal from '../modal/share-modal.js';
import Table from '../table.js';

const table = new Table({
    fetch: params => {
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
    },
    columns: [
        {
            name: t('Name'),
            order: 'reportName',
            filter: 'reportName',
            width: '40%',
            render: report => {
                const div = el('div');
                div.append(el('a', { href: `reports/view/${report._id}` }, report.reportName));

                const badgeList = el('.badge-list');
                if (report.isPublic) {
                    badgeList.append(el('span.badge', t('public')), ' ');
                }
                if (report.parentFolder) {
                    badgeList.append(el('span.badge', t('shared')));
                }
                div.append(badgeList);

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
                const dateTimeFormat = new window.Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
                return dateTimeFormat.format(Date.parse(report.createdOn));
            },
        },
        {
            width: '15%',
            render: report => {
                const shareButton = el('a.btn.btn-silver',
                    {
                        title: t('Share'),
                    },
                    el('i.fa.fa-share-alt'),
                );
                shareButton.addEventListener('click', () => onShare(report));

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
                duplicateButton.addEventListener('click', () => onDuplicate(report));

                const deleteButton = el('a.btn.btn-danger.delete',
                    { title: t('Delete this report') },
                    el('i.fa.fa-trash-o')
                );
                deleteButton.addEventListener('click', () => onDelete(report));

                const buttonGroup = el('div.btn-group.btn-group-sm',
                    shareButton,
                    editButton,
                    duplicateButton,
                    deleteButton
                );

                return el('div', { style: 'text-align: right' }, buttonGroup);
            },
        }
    ],
    sortBy: 'reportName',
});

const tableWrapper = document.getElementById('report-list-table-wrapper');
table.render(tableWrapper);

function onDelete (report) {
    const modal = new DeleteModal({
        title: expand(t('Delete {{name}}'), { name: report.reportName }),
        delete: () => {
            return api.deleteReport(report._id);
        }
    });
    modal.open().then(() => {
        table.draw();
    }, () => {});
}

async function onShare (report) {
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
            table.draw();
        });
    }, () => {});
}

async function onDuplicate (report) {
    const modal = new DuplicateModal({
        name: report.reportName,
        duplicate: function (newName) {
            return api.duplicateReport({ reportId: report._id, newName });
        },
    });
    modal.open().then(() => {
        table.draw();
    }, () => {});
}

if (location.hash === '#intro') {
    showIntro();
}
document.getElementById('showIntroButton').addEventListener('click', function () {
    showIntro();
});

function showIntro() {
    window.introJs().setOptions({
        nextLabel: t('Next'),
        prevLabel: t('Back'),
        doneLabel: t('Done'),
        steps: [
            {
                title: t('Reports'),
                intro: t('Here you can create and execute reports.'),
            },
            {
                title: t('Reports'),
                intro: '<p>' +
                t('Choose a report type and drag and drop elements from the selected layer to compose your report.') +
                '</p><p>' +
                t('You can also add runtime filters to split your data in real time.') +
                '</p>',
            },
            {
                element: '#new-report-button',
                title: t('New Report'),
                intro: t('Click here to create a new report.'),
            },
            {
                element: '#report-list-table-wrapper',
                title: t('Reports list'),
                intro: '<p><strong>' +
                t('Here all your reports are listed.') +
                '</strong></p><p>' +
                t('Click over a report\'s name to execute it.') +
                '</p><p>' +
                t('You can also modify or drop the report, clicking into the modify or delete buttons.') +
                '</p>',
            },
            {
                element: '.btn.edit',
                title: t('Edit report'),
                intro: t('Click here to modify the report.'),
            },
            {
                element: '.btn.duplicate',
                title: t('Duplicate report'),
                intro: t('Click here to duplicate the report.'),
            },
            {
                element: '.btn.delete',
                title: t('Delete report'),
                intro:
                '<p><strong>' +
                t('Click here to delete the report.') +
                '</strong></p><p>' +
                t('Once deleted the report will not be recoverable again.') +
                '</p><p>' +
                t('Requires 2 step confirmation.') +
                '</p>',
            },
        ]
    }).start();
}
