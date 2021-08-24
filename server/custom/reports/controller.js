const config = require('config');
const mongoose = require('mongoose');

const Report = mongoose.model('Report');

const Controller = require('../../core/controller.js');
const QueryProcessor = require('../../core/queryProcessor');

class ReportsController extends Controller {
    constructor () {
        super(Report);
        this.searchFields = ['reportName'];
    }
}

const controller = new ReportsController();

exports.ReportsFindAll = async function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user.companyID = 'COMPID';
    const perPage = config.get('pagination.itemsPerPage');
    const page = (req.query.page) ? req.query.page : 1;
    const result = controller.findAllParams(req);
    let response;

    if (req.query.populate === 'layer') {
        const commonPipeline = [
            {
                $lookup: {
                    from: 'layers',
                    localField: 'selectedLayerID',
                    foreignField: '_id',
                    as: 'layer'
                }
            },
            {
                $unwind: {
                    path: '$layer',
                }
            },
            {
                $match: result.find,
            },

        ];

        if (!req.user.isAdmin()) {
            commonPipeline.push({ $match: { owner: `${req.user._id}` } });
        }

        const pipeline = commonPipeline.slice();

        if (result.fields && Object.keys(result.fields).length > 0) {
            result.fields.layer = 1;
            pipeline.push({ $project: result.fields });
        }

        pipeline.push({ $addFields: { layerName: '$layer.name' } });

        if (result.params.sort && Object.keys(result.params.sort).length > 0) {
            pipeline.push({ $sort: result.params.sort });
        }

        if (result.params.skip) {
            pipeline.push({ $skip: result.params.skip });
        }

        if (result.params.limit) {
            pipeline.push({ $limit: result.params.limit });
        }

        const countPipeline = commonPipeline.slice();
        countPipeline.push({ $count: 'totalCount' });

        const countDocs = await Report.aggregate(countPipeline);
        const count = countDocs.length ? countDocs[0].totalCount : 0;
        const reports = await Report.aggregate(pipeline);

        response = {
            result: 1,
            page: page,
            pages: req.query.page ? Math.ceil(count / perPage) : 1,
            items: reports,
        };
    } else {
        if (!req.user.isAdmin()) {
            if (!req.query.find) {
                req.query.find = [];
            }
            req.query.find.push({ owner: req.user._id });
        }

        response = await controller.findAll(req);
    }
    res.status(200).json(response);
};

exports.GetReport = function (req, res) {
    Report.findById(req.params.id).populate('selectedLayerID').then(function (report) {
        if (!report || (!report.isPublic && !req.isAuthenticated())) {
            return res.status(403).send('Forbidden');
        }

        const reportObject = report.toObject({ getters: true, depopulate: true });

        res.status(200).json({ result: 1, item: reportObject });

        if ((req.query.mode === 'execute' || req.query.mode === 'preview')) {
            // Note the execution in statistics
            const Statistic = mongoose.model('Statistic');
            const stat = {};
            stat.type = 'report';
            stat.relationedID = report._id;
            stat.relationedName = report.reportName;

            if (req.query.linked === true) {
                stat.action = 'execute link';
            } else {
                stat.action = 'execute';
            }
            Statistic.saveStat(req, stat);
        }
    }, err => {
        res.status(200).json({ result: 0, msg: 'A database error has occured : ' + String(err), error: err });
    });
};

exports.ReportsFindOne = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;

    controller.findOne(req).then(function (result) {
        res.status(200).json(result);
    });
};

exports.ReportsCreate = function (req, res) {
    req.user.getPermissions().then(permissions => {
        if (!permissions.reportsCreate && !req.user.isAdmin()) {
            res.status(401).json({ result: 0, msg: 'You do not have permissions to create reports' });
        } else {
            req.query.trash = true;
            req.query.companyid = true;
            req.query.userid = true;

            req.body.owner = req.user._id;
            req.body.isPublic = false;
            req.body.isShared = false;

            req.body.author = req.user.userName;

            controller.create(req).then(function (result) {
                res.status(200).json(result);
            });
        }
    });
};

exports.ReportsUpdate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    const data = req.body;

    if (!req.user.isAdmin()) {
        Report.findOne({ _id: data._id, owner: req.user._id, companyID: req.user.companyID }, { _id: 1 }, {}, function (err, item) {
            if (err) throw err;
            if (item) {
                controller.update(req).then(function (result) {
                    res.status(200).json(result);
                });
            } else {
                res.status(401).json({ result: 0, msg: 'You don´t have permissions to update this report, or this report do not exists' });
            }
        });
    } else {
        controller.update(req).then(function (result) {
            res.status(200).json(result);
        });
    }
};

exports.PublishReport = async function (req, res) {
    const report = await getReportFromRequest(req);
    if (report) {
        report.publish().then(() => {
            res.status(200).json({ result: 1, msg: 'Report published' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error publishing report' });
        });
    } else {
        res.status(404).json({ result: 0, msg: 'This report does not exist' });
    }
};

exports.UnpublishReport = async function (req, res) {
    const report = await getReportFromRequest(req);
    if (report) {
        report.unpublish().then(() => {
            res.status(200).json({ result: 1, msg: 'Report unpublished' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error unpublishing report' });
        });
    } else {
        res.status(404).json({ result: 0, msg: 'This report does not exist' });
    }
};

exports.ShareReport = async function (req, res) {
    const report = await getReportFromRequest(req);
    if (report) {
        report.share(req.body.parentFolder).then(() => {
            res.status(200).json({ result: 1, msg: 'Report shared' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error sharing report' });
        });
    } else {
        res.status(404).json({ result: 0, msg: 'This report does not exist' });
    }
};

exports.UnshareReport = async function (req, res) {
    const report = await getReportFromRequest(req);
    if (report) {
        report.unshare().then(() => {
            res.status(200).json({ result: 1, msg: 'Report unshared' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error unsharing report' });
        });
    } else {
        res.status(404).json({ result: 0, msg: 'This report does not exist' });
    }
};

exports.ReportsDelete = async function (req, res) {
    const report = await getReportFromRequest(req);
    if (report) {
        report.remove().then(() => {
            res.status(200).json({ result: 1, msg: 'Report deleted' });
        }, err => {
            console.error(err);
            res.status(500).json({ result: 0, msg: 'Error deleting report' });
        });
    } else {
        res.status(404).json({ result: 0, msg: 'This report does not exist' });
    }
};

exports.dataQuery = async function (req, res) {
    const report = req.body.report;
    const limit = req.body.limit;
    const filters = req.body.filters;

    let result;
    try {
        const query = generateQuery(report);

        if (limit) {
            query.quickResultLimit = limit;
        }

        if (filters) {
            for (const filter of query.filters) {
                if (filters[filter.id + filter.filterType]) {
                    filter.criterion = filters[filter.id + filter.filterType];
                }
            }
        }

        result = await QueryProcessor.execute(query);
    } catch (err) {
        console.error(err);
        result = { result: 0, msg: (err.msg) ? err.msg : String(err), error: err };
    }
    res.status(200).json(result);
};

exports.filterValuesQuery = async function (req, res) {
    const filter = req.body.filter;
    const options = req.body.options || {};

    let result;
    try {
        const query = {
            layerID: filter.layerID,
            columns: [
                {
                    id: 'f',
                    collectionID: filter.collectionID,
                    elementID: filter.elementID,
                    elementName: filter.elementName,
                    elementType: filter.elementType,
                    layerID: filter.layerID,
                },
                {
                    id: 'count',
                    collectionID: filter.collectionID,
                    elementID: filter.elementID,
                    elementName: filter.elementName,
                    elementType: filter.elementType,
                    layerID: filter.layerID,
                    aggregation: 'count',
                },
            ],
            order: [
                {
                    id: 'f',
                    elementID: filter.elementID,
                    sortType: 1,
                },
            ],
            filters: [],
        };

        if (options.contains) {
            query.filters.push({
                elementID: filter.elementID,
                filterType: 'contains',
                criterion: {
                    text1: options.contains,
                },
            });
        }

        if (options.limit) {
            query.recordLimit = options.limit;
        }

        result = await QueryProcessor.execute(query);
    } catch (err) {
        console.error(err);
        result = { result: 0, msg: (err.msg) ? err.msg : String(err), error: err };
    }
    res.status(200).json(result);
};

function generateQuery (report) {
    const query = {};

    const columns = [];
    if (Array.isArray(report.properties.columns)) {
        columns.push.apply(columns, report.properties.columns);
    }
    if (Array.isArray(report.properties.xkeys)) {
        columns.push.apply(columns, report.properties.xkeys);
    }
    if (Array.isArray(report.properties.ykeys)) {
        columns.push.apply(columns, report.properties.ykeys);
    }
    if (report.properties.pivotKeys && Array.isArray(report.properties.pivotKeys.columns)) {
        columns.push.apply(columns, report.properties.pivotKeys.columns);
    }
    if (report.properties.pivotKeys && Array.isArray(report.properties.pivotKeys.rows)) {
        columns.push.apply(columns, report.properties.pivotKeys.rows);
    }
    if (report.properties.map && Array.isArray(report.properties.map.geojson)) {
        columns.push.apply(columns, report.properties.map.geojson);
    }
    if (report.properties.map && Array.isArray(report.properties.map.value)) {
        columns.push.apply(columns, report.properties.map.value);
    }
    if (report.properties.map && Array.isArray(report.properties.map.label)) {
        columns.push.apply(columns, report.properties.map.label);
    }
    if (report.properties.map && Array.isArray(report.properties.map.group)) {
        columns.push.apply(columns, report.properties.map.group);
    }
    if (report.properties.map && Array.isArray(report.properties.map.type)) {
        columns.push.apply(columns, report.properties.map.type);
    }
    query.columns = columns;

    query.order = report.properties.order ? report.properties.order.slice() : [];
    query.filters = report.properties.filters ? report.properties.filters.slice() : [];

    if (report.reportType === 'pivot') {
        // For pivot tables we want to retrieve the raw data,
        // the aggregation will be done by pivottable.js
        for (const column of query.columns) {
            delete column.aggregation;
        }
    }

    if (report.properties.recordLimit) {
        query.recordLimit = report.properties.recordLimit;
    }

    query.layerID = report.selectedLayerID;

    return query;
}

function getReportFromRequest (req) {
    const conditions = {
        _id: req.body._id || req.body.id,
        companyID: req.user.companyID,
    };

    if (!req.user.isAdmin()) {
        conditions.owner = req.user._id;
    }

    return Report.findOne(conditions);
}
