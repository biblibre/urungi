const express = require('express');

const router = express.Router();

router.use('/connection-test', require('./api/connection-test'));
router.use('/datasources', require('./api/datasources'));
router.use('/files', require('./api/files'));
router.use('/roles', require('./api/roles'));
router.use('/shared-space', require('./api/shared-space'));
router.use('/statistics', require('./api/statistics'));
router.use('/themes', require('./api/themes'));
router.use('/user', require('./api/user'));
router.use('/users', require('./api/users'));
router.use('/version', require('./api/version'));

router.use(function errorHandler (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }

    res.status(500).json({ error: err.message });
});

module.exports = router;
