import i18n from '../i18n.js';
import api from '../api.js';

const aggregations = {
    sum: i18n.gettext('Sum'),
    avg: i18n.gettext('Avg'),
    min: i18n.gettext('Min'),
    max: i18n.gettext('Max'),
    count: i18n.gettext('Count'),
    countDistinct: i18n.gettext('Count distinct'),
};

/**
 * Returns a human-readable description of an aggregation function
 *
 * @param {string} aggregation - Name of the aggregation function
 * @returns {string} The translated human-readable description of the
 *     aggregation function
 */
export function getAggregationDescription (aggregation) {
    if (aggregation in aggregations) {
        return aggregations[aggregation];
    }
}

export function getColumnDescription (column) {
    let columnDescription = column.label;
    if (!columnDescription) {
        columnDescription = column.layerObject.elementLabel;
        if (column.aggregation) {
            const aggregationDescription = getAggregationDescription(column.aggregation);
            columnDescription += ' (' + aggregationDescription + ')';
        }
    }

    return columnDescription;
}

export function storeReport (report) {
    sessionStorage.setItem('storedReport', JSON.stringify(report));
}

export function getStoredReport () {
    const json = sessionStorage.getItem('storedReport');
    if (!json) {
        return null;
    }

    sessionStorage.removeItem('storedReport');
    return JSON.parse(json);
}

/*
 * The id of a column (column.id) differs from the id of the element
 * which that column uses (column.elementID). This allows for multiple
 * columns which use the same element, for example to use different
 * aggregations
 */
export function getColumnId (element) {
    let columnId;

    const aggregation = element.aggregation;

    if (!aggregation) {
        columnId = 'e' + element.elementID.toLowerCase() + 'raw';
    } else {
        columnId = 'e' + element.elementID.toLowerCase() + aggregation.substring(0, 3);
    }

    return columnId;
}

// Checks if a prompt is correctly filled (criteria by filterType)
export function checkPrompt (prompt) {
    if (!prompt.criterion) {
        return false;
    }

    if (prompt.elementType === 'date') {
        if (prompt.filterType === 'between' || prompt.filterType === 'notBetween') {
            return !!(prompt.criterion.text1 && prompt.criterion.text2);
        }
        if (prompt.filterType.endsWith('-pattern')) {
            return !!prompt.criterion.datePattern;
        }

        return !!prompt.criterion.text1;
    }

    if (prompt.filterType === 'between' || prompt.filterType === 'notBetween') {
        return !!(prompt.criterion.text1 && prompt.criterion.text2);
    }
    if (prompt.filterType === 'in' || prompt.filterType === 'not in') {
        return Array.isArray(prompt.criterion.textList) && prompt.criterion.textList.length > 0;
    }

    return !!prompt.criterion.text1;
}

export function checkPrompts (prompts) {
    return prompts.every(checkPrompt);
}

export function getReportDefinition (id, isLinked) {
    const url = '/api/reports/get-report/' + id;
    const params = { id, mode: 'preview', linked: isLinked };

    return api.httpGet(url, params).then(res => res.data.item);
}
