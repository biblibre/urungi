(function () {
    'use strict';

    const elementTypes = [
        'object',
        'string',
        'number',
        'boolean',
        'date',
        'array',
    ];

    const numberDefaultAggregation = [
        { name: 'raw', value: 'value' },
        { name: 'SUM', value: 'sum' },
        { name: 'AVG', value: 'avg' },
        { name: 'MIN', value: 'min' },
        { name: 'MAX', value: 'max' },
        { name: 'COUNT', value: 'count' }
    ];

    const stringDefaultAggregation = [
        { name: 'raw', value: 'value' },
        { name: 'COUNT', value: 'count' }
    ];

    angular.module('app.layers')
        .constant('layerUtils', layerUtils)
        .constant('layerElementTypes', elementTypes)
        .constant('layerNumberDefaultAggregation', numberDefaultAggregation)
        .constant('layerStringDefaultAggregation', stringDefaultAggregation);
})();
