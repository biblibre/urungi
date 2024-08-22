const express = require('express');
const child_process = require('child_process');

const router = express.Router();

const version = require('../../../package.json').version;

let gitVersion;
const result = child_process.spawnSync('git', ['describe', '--dirty']);
if (result.status === 0) {
    gitVersion = result.stdout.toString().trim();
}

router.get('/', getVersion);

function getVersion (req, res) {
    const response = {
        data: {
            version,
            gitVersion,
        },
    };

    res.status(200).json(response);
}

module.exports = router;
