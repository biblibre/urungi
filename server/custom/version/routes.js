const child_process = require('child_process');

module.exports = function (app) {
    const version = require('../../../package.json').version;

    let gitVersion;
    const result = child_process.spawnSync('git', ['describe', '--dirty']);
    if (result.status === 0) {
        gitVersion = result.stdout.toString().trim();
    }

    app.get('/api/version', function (req, res) {
        const response = {
            data: {
                version: version,
                gitVersion: gitVersion,
            },
        };

        res.status(200).json(response);
    });
};
