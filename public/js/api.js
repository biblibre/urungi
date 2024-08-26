(function (root, factory) {
    if (typeof module === 'object' && module.exports) {
        module.exports = factory();
    } else {
        root.Urungi.api = factory();
    }
}(typeof self !== 'undefined' ? self : this, function () {
    'use strict';

    const api = {
        getDatasources,
        getDashboard,
        createDashboard,
        updateDashboard,
        getLayer,
        createLayer,
        replaceLayer,
        getReport,
        createReport,
        updateReport,
        getSharedSpace,
        setSharedSpace,

        getUsers,
        updateUser,
    };

    function getDatasources () {
        return httpGet('/api/datasources');
    }

    /**
     * Fetch an existing dashboard
     *
     * @param {string} id - ID of dashboard to fetch
     * @returns {Promise<Response>} Promise that resolves to a Response object
     */
    function getDashboard (id) {
        return httpGet('/api/dashboards/find-one?id=' + id);
    }

    function createDashboard (dashboard) {
        return httpPost('/api/dashboards/create', dashboard);
    }

    function updateDashboard (dashboard) {
        return httpPost('/api/dashboards/update/' + dashboard._id, dashboard);
    }

    /**
     * Fetch an existing layer
     *
     * @param {string} id - ID of layer to fetch
     * @returns {Promise<Response>} Promise that resolves to a Response object
     */
    function getLayer (id) {
        return httpGet('/api/layers/' + id);
    }

    function createLayer (layer) {
        return httpPost('/api/layers', layer);
    }

    function replaceLayer (layer) {
        return httpPut('/api/layers/' + layer._id, layer);
    }

    /**
     * Fetch an existing report
     *
     * @param {string} id - ID of report to fetch
     * @returns {Promise<Response>} Promise that resolves to a Response object
     */
    function getReport (id) {
        return httpGet('/api/reports/find-one?id=' + id);
    }

    function createReport (report) {
        return httpPost('/api/reports/create', report);
    }

    function updateReport (report) {
        return httpPost('/api/reports/update/' + report._id, report);
    }

    function getSharedSpace () {
        return httpGet('/api/shared-space');
    }

    function setSharedSpace (sharedSpace) {
        return httpPut('/api/shared-space', sharedSpace);
    }

    function getUsers (params) {
        const search = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        return httpGet(`/api/users?${search}`);
    }

    function updateUser (id, changes) {
        return httpPatch('/api/users/' + id, changes);
    }

    function httpGet (path) {
        return httpRequest(path, { method: 'GET' });
    }

    function httpPost (path, data) {
        return httpRequest(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
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

    function httpPatch (path, data) {
        return httpRequest(path, {
            method: 'PATCH',
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

        return fetch(url, settings).then(function (response) {
            const contentType = response.headers.get('Content-Type').trim();
            if (contentType.startsWith('application/json')) {
                return response.json().then(function (data) {
                    if ('error' in data) {
                        throw new Error(data.error);
                    }
                    if ('result' in data && !data.result) {
                        throw new Error(data.msg);
                    }
                    return { response, data };
                });
            }
            return { response };
        });
    }

    return api;
}));
