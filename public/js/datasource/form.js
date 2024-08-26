/* global Urungi: false */
(function () {
    'use strict';

    const { api, t, dom: { el } } = Urungi;
    document.addEventListener('DOMContentLoaded', function () {
        const form = document.getElementById('datasource-form');
        document.getElementById('test-connection-button').addEventListener('click', event => {
            const isValid = form.reportValidity();
            if (isValid) {
                event.target.setAttribute('disabled', true);

                const datasource = {
                    type: form.elements.type.value,
                    name: form.elements.name.value,
                    connection: {
                        host: form.elements['connection[host]'].value,
                        port: form.elements['connection[port]'].value,
                        database: form.elements['connection[database]'].value,
                        userName: form.elements['connection[userName]'].value,
                        password: form.elements['connection[password]'].value,
                        search_path: form.elements['connection[search_path]'].value,
                    },
                };

                const result = document.getElementById('test-connection-result');
                api.testConnection(datasource).then(({ response }) => {
                    result.replaceChildren(el('div.alert.alert-success', t('Successful database connection')));
                }, err => {
                    result.replaceChildren(el('div.alert.alert-danger', t('Database connection failed.') + ' ' + err));
                }).finally(() => {
                    event.target.removeAttribute('disabled');
                });
            }
        });
    });
})();
