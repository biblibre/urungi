const config = require('config');
const escapeRegExp = require('./escape-regexp.js');

module.exports = {
    getAggregationPipelineFromQuery,
};

function getAggregationPipelineFromQuery (query) {
    const perPage = config.get('pagination.itemsPerPage');
    const filter = {};
    const dataPipeline = [];

    if (query.filters) {
        const filters = JSON.parse(query.filters);
        for (const [field, value] of Object.entries(filters)) {
            if (typeof value === 'object' && value !== null) {
                for (const [op, v] of Object.entries(value)) {
                    if (op === 'contains') {
                        filter[field] = new RegExp(escapeRegExp(v), 'i');
                    }
                }
            } else {
                filter[field] = value;
            }
        }
    }

    if (query.sort) {
        const pipe = { $sort: {} };
        for (const sort of query.sort.split(',')) {
            if (sort.startsWith('-')) {
                pipe.$sort[sort.substring(1)] = -1;
            } else {
                pipe.$sort[sort] = 1;
            }
        }
        dataPipeline.push(pipe);
    }

    const page = query.page;
    if (page > 0) {
        dataPipeline.push({ $skip: (page - 1) * perPage });
        dataPipeline.push({ $limit: perPage });
    }

    if (query.fields) {
        const projection = {};
        const fields = query.fields.split(',');
        for (const field of fields) {
            projection[field] = 1;
        }
        dataPipeline.push({ $project: projection });
    }

    // sub-pipeline in $facet stage cannot be empty
    if (dataPipeline.length === 0) {
        dataPipeline.push({ $skip: 0 });
    }

    const facet = {
        data: dataPipeline,
        count: [{ $count: 'count' }],
    };

    const projection = {
        data: 1,
        page: { $literal: page || 1 },
    };

    if (page) {
        projection.pages = {
            $ceil: {
                $divide: [
                    { $ifNull: [{ $arrayElemAt: ['$count.count', 0] }, 0] },
                    perPage
                ]
            }
        };
    } else {
        projection.pages = { $literal: 1 };
    }

    const pipeline = [
        { $match: filter },
        { $facet: facet },
        { $project: projection },
    ];

    return pipeline;
}
