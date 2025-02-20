import api from '../api.esm.js';
import { t, expand } from '../i18n.esm.js';
import { el } from '../dom.esm.js';
import DeleteModal from '../modal/delete-modal.js';
import LayerNewModal from '../modal/layer-new-modal.js';
import Table from '../table.js';
import '../custom-element/layer-status-badge.js';

const table = new Table({
    fetch: params => {
        const apiParams = {
            page: params.page || 1,
            fields: 'name,status',
        };
        if (params.sort) {
            apiParams.sort = params.sort;
        }
        const filters = {};
        for (const name in params.filters) {
            if (params.filters[name].trim() !== '') {
                filters[name] = { contains: params.filters[name] };
            }
        }
        apiParams.filters = JSON.stringify(filters);

        return api.getLayers(apiParams).then(res => res.data);
    },
    columns: [
        {
            name: t('Name'),
            order: 'name',
            filter: 'name',
            width: '40%',
            render: layer => {
                const a = el('a', { href: `layers/${layer._id}` }, layer.name);
                return a;
            },
        },
        {
            name: t('Status'),
            order: 'status',
            width: '30%',
            render: layer => {
                return el('a', { is: 'app-layer-status-badge', 'layer-id': layer._id, 'layer-status': layer.status });
            },
        },
        {
            width: '30%',
            render: layer => {
                const editButton = el('a.btn.btn-silver',
                    {
                        title: t('Edit this layer'),
                        href: `layers/${layer._id}`,
                    },
                    el('i.fa.fa-pencil'),
                );
                const deleteButton = el('a.btn.btn-danger',
                    {
                        title: t('Delete this layer'),
                        'data-layer-id': layer._id,
                        'data-layer-name': layer.name,
                        'data-action': 'delete',
                    },
                    el('i.fa.fa-trash-o')
                );
                const buttonGroup = el('div.btn-group.btn-group-sm', editButton, deleteButton);

                return el('div', { style: 'text-align: right' }, buttonGroup);
            },
        }
    ],
});

const tableWrapper = document.getElementById('layer-list-table-wrapper');
table.render(tableWrapper);

tableWrapper.addEventListener('click', ev => {
    const deleteButton = ev.target.closest('[data-action="delete"]');
    if (deleteButton) {
        const layerId = deleteButton.getAttribute('data-layer-id');
        const layerName = deleteButton.getAttribute('data-layer-name');
        const modal = new DeleteModal({
            title: expand(t('Delete {{name}}'), { name: layerName }),
            delete: () => {
                return api.deleteLayer(layerId);
            }
        });
        modal.open().then(() => table.draw(), () => {});
    }
});

document.getElementById('layer-new-button').addEventListener('click', ev => {
    const modal = new LayerNewModal();
    modal.open().then(() => table.draw(), () => {});
})

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
                title: t('Layers'),
                intro: '<p>' +
                    t('Layers define the interface for your users to access the data.') +
                    '</p><p>' +
                    t('Layers allow your users to create reports dragging and dropping familiar elements that points in the background to the fields contained in tables in your data sources.') +
                    '</p><p>' +
                    t('Here you can create and manage the layers that later will be used by your users to create reports or explore data.') +
                    '</p><p>' +
                    t('You can create several layers depending on your necessities, but you have to define one at least.') +
                    '</p>',
            },
            {
                element: '#layer-new-button',
                title: t('New Layer'),
                intro: '<p>' +
                    t('Click here to create a new layer.') +
                    '</p>',
            },
            {
                element: '#layer-list-table-wrapper table',
                title: t('Layers list'),
                intro: '<p>' +
                    t('Here all the layers are listed.') +
                    '</p><p>' +
                    t('You can edit the layer to configure the tables, elements and joins between tables.') +
                    '</p><p>' +
                    t('You can also activate or deactivate layers.') +
                    '</p>',
            },
            {
                element: '#layer-list-table-wrapper table .badge',
                title: t('Layer status'),
                intro: '<p>' +
                    t('The status of the layer defines if the layer is visible or not for your users when creating or editing a report or exploring data.') +
                    '</p><p>' +
                    t('You can change the status of the layer simply clicking over this label') +
                    '</p>',
            },
            {
                element: '#layer-list-table-wrapper table .btn-danger',
                title: t('Layer delete'),
                intro: '<p>' +
                    t('Click here to delete the layer.') +
                    '</p><p>' +
                    t('Once deleted the layer will not be recoverable again.') +
                    '</p><p>' +
                    t('Requires 2 step confirmation.') +
                    '</p>',
            },
            {
                title: t('Next Step'),
                intro: '<p>' +
                    t('Design your company public space') +
                    '</p><p>' +
                    t('The public space is the place where your users can publish reports to be shared across the company, in this place you will define the folder strucuture for the company&quot;s public space') +
                    '</p><a href="shared-space#intro">' +
                    t('Go to the public space definition and continue tour') +
                    '</a>',
            }
        ]
    }).start();
}
