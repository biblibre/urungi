export default {
    getDatasources,
    getSqlQueryCollection,
    createLayer,
};

export function getDatasources () {
    return httpGet('/api/datasources');
}

export function createLayer (layer) {
    return httpPost('/api/layers', layer);
}

export function getSqlQueryCollection (datasourceId, collection) {
    const { sqlQuery, collectionName } = collection;
    return httpGet('/api/datasources/' + datasourceId + '/sql-query-collection', { sqlQuery, collectionName });
}

export function httpGet (path, data) {
    if (data) {
        const search = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('&');
        path += `?${search}`;
    }
    return httpRequest(path, { method: 'GET' });
}

export function httpPost (path, data) {
    return httpRequest(path, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export function httpPut (path, data) {
    return httpRequest(path, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    });
}

export function httpPatch (path, data) {
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

export function httpRequest (path, settings = {}) {
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
