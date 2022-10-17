(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.api = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const api = {
        getSharedSpace,
        setSharedSpace,
    };

    function getSharedSpace () {
        return httpGet('/api/shared-space');
    }

    function setSharedSpace (sharedSpace) {
        return httpPut('/api/shared-space', sharedSpace);
    }

    function httpGet (path) {
        return httpRequest(path, { method: 'GET' });
    }

    function httpPut (path, data) {
        return httpRequest(path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    const xsrfCookie = document.cookie
        .split('; ')
        .find(row => row.startsWith('XSRF-TOKEN='));
    const xsrf = xsrfCookie ? xsrfCookie.split('=')[1] : null;
    const defaultHeaders = {
        'X-XSRF-TOKEN': xsrf,
    };

    function httpRequest (path, settings = {}) {
        const headers = Object.assign({}, defaultHeaders, settings.headers);
        settings = Object.assign({}, settings, { headers });

        const relativePath = path.startsWith('/') ? path.substring(1) : path;
        const url = new URL(relativePath, document.baseURI);

        return fetch(url, settings);
    }

    return api;
}));
