const express = require('express');

const router = express.Router();

router.use('/roles', require('./api/roles'));
router.use('/shared-space', require('./api/shared-space'));
router.use('/statistics', require('./api/statistics'));
router.use('/user', require('./api/user'));
router.use('/users', require('./api/users'));

module.exports = router;
