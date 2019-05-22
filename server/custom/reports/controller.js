var Reports = connection.model('Reports');

const Controller = require('../../core/controller.js');
const QueryProcessor = require('../../core/queryProcessor');

class ReportsController extends Controller {
    constructor () {
        super(Reports);
        this.searchFields = ['reportName'];
    }
}

var controller = new ReportsController();

exports.ReportsFindAll = async function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    req.user = {};
    req.user.companyID = 'COMPID';
    var perPage = config.get('pagination.itemsPerPage');
    var page = (req.query.page) ? req.query.page : 1;
    var result = controller.findAllParams(req);
    let response;

    if (req.query.populate === 'layer') {
        const commonPipeline = [
            {
                $lookup: {
                    from: 'wst_Layers',
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

        const countDocs = await Reports.aggregate(countPipeline);
        const count = countDocs.length ? countDocs[0].totalCount : 0;
        const reports = await Reports.aggregate(pipeline);

        response = {
            result: 1,
            page: page,
            pages: req.query.page ? Math.ceil(count / perPage) : 1,
            items: reports,
        };
    } else {
        response = await controller.findAll(req);
    }

    res.status(200).json(response);
};

exports.GetReport = function (req, res) {
    req.query.trash = true;

    controller.findOne(req).then(function (result) {
        if (!result.item || (!result.item.isPublic && !req.isAuthenticated())) {
            return res.status(403).send('Forbidden');
        }

        res.status(200).json(result);
        if ((req.query.mode === 'execute' || req.query.mode === 'preview') && result.item) {
            // Note the execution in statistics
            var statistics = connection.model('statistics');
            var stat = {};
            stat.type = 'report';
            stat.relationedID = result.item._id;
            stat.relationedName = result.item.reportName;

            if (req.query.linked === true) {
                stat.action = 'execute link';
            } else {
                stat.action = 'execute';
            }
            statistics.save(req, stat);
        }
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
    if (!req.session.reportsCreate && !req.session.isWSTADMIN) {
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
};

exports.ReportsUpdate = function (req, res) {
    req.query.trash = true;
    req.query.companyid = true;
    var data = req.body;

    if (!req.session.isWSTADMIN) {
        var Reports = connection.model('Reports');
        Reports.findOne({ _id: data._id, owner: req.user._id, companyID: req.user.companyID }, { _id: 1 }, {}, function (err, item) {
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

exports.ReportsGetData = async function (req, res) {
    var data = req.body;
    var query = data.query;
    // processDataSources(req, query.datasources, query.layers, {page: (data.page) ? data.page : 1}, query, function (result) {
    //     res.status(200).json(result);
    // });
    var result;
    try {
        result = await QueryProcessor.execute(query);
    } catch (err) {
        console.error(err);
        result = { result: 0, msg: (err.msg) ? err.msg : String(err), error: err };
    }
    res.status(200).json(result);
};

function getReportFromRequest (req) {
    const conditions = {
        _id: req.body._id || req.body.id,
        companyID: req.user.companyID,
    };

    if (!req.session.isWSTADMIN) {
        conditions.owner = req.user._id;
    }

    return Reports.findOne(conditions);
}
