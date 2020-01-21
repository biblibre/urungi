const config = require('config');
const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const restrict = require('../../middlewares/restrict.js');

const router = express.Router();
const File = mongoose.model('File');

const upload = multer({
    fileFilter: (req, file, cb) => {
        const type = file.mimetype.split('/')[0];
        cb(null, (type === 'image'));
    },
    storage: multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, config.get('uploads.path'));
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    }),
});

router.get('/', restrict, getFiles);
router.post('/', restrict, upload.single('content'), uploadFile);

function getFiles (req, res, next) {
    var filter = {
        type: new RegExp('image', 'i'),
        upload_user_id: req.user._id,
    };

    File.find(filter).then(files => {
        res.status(200).json({ files: files });
    }).catch(next);
};

function uploadFile (req, res, next) {
    if (!req.file) {
        throw new Error('No file uploaded');
    }

    const file = req.file;

    const fileInfo = {
        upload_user_id: req.user._id,
        companyID: req.user.companyID,
        filename: file.filename,
        name: file.originalname,
        type: file.mimetype,
        url: 'uploads/' + file.filename,
        size: file.size,
    };

    File.create(fileInfo).then(createdFile => {
        res.json(createdFile);
    }).catch(next);
};

module.exports = router;
