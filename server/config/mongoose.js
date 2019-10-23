const config = require('config');

module.exports = function () {
    const mongoose = require('mongoose');
    const debug = require('debug')('urungi:server');

    const db = config.get('db');
    mongoose.connect(db, {
        useNewUrlParser: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    });

    const connection = mongoose.connection;

    // CONNECTION EVENTS
    // When successfully connected
    connection.on('connected', function () {
        debug('Mongoose connection open to ' + db);
    });

    // If the connection throws an error
    connection.on('error', function (err) {
        console.error('Mongoose default connection error: ' + err);
    });

    // When the connection is disconnected
    connection.on('disconnected', function () {
        debug('Mongoose default connection disconnected');
    });

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function () {
        connection.close(function () {
            debug('Mongoose default connection disconnected through app termination');
        });
    });

    require('../models/company');
    require('../models/dashboard');
    require('../models/datasource');
    require('../models/file');
    require('../models/layer');
    require('../models/log');
    require('../models/report');
    require('../models/statistic');
    require('../models/user');
    require('../models/role');

    return connection;
};
