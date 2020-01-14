const config = require('config');
const escapeRegExp = require('./escape-regexp.js');

module.exports = {
    find,
};

async function find (model, req) {
    const filter = {};
    const projection = {};
    const options = {};

    if (req.query.filters) {
        const filters = JSON.parse(req.query.filters);
        for (const key in filters) {
            filter[key] = new RegExp(escapeRegExp(filters[key]), 'i');
        }
    }

    if (req.query.fields) {
        const fields = req.query.fields.split(',');
        for (const field of fields) {
            projection[field] = 1;
        }
    }

    const perPage = config.get('pagination.itemsPerPage');
    if (req.query.page > 0) {
        options.skip = (req.query.page - 1) * perPage;
        options.limit = perPage;
    }

    if (req.query.sort) {
        options.sort = req.query.sort;
    }

    const docs = await model.find(filter, projection, options);
    const count = await model.countDocuments(filter);
    const page = req.query.page ? req.query.page : 1;
    const pages = req.query.page ? Math.ceil(count / perPage) : 1;

    return { items: docs, page: page, pages: pages };
}
