const express = require('express');

const router = express.Router();

router.use('/roles', require('./api/roles'));
router.use('/shared-space', require('./api/shared-space'));
router.use('/statistics', require('./api/statistics'));
router.use('/themes', require('./api/themes'));
router.use('/user', require('./api/user'));
router.use('/users', require('./api/users'));
router.use('/version', require('./api/version'));

module.exports = router;
