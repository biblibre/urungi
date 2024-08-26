/* global Urungi: false */
(function () {
    'use strict';

    const { api, t, dom: { el } } = Urungi;
    document.addEventListener('DOMContentLoaded', function () {
        const table = new Urungi.Table({
            fetch: params => {
                params.page ||= 1;
                params.fields = 'userName,firstName,lastName,status';
                return api.getUsers(params).then(res => res.data);
            },
            columns: [
                {
                    name: t('Name'),
                    render: user => {
                        const a = el('a', { href: `users/${user._id}` },
                            `${user.firstName} ${user.lastName} (${user.userName})`);
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
    });
})();
