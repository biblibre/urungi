import { t } from '../i18n.esm.js';
import { escapeHtml } from '../dom.esm.js';
import Modal from './modal.js';

export class FilterPromptModal extends Modal {
    get content() {
        return `
            <form method="dialog" class="form-horizontal">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Runtime filter properties')) }</h3>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="filter-prompt-modal-filter-prompt" class="col-sm-4 control-label">${ escapeHtml(t('Activate runtime filter')) }</label>
                        <div class="col-sm-8">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="filter-prompt-modal-filter-prompt" name="filterPrompt" value="1">
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="filter-prompt-modal-prompt-title" class="col-sm-4 control-label">${ escapeHtml(t('Runtime Filter Label')) }</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" id="filter-prompt-modal-prompt-title" name="promptTitle">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="filter-prompt-modal-prompt-instructions" class="col-sm-4 control-label">${ escapeHtml(t('Filter Instructions')) }</label>
                        <div class="col-sm-8">
                            <textarea id="layer-element-modal-prompt-instructions" class="form-control" name="promptInstructions" style="resize: vertical"></textarea>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="filter-prompt-modal-prompt-mandatory" class="col-sm-4 control-label">${ escapeHtml(t('Answer required (mandatory filter)')) }</label>
                        <div class="col-sm-8">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="filter-prompt-modal-prompt-mandatory" name="promptMandatory" value="1">
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="filter-prompt-modal-prompt-allow-multiple-selection" class="col-sm-4 control-label">${ escapeHtml(t('Allow Multiple selection')) }</label>
                        <div class="col-sm-8">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="filter-prompt-modal-prompt-allow-multiple-selection" name="promptAllowMultipleSelection" value="1">
                                </label>
                            </div>
                        </div>
                    </div>

                    <h4>${ escapeHtml(t('Suggestions')) }</h4>

                    <div class="form-group">
                        <label for="filter-prompt-modal-suggestions-show" class="col-sm-4 control-label">${ escapeHtml(t('Show suggestions')) }</label>
                        <div class="col-sm-8">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="filter-prompt-modal-suggestions-show" name="suggestionsShow" value="1">
                                </label>
                            </div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="filter-prompt-modal-suggestions-limit" class="col-sm-4 control-label">${ escapeHtml(t('Number of suggestions')) }</label>
                        <div class="col-sm-8">
                            <input type="number" id="filter-prompt-modal-suggestions-limit" class="form-control" name="suggestionsLimit">
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="filter-prompt-modal-suggestions-unlimited" class="col-sm-4 control-label">${ escapeHtml(t('Unlimited number of suggestions')) }</label>
                        <div class="col-sm-8">
                            <div class="checkbox">
                                <label>
                                    <input type="checkbox" id="filter-prompt-modal-suggestions-unlimited" name="suggestionsUnlimited" value="1">
                                </label>
                            </div>
                            <div class="help-block">
                                ${ escapeHtml(t('Warning: this setting can cause the application to crash if too many suggestions are returned')) }
                            </div>
                        </div>
                    </div>

                    <div class="messages"></div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary">${ escapeHtml(t('OK')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    init() {
        const { dialog, args } = this;

        console.log(args.filter);

        const form = dialog.querySelector('form');

        const data = Object.assign({}, args.filter);
        data.suggestionsShow = args.filter.suggestions?.show;
        data.suggestionsLimit = args.filter.suggestions?.limit;
        data.suggestionsUnlimited = args.filter.suggestions?.unlimited;

        // Populate form
        for (const el of form.elements) {
            if (el.name && Object.hasOwn(data, el.name)) {
                if (el.type === 'checkbox') {
                    el.checked = !!data[el.name];
                } else {
                    el.value = data[el.name];
                }
            }
            el.dispatchEvent(new Event('change'));
        }

        form.addEventListener('submit', ev => this.onSubmit(ev));
    }

    onSubmit (ev) {
        ev.preventDefault();

        const form = this.dialog.querySelector('form');
        const data = {};
        for (const el of form.elements) {
            if (el.name) {
                if (el.type === 'checkbox') {
                    data[el.name] = el.checked;
                } else {
                    data[el.name] = el.value;
                }
            }
        }
        data.suggestions = {
            show: data.suggestionsShow,
            limit: data.suggestionsLimit,
            unlimited: data.suggestionsUnlimited,
        };
        delete data.suggestionsShow;
        delete data.suggestionsLimit;
        delete data.suggestionsUnlimited;

        const filter = Object.assign({}, this.args.filter, data);

        this.dialog.close(JSON.stringify(filter));
    }
}
