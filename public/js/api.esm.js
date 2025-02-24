export default {
    getUsers,
    getCurrentUser,
    getUserObjects,
    updateUser,
    getRoles,
    getDatasources,
    getSqlQueryCollection,
    createLayer,
    getLayers,
    deleteLayer,
    getReports,
    getReport,
    createReport,
    duplicateReport,
    deleteReport,

    getDashboards,
    deleteDashboard,
    getDashboard,
    updateDashboard,
    createDashboard,
};

let getUserDataPromise;
export function getCurrentUser () {
    if (!getUserDataPromise) {
        getUserDataPromise = httpGet('/api/user').then(({ data: user }) => {
            user.isAdmin = () => {
                return user.roles.includes('ADMIN');
            };

            return user;
        });
    }

    return getUserDataPromise;
}
export function getUserObjects () {
    return httpGet('/api/user/objects');
}

export function getUsers (params) {
    const search = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
    return httpGet(`/api/users?${search}`);
}

export function updateUser (id, changes) {
    return httpPatch('/api/users/' + id, changes);
}

export function getRoles (params) {
    return httpGet('/api/roles', params);
}

export function getDatasources (params = {}) {
    return httpGet('/api/datasources', params);
}

export function createLayer (layer) {
    return httpPost('/api/layers', layer);
}

export function getLayers (params) {
    return httpGet('/api/layers', params);
}

export function deleteLayer (id) {
    return httpDelete('/api/layers/' + id);
}

export function getReports (params) {
    return httpGet('/api/reports/find-all', params);
}

export function updateReport (id, changes) {
    return httpPatch(`/api/reports/${id}`, changes);
}

export function getReport (id) {
    return httpGet('/api/reports/find-one', { id });
}

export function duplicateReport (params) {
    return getReport(params.reportId).then(({ data }) => {
        const report = data.item;
        delete report._id;
        delete report.createdOn;
        report.reportName = params.newName;

        return createReport(report);
    });
}

export function createReport (report) {
    return httpPost('/api/reports/create', report).then(data => data.item);
}

export function deleteReport (id) {
    return httpPost('/api/reports/delete/' + id, { id });
}

export function getDashboards (params) {
    return httpGet('/api/dashboards/find-all', params);
}
export function deleteDashboard (id) {
    return httpPost('/api/dashboards/delete/' + id, { id });
}
export function getDashboard (id) {
    return httpGet('/api/dashboards/find-one', { id });
}
export function createDashboard (dashboard) {
    return httpPost('/api/dashboards/create', dashboard);
}
export function updateDashboard (id, changes) {
    return httpPatch('/api/dashboards/' + id, changes);
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

export function httpDelete (path, data) {
    return httpRequest(path, {
        method: 'DELETE',
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
        const contentType = response.headers.get('Content-Type')?.trim();
        if (contentType && contentType.startsWith('application/json')) {
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
