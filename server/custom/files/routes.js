const restrict = require('../../middlewares/restrict');

module.exports = function (app) {
    var Files = require('./controller.js');

    app.get('/api/files/get-files', restrict, Files.getFiles);

    const multer = require('multer');
    const path = require('path');

    function fileFilter (req, file, cb) {
        // For now, only images can be uploaded
        // this is because currently the only use of the file system is for images in dashboards

        const type = file.mimetype.split('/')[0];
        cb(null, (type === 'image'));
    }

    var storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, path.join(__dirname, '..', '..', '..', 'uploads'));
        },
        filename: function (req, file, cb) {
            cb(null, Date.now() + '-' + file.originalname);
        }
    });

    const upload = multer({
        fileFilter: fileFilter,
        storage: storage,
    });

    app.post('/api/files/upload', restrict, upload.single('content'), Files.registerUpload);
};
