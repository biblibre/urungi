import i18n from '../i18n.js';
import api from '../api.js';
import { el, parse } from '../dom.js';
import * as uuid from '../uuid.js';
import * as c3Charts from '../report/c3-charts.js';
import { createGrid } from '../report/grid.js';
import { createPivotTable } from '../report/pivot.js';

class ReportView extends HTMLElement {
    constructor () {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback () {
    }

    setReport (report) {
        this.report = report;
    }

    setTheme (theme) {
        this.theme = theme;

        this.repaint({ data: this.data });
    }

    changeContent (html) {
        const newChildren = [];
        newChildren.push(el('link', { rel: 'stylesheet', href: 'css/report-view.css' }));

        const theme = this.report?.theme || this.theme;
        if (theme) {
            newChildren.push(el('link', { rel: 'stylesheet', href: `themes/${theme}.css` }));
        }

        newChildren.push(html instanceof HTMLElement ? html : parse(html))

        this.shadowRoot.replaceChildren(...newChildren);
    }

    showLoadingScreen (message) {
        const loading = el('.report-view-loading',
            el('i.fa.fa-refresh.fa-spin.fa-fw'),
            ' ',
            message
        );
        this.changeContent(loading);
    }

    async repaint (args = {}) {
        this.showLoadingScreen(i18n.gettext('Fetching data ...'));

        if (args.fetchData && this.report) {
            const res = await api.getReportData(this.report, args);
            this.data = res.data.data;
        } else {
            this.data = args.data;
        }

        this.showLoadingScreen(i18n.gettext('Repainting report ...'));

        if (this.data && this.data.length > 0) {
            switch (this.report.reportType) {
            case 'grid':
                this.changeContent(el('.report-view'));
                return createGrid($(this.shadowRoot.querySelector('.report-view')), this.report, this.data);

            case 'vertical-grid':
                this.changeContent(el('.report-view'));
                return createGrid($(this.shadowRoot.querySelector('.report-view')), this.report, this.data, { vertical: true });

            case 'pivot':
                this.changeContent(el('.report-view'));
                return createPivotTable($(this.shadowRoot.querySelector('.report-view')), this.report, this.data);

            case 'chart-line':
            case 'chart-donut':
            case 'chart-pie':
            case 'gauge':
            case 'pyramid':
                {
                    const id = 'CHART-' + this.report.id + '-' + uuid.v4();
                    this.changeContent(el(`#${id}`));

                    const chart = initChart(this.report);
                    c3Charts.rebuildChart(this.report, this.shadowRoot.querySelector(`#${id}`), this.data, chart);
                }
                break;

            case 'indicator':
                this.changeContent(generateIndicator(this.report, this.data));
                break;
            }
        } else {
            this.changeContent('<div style="width: 100%; height: 100%; display: flex; align-items: center;"><span style="color: darkgray; font-size: initial; width:100%; text-align: center;"><img src="images/empty.png">' + i18n.gettext('No data for this report') + '</span></div>');
        }
    }
}

function initChart (report) {
    const chart = {
        id: 'Chart' + uuid.v4(),
        dataColumns: [],
        datax: {},
        height: report.properties.height,
        legendPosition: report.properties.legendPosition,
        range: report.properties.range
    };
    switch (report.reportType) {
    case 'chart-line':
        chart.type = 'line';
        break;
    case 'chart-donut':
        chart.type = 'donut';
        break;
    case 'chart-pie':
        chart.type = 'pie';
        break;
    case 'gauge':
        chart.type = 'gauge';
        break;
    case 'pyramid':
        chart.type = 'pyramid';
        break;
    }

    if (['chart-line', 'chart-donut', 'chart-pie', 'pyramid'].indexOf(report.reportType) >= 0 &&
        report.properties.xkeys.length > 0 && report.properties.ykeys.length > 0) {
        chart.dataColumns = report.properties.ykeys;

        chart.dataAxis = {
            id: report.properties.xkeys[0].id,
        };

        if (report.properties.xkeys.length > 1) {
            chart.stackDimension = {
                id: report.properties.xkeys[1].id,
            };
        }
    }

    if (report.reportType === 'gauge') {
        chart.dataColumns = report.properties.ykeys;
    }

    return chart;
}

function generateIndicator (report, data) {
    let htmlCode = '';

    const theData = data;
    if (theData) {
        let theYKey = report.properties.ykeys[0].id;

        theYKey = theYKey.replace(/[^a-zA-Z ]/g, '');

        let theValue = theData[0][theYKey];

        if (report.properties.valueType === 'percentage') {
            theValue = theData[0].value;
        }

        if (report.properties.valueType === 'currency' && report.properties.currencySymbol) {
            theValue = theData[0].value + ' ' + report.properties.currencySymbol;
        }

        let theValueText = '';

        if (typeof report.properties.valueText !== 'undefined') {
            theValueText = report.properties.valueText;
        }

        htmlCode += '<div class="xe-widget xe-counter xe-counter-info" data-count=".num" data-from="1000" data-to="2470" data-duration="4" data-easing="true">';
        htmlCode += '   <div class="xe-label">';
        htmlCode += '       <div class="num">' + theValue + '</div>';
        htmlCode += '       <span style="color: #ccc;">' + theValueText + '</span>';
        htmlCode += '   </div>';
        htmlCode += '</div>';

        return htmlCode;
    }
}

window.customElements.define('app-reportview', ReportView);
