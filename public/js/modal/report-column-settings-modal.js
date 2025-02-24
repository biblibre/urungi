import { t, expand } from '../i18n.js';
import { el, escapeHtml } from '../dom.js';
import Modal from './modal.js';

export default class ReportColumnSettingsModal extends Modal {
    get content() {
        return `
            <form method="dialog" class="form-horizontal">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(expand(t('Settings for {{name}}'), { name: this.args.column.elementLabel })) }</h3>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label class="col-sm-3 control-label" for="report-column-settings-modal-label">${ escapeHtml(t('Label')) }</label>
                        <div class="col-sm-9">
                            <input type="text" class="form-control" id="report-column-settings-modal-label" name="label">
                        </div>
                    </div>

                    ${ this.isAggregatable() ? this.getAggregationFormHtml() : '' }

                    ${ this.args.report.reportType === 'chart-line' ? this.getTypeFormHtml() : '' }

                    ${ this.args.report.properties.xkeys.length > 1 ? this.getDoNotStackFormHtml() : '' }

                    ${ ['date', 'number'].includes(this.args.column.elementType) ? this.getFormatFormHtml() : '' }

                    ${ ['grid', 'vertical-grid'].includes(this.args.report.reportType) ? this.getCalculateTotalFormHtml() : '' }
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary">${ escapeHtml(t('Confirm')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    getAggregationFormHtml () {
        const options = [];

        if (this.args.column.elementType === 'number') {
            options.push(el('option', { value: 'sum' }, t('Sum')));
            options.push(el('option', { value: 'avg' }, t('Average')));
            options.push(el('option', { value: 'min' }, t('Minimum')));
            options.push(el('option', { value: 'max' }, t('Maximum')));
        }
        options.push(el('option', { value: 'count' }, t('Count')));
        options.push(el('option', { value: 'countDistinct' }, t('Count distinct')));

        const formGroup = el('.form-group',
            el('label.col-sm-3.control-label', { for: 'report-column-settings-modal-aggregation' }, t('Aggregation')),
            el('.col-sm-9',
                el('select#report-column-settings-modal-aggregation.form-control', { name: 'aggregation' },
                    el('option', { value: '' }, t('No aggregation')),
                    ...options
                )
            )
        );
        return formGroup.outerHTML;
    }

    getTypeFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Type')) }</label>
                <div class="col-sm-9">
                    <div class="radio">
                        <label>
                            <input type="radio" name="type" value="spline">
                            <img src="images/spline.png">
                            <span>${ escapeHtml(t('Spline')) }</span>
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="type" value="bar">
                            <i class="fa fa-bar-chart"></i>
                            <span>${ escapeHtml(t('Bar')) }</span>
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="type" value="area">
                            <i class="fa fa-area-chart"></i>
                            <span>${ escapeHtml(t('Area')) }</span>
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="type" value="line">
                            <i class="fa fa-line-chart"></i>
                            <span>${ escapeHtml(t('Line')) }</span>
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="type" value="area-spline">
                            <img src="images/area-spline.png">
                            <span>${ escapeHtml(t('Area spline')) }</span>
                        </label>
                    </div>
                    <div class="radio">
                        <label>
                            <input type="radio" name="type" value="scatter">
                            <img src="images/scatter.png">
                            <span>${ escapeHtml(t('Scatter')) }</span>
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    getDoNotStackFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label" for="report-column-settings-modal-stack">${ escapeHtml(t('Stack columns')) }</label>
                <div class="col-sm-9">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="report-column-settings-modal-stack" name="stack" value="1">
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    getFormatFormHtml () {
        const helpUrl = this.args.column.elementType === 'date' ? 'https://momentjs.com/docs/#/displaying/' : 'http://numeraljs.com/#format';
        const tag_start = `<a href="${ escapeHtml(helpUrl) }" target="_blank" rel="noreferrer">`;
        const tag_end = '</a>';

        return `
            <div class="form-group">
                <label class="col-sm-3 control-label">${ escapeHtml(t('Format')) }</label>
                <div class="col-sm-9">
                    <input type="text" name="format">
                    <div class="help-block">
                        ${ expand(escapeHtml(t('See {{tag_start}}documentation{{tag_end}} for examples')), { tag_start, tag_end }) }
                    </div>
                </div>
            </div>
        `;
    }

    getCalculateTotalFormHtml () {
        return `
            <div class="form-group">
                <label class="col-sm-3 control-label" for="report-column-settings-modal-calculate-total">${ escapeHtml(t('Calculate total')) }</label>
                <div class="col-sm-9">
                    <div class="checkbox">
                        <label>
                            <input type="checkbox" id="report-column-settings-modal-calculate-total" name="calculateTotal" value="1">
                        </label>
                    </div>
                </div>
            </div>
        `;
    }

    isAggregatable () {
        const properties = this.args.report.properties;
        const aggregatableCols = properties.columns.concat(properties.ykeys);

        return aggregatableCols.includes(this.args.column);
    }

    canCalculateTotal () {
        const form = this.dialog.querySelector('form');
        const aggregation = form.elements.aggregation.value;
        if (this.args.column.elementType === 'number' || ['count', 'countDistinct'].includes(aggregation)) {
            return true;
        }

        return false;
    }

    init() {
        const dialog = this.dialog;

        const form = dialog.querySelector('form');

        const column = this.args.column;
        const { doNotStack, label, type, format, calculateTotal, aggregation } = column;
        const settings = { stack: !doNotStack, label, type, format, calculateTotal, aggregation };
        settings.type ??= 'bar';

        if (form.elements.calculateTotal) {
            form.elements.aggregation.addEventListener('change', ev => {
                if (this.canCalculateTotal()) {
                    form.elements.calculateTotal.removeAttribute('disabled');
                } else {
                    form.elements.calculateTotal.setAttribute('disabled', true);
                }
            });
        }

        for (const el of form.elements) {
            if (el.name && Object.hasOwn(settings, el.name)) {
                if (el.type === 'checkbox') {
                    el.checked = !!settings[el.name];
                } else if (el.type === 'radio') {
                    el.checked = el.value === settings[el.name];
                } else {
                    el.value = settings[el.name] ?? '';
                }

                el.dispatchEvent(new Event('change'));
            }
        }

        form.addEventListener('submit', function (ev) {
            ev.preventDefault();
            const formData = Object.fromEntries(new FormData(form));
            formData.stack ??= false;
            formData.calculateTotal ??= false;

            const data = Object.assign({}, settings, formData);
            data.doNotStack = !data.stack;
            delete data.stack;
            dialog.close(JSON.stringify(data));
        });
    }
}
