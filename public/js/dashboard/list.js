import api from '../api.js';
import { t, expand } from '../i18n.js';
import { el } from '../dom.js';
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

        return api.getDashboards(apiParams).then(res => {
            return { pages: res.data.pages, data: res.data.items };
        });
    },
    columns: [
        {
            name: t('Name'),
            order: 'dashboardName',
            filter: 'dashboardName',
            width: '40%',
            render: dashboard => {
                const div = el('div');
                div.append(el('a', { href: `dashboards/view/${dashboard._id}` }, dashboard.dashboardName));

                const badgeList = el('.badge-list');
                if (dashboard.isPublic) {
                    badgeList.append(el('span.badge', t('public')), ' ');
                }
                if (dashboard.parentFolder) {
                    badgeList.append(el('span.badge', t('shared')));
                }
                div.append(badgeList);

                return div;
            },
        },
        {
            name: t('Author'),
            order: 'author',
            filter: 'author',
            width: '15%',
            render: dashboard => {
                return dashboard.author;
            },
        },
        {
            name: t('Created on'),
            order: 'createdOn',
            width: '15%',
            render: dashboard => {
                const dateTimeFormat = new window.Intl.DateTimeFormat(undefined, { dateStyle: 'medium' });
                return dateTimeFormat.format(Date.parse(dashboard.createdOn));
            },
        },
        {
            width: '15%',
            render: dashboard => {
                const shareButton = el('a.btn.btn-silver',
                    {
                        title: t('Share'),
                    },
                    el('i.fa.fa-share-alt'),
                );
                shareButton.addEventListener('click', () => onShare(dashboard));

                const editButton = el('a.btn.btn-silver.edit',
                    {
                        title: t('Edit this dashboard'),
                        href: `dashboards/edit/${dashboard._id}`,
                    },
                    el('i.fa.fa-pencil'),
                );

                const duplicateButton = el('a.btn.btn-silver.duplicate',
                    { title: t('Duplicate this dashboard') },
                    el('i.fa.fa-copy')
                );
                duplicateButton.addEventListener('click', () => onDuplicate(dashboard));

                const deleteButton = el('a.btn.btn-danger.delete',
                    { title: t('Delete this dashboard') },
                    el('i.fa.fa-trash-o')
                );
                deleteButton.addEventListener('click', () => onDelete(dashboard));

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
    sortBy: 'dashboardName',
});

const tableWrapper = document.getElementById('dashboard-list-table-wrapper');
table.render(tableWrapper);

function onDelete (dashboard) {
    const modal = new DeleteModal({
        title: expand(t('Delete {{name}}'), { name: dashboard.dashboardName }),
        delete: () => {
            return api.deleteDashboard(dashboard._id);
        }
    });
    modal.open().then(() => {
        table.draw();
    }, () => {});
}

async function onShare (dashboard) {
    const user = await api.getCurrentUser();
    const baseURI = new URL(document.baseURI);
    const base = baseURI.pathname.substring(0, baseURI.pathname.lastIndexOf('/'));
    const url = location.protocol + '//' + location.host + base + '/dashboards/view/' + dashboard._id;
    const modal = new ShareModal({
        item: dashboard,
        url: url,
        userObjects: await api.getUserObjects().then(res => res.data),
        isAdmin: user.isAdmin(),
    });
    modal.open().then(json => {
        const { isPublic, folderId } = JSON.parse(json);
        const isShared = !!folderId;
        return api.updateDashboard(dashboard._id, { parentFolder: folderId, isPublic, isShared }).then(() => {
            table.draw();
        });
    }, () => {});
}

async function onDuplicate (dashboard) {
    const modal = new DuplicateModal({
        name: dashboard.dashboardName,
        duplicate: function (newName) {
            return api.getDashboard(dashboard._id).then(res => {
                const dashboard = res.data.item;
                delete dashboard._id;
                delete dashboard.createdOn;
                dashboard.dashboardName = newName;

                return api.createDashboard(dashboard);
            });
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
                title: t('Dashboards'),
                intro: '<p><strong>' +
                t('In here you can create and execute dashboards like web pages.') +
                '</strong></p><p>' +
                t('Define several reports using filters and dragging and dropping from different layers.') +
                '</p><p>' +
                t('After you define the reports to get and visualize your data, you can drag and drop different html layout elements, and put your report in, using different formats to show it.') +
                '</p>',
            },
            {
                element: '#new-dashboard-button',
                title: t('New Dashboard'),
                intro: t('Click here to create a new dashboard.'),
            },
            {
                element: '#dashboard-list-table-wrapper',
                title: t('Dashboards list'),
                intro: '<p><strong>' +
                t('Here all your dashboards are listed.') +
                '</strong></p><p>' +
                t('Click over a dashboard\'s name to execute it.') +
                '</p><p>' +
                t('You can also modify or drop the dashboard, clicking into the modify or delete buttons.') +
                '</p>',
            },
            {
                element: '.edit',
                title: t('Dashboard edit'),
                intro: t('Click here to modify the dashboard.'),
            },
            {
                element: '.delete',
                title: t('Dashboard delete'),
                intro: '<p><strong>' +
                t('Click here to delete the dashboard.') +
                '</strong></p><p>' +
                t('Once deleted the dashboard will not be recoverable again.') +
                '</p><p>' +
                t('Requires 2 step confirmation.') +
                '</p>',
            },
        ]
    }).start();
}
