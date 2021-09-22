const express = require('express');
const path = require('path');

const docRouter = express.Router({
    caseSensitive: true,
    strict: true,
});

docRouter.use('/user', express.static(path.join(__dirname, '../../doc/user/_build/html')));
docRouter.all('*', function (req, res) {
    res.sendStatus(404);
});

module.exports = docRouter;
