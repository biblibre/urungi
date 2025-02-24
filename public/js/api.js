export default class Api {
    static getUserDataPromise;
    static defaultHeaders;

    static {
        const xsrfCookie = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='));
        const xsrf = xsrfCookie ? xsrfCookie.split('=')[1] : null;
        this.defaultHeaders = {
            'X-XSRF-TOKEN': xsrf,
        };
    }

    static getSharedSpace () {
        return this.httpGet('/api/shared-space');
    }

    static setSharedSpace (sharedSpace) {
        return this.httpPut('/api/shared-space', sharedSpace);
    }

    static getCurrentUser () {
        if (!Api.getUserDataPromise) {
            Api.getUserDataPromise = this.httpGet('/api/user').then(({ data: user }) => {
                user.isAdmin = () => {
                    return user.roles.includes('ADMIN');
                };

                return user;
            });
        }

        return Api.getUserDataPromise;
    }
    static getUserObjects () {
        return this.httpGet('/api/user/objects');
    }

    static getUsers (params) {
        const search = Object.entries(params).map(([k, v]) => `${k}=${v}`).join('&');
        return this.httpGet(`/api/users?${search}`);
    }

    static updateUser (id, changes) {
        return this.httpPatch('/api/users/' + id, changes);
    }

    static getRoles (params) {
        return this.httpGet('/api/roles', params);
    }

    static getDatasources (params = {}) {
        return this.httpGet('/api/datasources', params);
    }

    static createLayer (layer) {
        return this.httpPost('/api/layers', layer);
    }

    static getLayers (params) {
        return this.httpGet('/api/layers', params);
    }

    static getLayer (id) {
        return this.httpGet('/api/layers/' + id);
    }

    static deleteLayer (id) {
        return this.httpDelete('/api/layers/' + id);
    }

    static replaceLayer (layer) {
        return this.httpPut('/api/layers/' + layer._id, layer);
    }

    static updateLayer (id, changes) {
        return this.httpPatch(`/api/layers/${id}`, changes);
    }

    static getReports (params) {
        return this.httpGet('/api/reports/find-all', params);
    }

    static updateReport (id, changes) {
        return this.httpPatch(`/api/reports/${id}`, changes);
    }

    static replaceReport (report) {
        return this.httpPut('/api/reports/' + report._id, report);
    }

    static getReport (id) {
        return this.httpGet('/api/reports/find-one', { id });
    }

    static duplicateReport (params) {
        return this.getReport(params.reportId).then(({ data }) => {
            const report = data.item;
            delete report._id;
            delete report.createdOn;
            report.reportName = params.newName;

            return this.createReport(report);
        });
    }

    static createReport (report) {
        return this.httpPost('/api/reports/create', report).then(data => data.item);
    }

    static deleteReport (id) {
        return this.httpPost('/api/reports/delete/' + id, { id });
    }

    static getDashboards (params) {
        return this.httpGet('/api/dashboards/find-all', params);
    }
    static deleteDashboard (id) {
        return this.httpPost('/api/dashboards/delete/' + id, { id });
    }
    static getDashboard (id) {
        return this.httpGet('/api/dashboards/find-one', { id });
    }
    static createDashboard (dashboard) {
        return this.httpPost('/api/dashboards/create', dashboard);
    }
    static updateDashboard (id, changes) {
        return this.httpPatch('/api/dashboards/' + id, changes);
    }
    static replaceDashboard (dashboard) {
        return this.httpPut('/api/dashboards/' + dashboard._id, dashboard);
    }

    static getSqlQueryCollection (datasourceId, collection) {
        const { sqlQuery, collectionName } = collection;
        return this.httpGet('/api/datasources/' + datasourceId + '/sql-query-collection', { sqlQuery, collectionName });
    }

    static testConnection (datasource) {
        return this.httpPost('/api/connection-test', datasource);
    }

    static getThemes () {
        return this.httpGet('/api/themes');
    }

    static getFiles () {
        return this.httpGet('/api/files');
    }

    static uploadFile (file) {
        const data = new FormData();
        data.set('content', file);

        return this.httpRequest('/api/files', {
            method: 'POST',
            body: data,
        });
    }

    static httpGet (path, data) {
        if (data) {
            const search = Object.entries(data).map(([k, v]) => `${k}=${v}`).join('&');
            path += `?${search}`;
        }
        return this.httpRequest(path, { method: 'GET' });
    }

    static httpPost (path, data) {
        return this.httpRequest(path, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static httpPut (path, data) {
        return this.httpRequest(path, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static httpPatch (path, data) {
        return this.httpRequest(path, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static httpDelete (path, data) {
        return this.httpRequest(path, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        });
    }

    static httpRequest (path, settings = {}) {
        const headers = Object.assign({}, this.defaultHeaders, settings.headers);
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
}
