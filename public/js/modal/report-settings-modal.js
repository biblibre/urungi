import { t } from '../i18n.js';
import { escapeHtml } from '../dom.js';
import api from '../api.js';
import Modal from './modal.js';

export default class ReportSettingsModal extends Modal {
    get content() {
        return `
            <form method="dialog" class="form-horizontal">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Report settings')) }</h3>
                </div>

                <div class="modal-body">
                    ${ this.getThemeFormHtml() }

                    ${ ['chart-pie', 'chart-donut'].includes(this.args.report.reportType) ? this.getTypeFormHtml() : '' }

                    ${ ['chart-line', 'chart-pie', 'chart-donut'].includes(this.args.report.reportType) ? this.getLegendPositionFormHtml() : '' }

                    ${ 'gauge' === this.args.report.reportType ? this.getMaxValueFormHtml() : '' }

                    ${ this.args.report.reportType.startsWith('chart') ? this.getHeightFormHtml() : '' }

                    ${ 'pyramid' === this.args.report.reportType ? this.getRangeFormHtml() : '' }
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary">${ escapeHtml(t('Confirm')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    getThemeFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Theme')) }</label>
                <div class="col-sm-9">
                    <select name="theme" class="form-control">
                        <option value=""></option>
                    </select>
                </div>
            </div>
        `;
    }

    getTypeFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Report type')) }</label>
                <div class="col-sm-9">
                    <div class="radio">
                        <label>
                            <input type="radio" name="reportType" value="chart-donut">
                            <img src="images/donut.png">
                            ${ escapeHtml(t('Donut')) }</span>
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="reportType" value="chart-pie">
                            <img src="images/pie.png">
                            ${ escapeHtml(t('Pie')) }</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    getLegendPositionFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Legend position')) }</label>
                <div class="col-sm-9">
                    <select class="form-control" name="legendPosition">
                        <option value="top">${ escapeHtml(t('top')) }</option>
                        <option value="right">${ escapeHtml(t('right')) }</option>
                        <option value="bottom">${ escapeHtml(t('bottom')) }</option>
                        <option value="none">${ escapeHtml(t('none')) }</option>
                    </select>
                </div>
            </div>
        `;
    }

    getMaxValueFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Gauge max value')) }</label>
                <div class="col-sm-9">
                    <input class="form-control" name="maxValue" type="number">
                </div>
            </div>
        `;
    }

    getHeightFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Height')) }</label>
                <div class="col-sm-9">
                    <input class="form-control" name="height" type="number">
                </div>
            </div>
        `;
    }

    getRangeFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Limits')) }</label>
                <div class="col-sm-9">
                    <input class="form-control" name="range" type="text">
                    <span class="help-block">
                        ${ escapeHtml(t('List your limits separated by a slash symbol')) }
                        <br>
                        ${ escapeHtml(t('(Example : 20/30/40/50/60)')) }
                    </span>
                </div>

            </div>
        `;
    }

    init() {
        const dialog = this.dialog;

        const form = dialog.querySelector('form');

        const report = this.args.report;
        const { legendPosition, height, maxValue, range } = report.properties;
        const { reportType, theme } = report;
        const settings = { reportType, theme, legendPosition, height, maxValue, range };

        if (form.elements.theme) {
            api.getThemes().then(res => {
                for (const theme of res.data.data) {
                    form.elements.theme.add(new Option(theme, theme, false, this.args.report.theme === theme));
                }
            });
        }

        for (const el of form.elements) {
            if (el.name && Object.hasOwn(settings, el.name)) {
                if (el.type === 'radio') {
                    el.checked = el.value === settings[el.name];
                } else {
                    el.value = settings[el.name];
                }
            }
        }

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            const formData = Object.fromEntries(new FormData(form));
            const data = Object.assign({}, settings, formData);
            dialog.close(JSON.stringify(data));
        });
    }
}
