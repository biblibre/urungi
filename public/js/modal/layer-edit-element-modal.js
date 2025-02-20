import { t } from '../i18n.esm.js';
import { escapeHtml } from '../dom.esm.js';
import Modal from './modal.js';

export default class LayerEditElementModal extends Modal {
    get content() {
        return `
            <form method="dialog" class="form-horizontal">
                <div class="modal-header">
                    <button type="button" class="close" aria-hidden="true" data-dismiss="modal"><i class="fa fa-close"></i></button>
                    <h3 class="modal-title">${ escapeHtml(t('Add element to schema')) }</h3>
                </div>

                <div class="modal-body">
                    <div class="form-group">
                        <label for="layer-edit-element-modal-label" class="col-sm-4 control-label">${ escapeHtml(t('Label')) } ${ escapeHtml(t('(required)')) }</label>
                        <div class="col-sm-8">
                            <input type="text" class="form-control" id="layer-edit-element-modal-label" name="elementLabel" required>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="layer-edit-element-modal-description" class="col-sm-4 control-label">${ escapeHtml(t('Description')) }</label>
                        <div class="col-sm-8">
                            <textarea id="layer-element-modal-description" class="form-control" name="description" style="resize: vertical"></textarea>
                        </div>
                    </div>

                    ${ this.getExpressionFormElement() }

                    <div class="form-group">
                        <label for="layer-edit-element-modal-type" class="col-sm-4 control-label">${ escapeHtml(t('Type')) }</label>
                        <div class="col-sm-8">
                            <select id="layer-element-modal-type" class="form-control" name="elementType">
                                <option value="string">string</option>
                                <option value="number">number</option>
                                <option value="boolean">boolean</option>
                                <option value="date">date</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="layer-edit-element-modal-format" class="col-sm-4 control-label">${ escapeHtml(t('Format')) }</label>
                        <div class="col-sm-8">
                            <input type="text" id="layer-element-modal-format" class="form-control" name="format">
                            <div class="help-block"></div>
                        </div>
                    </div>

                    <div class="form-group">
                        <label for="layer-edit-element-modal-default-aggregation" class="col-sm-4 control-label">${ escapeHtml(t('Default aggregation')) }</label>
                        <div class="col-sm-8">
                            <select id="layer-element-modal-default-aggregation" class="form-control" name="defaultAggregation">
                                <option value="value">raw</option>
                                <option value="sum">SUM</option>
                                <option value="avg">AVG</option>
                                <option value="min">MIN</option>
                                <option value="max">MAX</option>
                                <option value="count">COUNT</option>
                            </select>
                        </div>
                    </div>

                    <div class="notify-messages"></div>
                </div>

                <div class="modal-footer">
                    <button class="btn btn-primary">${ escapeHtml(t('Save')) }</button>
                    <button type="button" class="btn" data-dismiss="modal">${ escapeHtml(t('Cancel')) }</button>
                </div>
            </form>
        `;
    }

    getExpressionFormElement () {
        if (!this.args.element.isCustom) {
            return '';
        }

        return `
            <div class="form-group">
                <label for="layer-edit-element-modal-expression" class="col-sm-4 control-label">${ escapeHtml(t('Expression')) } ${ escapeHtml(t('(required)')) }</label>
                <div class="col-sm-8">
                    <textarea class="form-control" id="layer-edit-element-modal-expression" name="viewExpression" style="resize: vertical" required></textarea>

                    <details>
                        <summary>${ escapeHtml(t('Add elements')) }</summary>
                        <div class="collection-tree" style="max-height: 300px; overflow-y: auto; box-shadow: 0px 0px 3px 0px lightgrey inset; background-color: white; border-radius: 4px;"></div>
                    </details>

                    <div class="help-block">
                        <details open>
                            <summary>${ escapeHtml(t('Elements used in the expression')) }</summary>
                            <ul></ul>
                        </details>
                    </div>
                </div>
            </div>
        `;
    }

    getNumberFormatHelpBlock () {
        return `
            <details>
                <summary>${ escapeHtml(t('Format examples')) }</summary>
                <table class="table-condensed striped bordered">
                    <thead>
                        <tr>
                            <th>${ escapeHtml(t('Number')) }</th>
                            <th>${ escapeHtml(t('Format')) }</th>
                            <th>${ escapeHtml(t('String')) }</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr><td>10000</td><td>0,0.0000</td><td>10,000.0000</td></tr>
                        <tr><td>10000.23</td><td>0,0</td><td>10,000</td></tr>
                        <tr><td>10000.1234</td><td>0.000</td><td>10000.123</td></tr>
                        <tr><td>-10000</td><td>(0,0.0000)</td><td>(10,000.0000)</td></tr>
                        <tr><td>-0.23</td><td>.00</td><td>-.23</td></tr>
                        <tr><td>1230974</td><td>0.0a</td><td>1.2m</td></tr>
                        <tr><td>1000.234</td><td>$0,0.00</td><td>$1,000.23</td></tr>
                        <tr><td>1000.2</td><td>0,0[.]00 $</td><td>1,000.20 $</td></tr>
                        <tr><td>0.974878234</td><td>0.000%</td><td>97.488%</td></tr>
                    </tbody>
                </table>
                <a class="btn btn-link pull-right" href="http://numeraljs.com/" target="_blank">${ escapeHtml(t('more examples...')) }</a>
            </details>
        `;
    }

    getDateFormatHelpBlock () {
        return `
            <details>
                <summary>${ escapeHtml(t('Format examples')) }</summary>

                <table class="table-condensed striped bordered">
                    <thead>
                        <tr>
                            <th>${ escapeHtml(t('Format')) }</th>
                            <th>${ escapeHtml(t('Result')) }</th>
                        </tr>
                    </thead>

                    <tbody>
                        <tr><td>dddd, MMMM Do YYYY, h:mm:ss a</td><td>Sunday, February 14th 2010, 3:25:50 pm</td></tr>
                        <tr><td>DD/MM/YYYY</td><td>18/01/1969</td></tr>
                    </tbody>
                </table>

                <a class="btn btn-link pull-right" href="http://momentjs.com/docs/#/displaying/" target="_blank">${ escapeHtml(t('more examples...')) }</a>
            </details>
        `;
    }

    init() {
        const { dialog, args } = this;

        const form = dialog.querySelector('form');

        form.elementType.addEventListener('change', ev => {
            const type = ev.target.value;
            const helpBlock = form.format.parentElement.querySelector('.help-block');
            if (type === 'number') {
                form.format.disabled = false;
                helpBlock.innerHTML = this.getNumberFormatHelpBlock();
            } else if (type == 'date') {
                form.format.disabled = false;
                helpBlock.innerHTML = this.getDateFormatHelpBlock();
            } else {
                form.format.value = '';
                form.format.disabled = true;
                helpBlock.replaceChildren();
            }

            form.defaultAggregation.disabled = !(type === 'string' || type === 'number');
            for (const option of form.defaultAggregation.options) {
                option.disabled = type === 'string' && !(['value', 'count'].includes(option.value));
            }
            if (form.defaultAggregation.selectedOptions[0].disabled) {
                form.defaultAggregation.value = form.defaultAggregation.options[0].value;
            }
        });

        if (form.viewExpression) {
            const tree = form.viewExpression.parentElement.querySelector('.collection-tree');
            const collectionNodes = [];
            for (const collection of args.layer.params.schema) {
                const node = {
                    id: collection.collectionID,
                    text: collection.collectionName,
                    icon: 'fa fa-cubes',
                    children: [],
                };

                for (const element of collection.elements) {
                    node.children.push({
                        id: element.elementID,
                        text: element.elementName,
                        icon: 'fa fa-cube',
                    });
                }

                collectionNodes.push(node);
            }
            $(tree).jstree({
                core: {
                    data: collectionNodes,
                    worker: false,
                    multiple: false,
                    dblclick_toggle: false,
                    themes: {
                        dots: false,
                    },
                }
            });
            $(tree).on('select_node.jstree', (ev, data) => {
                const { node, instance } = data;
                instance.deselect_all();
                if (node.icon === 'fa fa-cube') {
                    const textarea = form.viewExpression;
                    textarea.focus();
                    textarea.setRangeText(`#${node.id}`, textarea.selectionStart, textarea.selectionStart, 'end');
                    textarea.dispatchEvent(new Event('change'));
                } else {
                    instance.toggle_node(node);
                }
            });

            form.viewExpression.addEventListener('change', ev => { this.onExpressionChange(ev) });
            form.viewExpression.addEventListener('input', ev => { this.onExpressionChange(ev) });
        }

        // Populate form
        for (const el of form.elements) {
            if (el.name && Object.hasOwn(args.element, el.name)) {
                el.value = args.element[el.name];
            }
            el.dispatchEvent(new Event('change'));
        }

        form.addEventListener('submit', ev => {
            ev.preventDefault();

            const element = Object.assign({}, args.element, Object.fromEntries(new FormData(ev.target)));
            element.elementRole = 'dimension';
            if (element.viewExpression) {
                try {
                    const elements = window.layerUtils.getElementsUsedInCustomExpression(element.viewExpression, args.layer);
                    if (elements.length === 0) {
                        throw new Error(t('Custom element need to use at least one element'));
                    }
                    element.component = this.getElementComponent(elements[0]);
                } catch (err) {
                    const messagesContainer = dialog.querySelector('.notify-messages');
                    window.Urungi.notify.error(err, { appendTo: messagesContainer });
                    return;
                }
            }

            dialog.close(JSON.stringify(element));
        });
    }

    getElementComponent (element) {
        const collectionId = element.collectionID;
        const collection = this.args.layer.params.schema.find(c => c.collectionID === collectionId);

        if (collection) {
            return collection.component;
        }
    }

    onExpressionChange (ev) {
        const form = this.dialog.querySelector('form');
        const tree = form.viewExpression.parentElement.querySelector('.collection-tree');

        try {
            const elements = window.layerUtils.getElementsUsedInCustomExpression(ev.target.value, this.args.layer);
            for (const collection of this.args.layer.params.schema) {
                const component = elements.length > 0 ? this.getElementComponent(elements[0]) : null;
                console.log(component);
                if (component && collection.component !== component) {
                    $(tree).jstree(true).hide_node(collection.collectionID);
                } else {
                    $(tree).jstree(true).show_node(collection.collectionID);
                }
            }

            let helpBlockHtml = '';
            for (const element of elements) {
                helpBlockHtml += `<li>#${element.elementID} = ${element.collectionName}.${element.elementLabel}</li>`;
            }
            form.viewExpression.parentElement.querySelector('.help-block ul').innerHTML = helpBlockHtml;
        } catch (err) {
            // Do nothing
        }
    }
}
