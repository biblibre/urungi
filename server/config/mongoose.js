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

    require('../custom/companies/model');
    require('../custom/dashboards/model');
    require('../custom/dashboardsv2/model');
    require('../custom/data-sources/model');
    require('../custom/files/model');
    require('../custom/layers/model');
    require('../custom/logs/model');
    require('../custom/reports/model');
    require('../custom/roles/model');
    require('../custom/statistics/model');
    require('../custom/users/model');

    return connection;
};
