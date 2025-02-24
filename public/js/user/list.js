import api from '../api.js';
import { t } from '../i18n.js';
import { el } from '../dom.js';
import Table from '../table.js';
import '../custom-element/user-status-badge.js';

const table = new Table({
    fetch: params => {
        const apiParams = {
            page: params.page || 1,
            fields: 'userName,firstName,lastName,status',
        };

        return api.getUsers(apiParams).then(res => res.data);
    },
    columns: [
        {
            name: t('Name'),
            render: user => {
                const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();
                const text = name ? `${name} (${user.userName})` : user.userName;
                const a = el('a', { href: `users/${user._id}` }, text);
                return a;
            },
        },
        {
            render: user => {
                const badge = el('a', { is: 'app-user-status-badge', 'user-id': user._id, 'user-status': user.status });
                const editButton = el('a.btn.btn-silver',
                    {
                        title: t('Edit this user'),
                        href: `users/${user._id}/edit`,
                    },
                    el('i.fa.fa-pencil'),
                );
                const deleteButton = el('a.btn.btn-danger',
                    {
                        title: t('Delete this user'),
                        href: `users/${user._id}/delete`,
                    },
                    el('i.fa.fa-trash-o')
                );
                const buttonGroup = el('div.btn-group.btn-group-sm', editButton, deleteButton);

                return el('div', { style: 'text-align: right' }, badge, ' ', buttonGroup);
            },
        }
    ],
});

table.render(document.getElementById('user-list-table-wrapper'));
