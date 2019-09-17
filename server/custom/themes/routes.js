const fs = require('fs');
const path = require('path');

module.exports = function (app) {
    app.get('/api/themes', function (req, res) {
        const themesDir = path.join(__dirname, '..', '..', '..', 'public', 'themes');
        fs.readdir(themesDir, function (err, files) {
            if (err) {
                console.error(err);
                res.sendStatus(500);
                return;
            }

            const cssFiles = files.filter(filename => {
                return !filename.startsWith('_') && filename.endsWith('.css');
            });
            const themes = cssFiles.map(filename => filename.substring(0, filename.length - 4));
            themes.sort();

            res.status(200).send({ data: themes });
        });
    });
};
