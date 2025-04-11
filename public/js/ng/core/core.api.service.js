angular.module('app.core').factory('api', api);

api.$inject = ['$http', 'connection'];

function api ($http, connection) {
    const service = {
        getCounts,
        getUserData,

        getDatasource,
        getDatasourceCollections,
        getDatasourceCollection,

        getReports,
        getReportData,
        getReportSql,
        getReportFilterValues,
        getReportAsPDF,
        getReportAsPNG,
        isReportAsPDFAvailable,
        isReportAsPNGAvailable,

        getDashboardForView,
        getDashboardAsPDF,
        getDashboardAsPNG,
        isDashboardAsPDFAvailable,
        isDashboardAsPNGAvailable,

        getLayers,
        getLayer,
        replaceLayer,

        getFiles,
        uploadFile,

        getThemes,
    };

    return service;

    function getCounts () {
        return httpGet('/api/user/counts');
    }

    function getUserData () {
        return httpGet('/api/user');
    }

    function getDatasource (id) {
        return httpGet('/api/datasources/' + id);
    }

    function getDatasourceCollections (datasourceId) {
        return httpGet('/api/datasources/' + datasourceId + '/collections');
    }

    function getDatasourceCollection (datasourceId, collectionName) {
        return connection.get('/api/datasources/' + datasourceId + '/collections/' + collectionName);
    }

    /**
     * Fetch multiple reports
     *
     * @param {object} params - Query parameters
     * @param {Array<string>} params.fields - List of fields to retrive
     * @param {Object<string, string>} params.filters - Filters to apply
     * @param {string} params.sort - Field to sort on
     * @param {number} params.sortType - Sort direction (1: asc, -1: desc)
     * @param {number} params.page - Page to fetch
     * @returns {Promise<object, Error>} Promise that resolves to an object
     */
    function getReports (params) {
        return httpGet('/api/reports/find-all', params);
    }

    /**
     * Fetch report data
     *
     * @param {object} report - Report definition
     * @param {object} options - Options
     * @param {number} options.limit - Limit the maximum number of rows used
     * @param {object} options.filters - Filters values
     */
    function getReportData (report, options = {}) {
        const params = {
            report,
        };

        if (options.limit && !report.properties.recordLimit) {
            params.limit = options.limit;
        }

        if (options.filters) {
            params.filters = options.filters;
        }

        return httpPost('/api/reports/data-query', params);
    }

    function getReportSql (report, options = {}) {
        const params = {
            report,
        };

        if (options.limit && !report.properties.recordLimit) {
            params.limit = options.limit;
        }

        if (options.filters) {
            params.filters = options.filters;
        }

        return httpPost('/api/reports/sql-query', params);
    }

    function getReportFilterValues (filter, options) {
        return httpPost('/api/reports/filter-values-query', { filter, options });
    }

    /**
     * Export a report as PDF
     *
     * @param {string} id - Report ID
     * @param {object} params - Parameters
     * @param {boolean} params.displayHeaderFooter - Display header and footer
     * @param {string} params.headerTemplate - Header template
     * @param {string} params.footerTemplate - Footer template
     */
    function getReportAsPDF (id, params) {
        return httpPost(`/api/reports/${id}/pdf`, params);
    }

    function getReportAsPNG (id, params) {
        return httpPost(`/api/reports/${id}/png`, params);
    }

    function isReportAsPDFAvailable (id) {
        return $http({ method: 'OPTIONS', url: `/api/reports/${id}/pdf` }).then(res => {
            return true;
        }, res => {
            return false;
        });
    }

    function isReportAsPNGAvailable (id) {
        return $http({ method: 'OPTIONS', url: `/api/reports/${id}/png` }).then(res => {
            return true;
        }, res => {
            return false;
        });
    }

    function getDashboardForView (id) {
        return httpGet('/api/dashboards/get/' + id).then(data => data.item);
    }

    /**
     * Export a dashboard as PDF
     *
     * @param {string} id - Dashboard ID
     * @param {object} params - Parameters
     * @param {boolean} params.displayHeaderFooter - Display header and footer
     * @param {string} params.headerTemplate - Header template
     * @param {string} params.footerTemplate - Footer template
     */
    function getDashboardAsPDF (id, params) {
        return httpPost(`/api/dashboards/${id}/pdf`, params);
    }

    function getDashboardAsPNG (id, params) {
        return httpPost(`/api/dashboards/${id}/png`, params);
    }

    function isDashboardAsPDFAvailable (id) {
        return $http({ method: 'OPTIONS', url: `/api/dashboards/${id}/pdf` }).then(res => {
            return true;
        }, res => {
            return false;
        });
    }

    function isDashboardAsPNGAvailable (id) {
        return $http({ method: 'OPTIONS', url: `/api/dashboards/${id}/png` }).then(res => {
            return true;
        }, res => {
            return false;
        });
    }

    /**
     * Fetch multiple layers
     *
     * @param {object} params - Query parameters
     * @param {Array<string>} params.fields - List of fields to retrive
     * @param {Object<string, string>} params.filters - Filters to apply
     * @param {string} params.sort - Field to sort on
     * @param {number} params.sortType - Sort direction (1: asc, -1: desc)
     * @param {number} params.page - Page to fetch
     * @returns {Promise<object, Error>} Promise that resolves to an object
     */
    function getLayers (params) {
        return httpGet('/api/layers', params);
    }

    /**
     * Fetch an existing layer
     *
     * @param {string} id - ID of layer to fetch
     * @returns {Promise<object, Error>} Promise that resolves to the layer object
     */
    function getLayer (id) {
        return httpGet('/api/layers/' + id);
    }

    function replaceLayer (layer) {
        return httpPut('/api/layers/' + layer._id, layer);
    }

    function getFiles () {
        return httpGet('/api/files').then(function (res) {
            return res.files;
        });
    }

    function uploadFile (file) {
        const config = {
            headers: {
                'Content-Type': undefined,
            },
        };
        const data = new FormData();
        data.set('content', file);

        return $http.post('/api/files', data, config).then(res => res.data, res => {
            throw new Error(res.statusText);
        });
    }

    /**
     * Fetch the list of available themes
     */
    function getThemes () {
        return httpGet('/api/themes');
    }

    /**
     * Perform a GET request
     *
     * @param {string} url - URL of the request
     * @param {object} params - Query parameters
     * @returns {Promise<object, Error>} Promise that resolves to an object (can be undefined if not found)
     */
    function httpGet (url, params) {
        return httpRequest({ method: 'GET', url, params });
    }

    /**
     * Perform a POST request
     *
     * @param {string} url - URL of the request
     * @param {object} data - Data to send as request body
     * @returns {Promise<object, Error>}
     */
    function httpPost (url, data) {
        return httpRequest({ method: 'POST', url, data });
    }

    function httpPut (url, data) {
        return httpRequest({ method: 'PUT', url, data });
    }

    function httpRequest (config) {
        return $http(config).then(res => {
            if (res.data && res.data.result === 0) {
                throw new Error(res.data.msg);
            }

            return res.data;
        }, res => {
            if (typeof res.data === 'object' && res.data.error) {
                throw new Error(res.data.error);
            }

            throw new Error(res.data);
        });
    }
}
