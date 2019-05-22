const Companies = connection.model('Companies');

exports.getCompanyData = function (req, res) {
    Companies.findOne({ companyID: req.user.companyID, nd_trash_deleted: false }, {}, function (err, company) {
        if (err) throw err;

        res.status(200).json({ result: 1, page: 1, pages: 1, items: company });
    });
};

exports.saveSharedSpace = function (req, res) {
    var data = req.body;

    Companies.update({ companyID: req.user.companyID }, { $set: { sharedSpace: data } }, function (err, rawResponse) {
        if (err) throw err;

        let result;
        if (rawResponse.nModified > 0) {
            result = { result: 1, msg: rawResponse.nModified + ' record updated.' };
        } else {
            result = { result: 0, msg: 'Error updating record, no record have been updated' };
        }

        res.status(200).json(result);
    });
};

exports.saveCustomCSS = function (req, res) {
    var data = req.body.customCSS;

    Companies.update({ companyID: req.user.companyID }, { $set: { customCSS: data } }, function (err, numAffected) {
        if (err) throw err;

        let result;
        if (numAffected > 0) {
            result = { result: 1, msg: numAffected + ' record updated.' };
        } else {
            result = { result: 0, msg: 'Error updating record, no record have been updated' };
        }

        res.status(200).json(result);
    });
};

exports.saveCustomLogo = function (req, res) {
    var data = req.body;

    Companies.update({ companyID: req.user.companyID }, { $set: { customLogo: data } }, function (err, numAffected) {
        if (err) throw err;

        let result;
        if (numAffected > 0) {
            result = { result: 1, msg: numAffected + ' record updated.' };
        } else {
            result = { result: 0, msg: 'Error updating record, no record have been updated' };
        }

        res.status(200).json(result);
    });
};
