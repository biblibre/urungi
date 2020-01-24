const express = require('express');
const restrictAdmin = require('../../middlewares/restrict-admin.js');
const DatabaseClient = require('../../core/database-client.js');

const router = express.Router();

router.post('/', restrictAdmin, connectionTest);

function connectionTest (req, res, next) {
    const validTypes = ['MySQL', 'POSTGRE', 'ORACLE', 'MSSQL'];
    if (!validTypes.includes(req.body.type)) {
        return res.status(422).json({ error: 'Invalid database type' });
    }

    const dbClient = DatabaseClient.fromDatasource(req.body);
    dbClient.testConnection().then(() => {
        res.json({ ok: true });
    }, err => {
        res.json({ ok: false, error: err.message });
    });
}

module.exports = router;
