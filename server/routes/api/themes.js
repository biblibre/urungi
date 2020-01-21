const express = require('express');
const path = require('path');
const fs = require('fs');
const restrict = require('../../middlewares/restrict.js');

const router = express.Router();

router.get('/', restrict, getThemes);

function getThemes (req, res, next) {
    const themesDir = path.join(__dirname, '..', '..', '..', 'public', 'themes');
    fs.readdir(themesDir, function (err, files) {
        if (err) {
            return next(err);
        }

        const cssFiles = files.filter(filename => {
            return !filename.startsWith('_') && filename.endsWith('.css');
        });
        const themes = cssFiles.map(filename => filename.slice(0, -4));
        themes.sort();

        res.status(200).send({ data: themes });
    });
}

module.exports = router;
