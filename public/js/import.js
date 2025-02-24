import { el } from './dom.js';
import { t, expand } from './i18n.js';
import api from './api.js';
import './progressbar.js';
import './custom-element/import-table.js';

class ImportElement extends HTMLDivElement {
    constructor () {
        super();

        this.datasourcesById = {};
        this.layersById = {};

        const fileSelector = el('input#file-selector', {
            type: 'file',
            accept: '.json,application/json'
        });
        fileSelector.addEventListener('change', this.onFileChange.bind(this));

        this.resultArea = el('div');
        this.form = el('form', { method: 'POST' },
            el('h4', t('Step 1 - Choose file to import')),
            el('.form-group',
                el('label', { for: 'file-selector' }, t('Select file...')),
                fileSelector
            ),
            this.resultArea,
        );
        this.form.addEventListener('submit', this.onSubmit.bind(this));

        this.append(this.form);
        this.getDatasourcesPromise = this.getDatasources();
    }

    onFileChange (ev) {
        this.reset();
        const files = ev.target.files;
        if (files.length > 0) {
            files[0].text()
                .then(json => this.parseFile(json))
                .then(this.checkImportFile.bind(this), this.onParseFileError.bind(this));
        }
    }

    onParseFileError (err) {
        const errorElement = el('.text-danger', t('Error:') + ' ' + err.message);
        this.resultArea.append(errorElement);
    }

    reset () {
        this.layersById = {};
        this.datasourcesById = {};
        this.resultArea.replaceChildren();
    }

    parseFile (json) {
        const bundle = JSON.parse(json);

        if (!(bundle.layers && bundle.reports && bundle.datasources && bundle.dashboards)) {
            throw new Error(t('File must contain the following properties: datasources, layers, reports and dashboards'));
        }

        return bundle;
    }

    checkImportFile (importFile) {
        const importBundle = {
            layers: [],
            reports: [],
            dashboards: [],
            datasources: [],
        };

        const hasId = doc => doc && doc._id;
        const datasources = importFile.datasources.filter(hasId);
        const layers = importFile.layers.filter(hasId);
        const reports = importFile.reports.filter(hasId);
        const dashboards = importFile.dashboards.filter(hasId);

        const progressStatus = el('span',
            el('i.fa.fa-spinner.fa-fw.fa-spin'),
            t('Checking file')
        );
        const progressbar = el('app-progressbar');
        this.resultArea.append(el('div', progressStatus, progressbar));

        progressbar.value = 0;
        progressbar.max = datasources.length + layers.length + reports.length + dashboards.length;

        for (const datasource of datasources) {
            importBundle.datasources.push(datasource);
            this.datasourcesById[datasource._id] = datasource;

            progressbar.value++;
        }

        const promises = [];
        for (const layer of layers) {
            importBundle.layers.push(layer);
            this.layersById[layer._id] = layer;

            Object.defineProperty(layer, '$errors', { value: this.getLayerErrors(layer) });
            Object.defineProperty(layer, '$valid', { value: layer.$errors.length === 0 });
            if (!layer.$valid) {
                progressbar.value++;
                continue;
            }

            promises.push(this.getLayer(layer._id).then(l => {
                Object.defineProperty(layer, '$exists', { value: !!l });
                progressbar.value++;
            }));
        }

        for (const report of importFile.reports) {
            importBundle.reports.push(report);

            Object.defineProperty(report, '$errors', { value: this.getReportErrors(report) });
            Object.defineProperty(report, '$valid', { value: report.$errors.length === 0 });
            if (!report.$valid) {
                progressbar.value++;
                continue;
            }

            promises.push(this.getReport(report._id).then(r => {
                Object.defineProperty(report, '$exists', { value: !!r });
                progressbar.value++;
            }));
        }

        for (const dashboard of importFile.dashboards) {
            importBundle.dashboards.push(dashboard);

            Object.defineProperty(dashboard, '$errors', { value: this.getDashboardErrors(dashboard) });
            Object.defineProperty(dashboard, '$valid', { value: dashboard.$errors.length === 0 });
            if (!dashboard.$valid) {
                progressbar.value++;
                continue;
            }

            promises.push(this.getDashboard(dashboard._id).then(d => {
                Object.defineProperty(dashboard, '$exists', { value: !!d });
                progressbar.value++;
            }));
        }

        return Promise.all(promises).then(() => {
            progressStatus.replaceChildren(el('i.fa.fa-check.fa-fw'), ' ', t('File verified'));
            this.importBundle = importBundle;
            return this.showCheckResults(importBundle);
        });
    }

    showCheckResults (checkedBundle) {
        return this.getDatasourcesPromise.then(datasources => {
            const datasourceDetails = this.createDetailsElement(t('Data sources'));
            const layerTable = el('table', { is: 'app-import-table' });
            const reportTable = el('table', { is: 'app-import-table' });
            const dashboardTable = el('table', { is: 'app-import-table' });

            this.resultArea.append(
                el('h4', t('Step 2 - Confirm import')),
                datasourceDetails,
                this.createDetailsElement(t('Layers'), layerTable),
                this.createDetailsElement(t('Reports'), reportTable),
                this.createDetailsElement(t('Dashboards'), dashboardTable),
                el('div', { class: 'form-group' },
                    el('button', { class: 'btn btn-sm btn-primary', type: 'submit' }, t('Start import'))
                )
            );

            checkedBundle.datasources.forEach(d => { datasourceDetails.append(this.getDatasourceSelect(d, datasources)); });
            checkedBundle.layers.forEach(l => { layerTable.add(l.name, l); });
            checkedBundle.reports.forEach(r => { reportTable.add(r.reportName, r); });
            checkedBundle.dashboards.forEach(d => { dashboardTable.add(d.dashboardName, d); });
        });
    }

    onSubmit (ev) {
        ev.preventDefault();
        this.form.querySelector('[type="submit"]').disabled = true;
        const importBundle = this.importBundle;

        const layers = importBundle.layers.filter(l => l.$valid);
        const reports = importBundle.reports.filter(r => r.$valid);
        const dashboards = importBundle.dashboards.filter(d => d.$valid);

        const progressbar = el('app-progressbar');
        progressbar.max = layers.length + reports.length + dashboards.length;
        this.messages = el('.well', { style: 'height: 300px; overflow-y: auto' });
        this.resultArea.append(progressbar, this.messages);
        this.messages.scrollIntoView({ behavior: 'smooth' });

        const layerPromises = [];
        for (const layer of layers) {
            const p = this.importLayer(layer).then(() => {
                progressbar.value++;
            });
            layerPromises.push(p);
        }

        return Promise.all(layerPromises).then(() => {
            const reportAndDashboardPromises = [];

            for (const report of reports) {
                const p = this.importReport(report).then(() => {
                    progressbar.value++;
                });
                reportAndDashboardPromises.push(p);
            }
            for (const dashboard of dashboards) {
                const p = this.importDashboard(dashboard).then(() => {
                    progressbar.value++;
                });
                reportAndDashboardPromises.push(p);
            }

            return Promise.all(reportAndDashboardPromises);
        }).then(() => {
            this.messages.append(el('.text-info', t('Import completed')));
        });
    }

    importLayer (layer) {
        let p = Promise.resolve(0);

        const datasourceID = this.getLayerDatasourceID(layer);
        layer.datasourceID = this.form.elements['datasource_id[' + datasourceID + ']'].value;

        // Remove properties that should not be added/updated
        delete layer.createdBy;
        delete layer.createdOn;

        const overwriteCheckbox = this.form.elements['overwrite[' + layer._id + ']'];
        const overwrite = overwriteCheckbox && overwriteCheckbox.checked;
        if (layer.$exists && overwrite) {
            p = api.replaceLayer(layer).then(() => {
                Object.defineProperty(layer, '$imported', { value: true });
                this.messages.append(el('.text-success', t('Layer updated successfully:') + ' ' + layer.name));
            }, err => {
                this.messages.append(el('.text-error', t('Failed to update layer') + ' ' + layer.name + ': ' + err.message));
            });
        } else if (!layer.$exists) {
            p = api.createLayer(layer).then(() => {
                Object.defineProperty(layer, '$imported', { value: true });
                this.messages.append(el('.text-success', t('Layer created successfully:') + ' ' + layer.name));
            }, err => {
                this.messages.append(el('.text-error', t('Failed to create layer') + ' ' + layer.name + ': ' + err.message));
            });
        }

        return p;
    }

    importReport (report) {
        let p = Promise.resolve(0);

        const layer = this.importBundle.layers.find(l => l._id === report.selectedLayerID);
        if (!layer || (!layer.$imported && !layer.$exists)) {
            return p;
        }

        // Remove properties that should not be added/updated
        delete report.author;
        delete report.createdBy;
        delete report.createdOn;
        delete report.isPublic;
        delete report.isShared;
        delete report.owner;
        delete report.parentFolder;

        const overwriteCheckbox = this.form.elements['overwrite[' + report._id + ']'];
        const overwrite = overwriteCheckbox && overwriteCheckbox.checked;
        if (report.$exists && overwrite) {
            p = api.replaceReport(report).then(() => {
                this.messages.append(el('.text-success', t('Report updated successfully:') + ' ' + report.reportName));
            }, err => {
                this.messages.append(el('.text-error', t('Failed to update report') + ' ' + report.reportName + ': ' + err.message));
            });
        } else if (!report.$exists) {
            p = api.createReport(report).then(() => {
                this.messages.append(el('.text-success', t('Report created successfully:') + ' ' + report.reportName));
            }, err => {
                this.messages.append(el('.text-error', t('Failed to create report') + ' ' + report.reportName + ': ' + err.message));
            });
        }

        return p;
    }

    importDashboard (dashboard) {
        let p = Promise.resolve(0);

        const allReportsOk = dashboard.reports.every(r => {
            const layer = this.importBundle.layers.find(l => l._id === r.selectedLayerID);
            return layer && (layer.$exists || layer.$imported);
        });
        if (!allReportsOk) {
            return p;
        }

        // Remove properties that should not be added/updated
        delete dashboard.author;
        delete dashboard.createdBy;
        delete dashboard.createdOn;
        delete dashboard.isPublic;
        delete dashboard.isShared;
        delete dashboard.owner;
        delete dashboard.parentFolder;

        const overwriteCheckbox = this.form.elements['overwrite[' + dashboard._id + ']'];
        const overwrite = overwriteCheckbox && overwriteCheckbox.checked;
        if (dashboard.$exists && overwrite) {
            p = api.replaceDashboard(dashboard).then(() => {
                this.messages.append(el('.text-success', t('Dashboard updated successfully:') + ' ' + dashboard.dashboardName));
            }, err => {
                this.messages.append(el('.text-error', t('Failed to update dashboard') + ' ' + dashboard.dashboardName + ': ' + err.message));
            });
        } else if (!dashboard.$exists) {
            p = api.createDashboard(dashboard).then(() => {
                this.messages.append(el('.text-success', t('Dashboard created successfully') + ' ' + dashboard.dashboardName));
            }, err => {
                this.messages.append(el('.text-error', t('Failed to create dashboard') + ' ' + dashboard.dashboardName + ': ' + err.message));
            });
        }

        return p;
    }

    /**
     * Get datasourceID of a layer.
     *
     * datasourceID can be at different locations depending on the version
     * of Urungi where export has been made
     *
     * @param {Object} layer - The layer object
     */
    getLayerDatasourceID (layer) {
        let datasourceID = layer.datasourceID;
        if (!datasourceID && layer.params && layer.params.schema && layer.params.schema.length > 0) {
            datasourceID = layer.params.schema[0].datasourceID;
        }

        return datasourceID;
    }

    getDatasources () {
        return api.getDatasources().then(({ data }) => data && data.data);
    }

    getDashboard (id) {
        return api.getDashboard(id).then(({ data }) => data && data.item).catch(() => {});
    }

    getReport (id) {
        return api.getReport(id).then(({ data }) => data && data.item).catch(() => {});
    }

    getLayer (id) {
        return api.getLayer(id).then(({ data }) => data).catch(() => {});
    }

    getDatasourceSelect (datasource, localDatasources) {
        const select = el('select.form-control', { name: 'datasource_id[' + datasource._id + ']', required: '' });
        select.add(new Option());
        for (const localDatasource of localDatasources) {
            const selected = localDatasources.length === 1 || localDatasource.name === datasource.name;
            select.add(new Option(localDatasource.name, localDatasource._id, false, selected));
        }

        const e = el('.form-group',
            el('label.control-label', expand(t('Datasource matching {{name}}'), { name: datasource.name })),
            select,
            el('span.help-block', t('This field is required'))
        );

        return e;
    }

    getLayerErrors (layer) {
        const errors = [];
        const datasourceID = this.getLayerDatasourceID(layer);
        if (datasourceID) {
            if (!(datasourceID in this.datasourcesById)) {
                errors.push(t('Related datasource is not in import file'));
            }
        } else {
            errors.push(t('No datasourceID'));
        }

        return errors;
    }

    getReportErrors (report) {
        const errors = [];

        const layerID = report.selectedLayerID;
        if (layerID) {
            if (layerID in this.layersById) {
                if (!this.layersById[layerID].$valid) {
                    errors.push(t('Related layer is not valid'));
                }
            } else {
                errors.push(t('Related layer is not in import file'));
            }
        } else {
            errors.push(t('No selectedLayerID'));
        }

        return errors;
    }

    getDashboardErrors (dashboard) {
        const errors = [];

        for (const report of dashboard.reports) {
            const reportErrors = this.getReportErrors(report);
            if (reportErrors.length > 0) {
                errors.push(t('At least one report has error:') + ' ' + reportErrors.join(', '));
                break;
            }
        }

        return errors;
    }

    createDetailsElement (summary, ...children) {
        return el('details', { open: '' }, el('summary', summary), ...children);
    }
}

window.ImportElement = ImportElement;
customElements.define('app-import', ImportElement, { extends: 'div' });
