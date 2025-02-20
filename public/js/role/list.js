import api from '../api.esm.js';
import { t } from '../i18n.esm.js';
import { el } from '../dom.esm.js';
import Table from '../table.js';

const table = new Table({
    fetch: params => {
        const apiParams = {
            page: params.page || 1,
            fields: 'name,description',
        }
        return api.getRoles(apiParams).then(res => res.data);
    },
    columns: [
        {
            name: t('Name'),
            render: role => {
                return el('a', { href: `roles/${role._id}/edit` }, role.name);
            },
        },
        {
            name: t('Description'),
            render: role => {
                return el('span', role.description);
            },
        },
        {
            render: role => {
                const deleteButton = el('a.btn.btn-danger',
                    {
                        title: t('Delete this role'),
                        href: `roles/${role._id}/delete`,
                    },
                    el('i.fa.fa-trash-o')
                );
                const buttonGroup = el('div.btn-group.btn-group-sm', deleteButton);

                return el('div', { style: 'text-align: right' }, buttonGroup);
            },
        }
    ],
});

table.render(document.getElementById('role-list-table-wrapper'));
