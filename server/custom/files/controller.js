var Files = connection.model('Files');

exports.getFiles = function (req, res) {
    var find = { 'type': new RegExp('image', 'i'), 'upload_user_id': req.user._id };

    if (req.query.format) {
        find['extension'] = req.query.format;
    }

    Files.find(find, {}, { sort: { created: -1 } }, function (err, files) {
        if (err) throw err;

        res.status(200).json({ result: 1, files: files });
    });
};

exports.registerUpload = async function (req, res) {
    const file = req.file;
    // const params = req.body;

    if (!req.file) {
        res.status(200).json({ result: 0, msg: 'Upload failed' });
        return;
    }

    const fileInfo = {
        upload_user_id: req.user._id,
        companyID: req.user.companyID,
        filename: file.filename,
        name: file.originalName,
        type: file.mimetype,
        url: '/uploads/' + file.filename,
        size: file.size,
        nd_trash_deleted: false,
        createdOn: new Date()
    };

    try {
        const createdFile = await Files.create(fileInfo);
        res.status(200).json({ result: 1, item: createdFile });
    } catch (err) {
        console.error(err);
        res.status(200).json({ result: 0, msg: String(err), error: err });
    }
};
