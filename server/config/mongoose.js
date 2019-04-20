module.exports = function (_, done) {
    const path = require('path');
    const mongoose = require('mongoose');
    const debug = require('debug')('urungi:server');

    if (config.get('db_type') === 'tingoDB') {
        // global.connection = mongoose.connect('tingodb:'+global.tingo_db_path);
        debug('tingo DB connection');
        global.TUNGUS_DB_OPTIONS = { nativeObjectID: true, searchInArray: true };
        global.connection = mongoose.connect('mongodb://data');
    } else {
        const dbURI = config.get('db');
        debug('mongo DB connection');
        mongoose.Promise = global.Promise;
        global.connection = mongoose.createConnection(dbURI, {
            poolSize: 5,
            useNewUrlParser: true,
            useFindAndModify: false,
        });

        // CONNECTION EVENTS
        // When successfully connected
        connection.on('connected', function () {
            if (typeof done !== 'undefined') {
                done();
            } else {
                debug('Mongoose connection open to ' + dbURI);
            }
        });

        // If the connection throws an error
        connection.on('error', function (err) {
            console.error('Mongoose default connection error: ' + err);
        });

        // When the connection is disconnected
        connection.on('disconnected', function () {
            debug('Mongoose default connection disconnected');
        });
    }

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function () {
        connection.close(function () {
            debug('Mongoose default connection disconnected through app termination');
            process.exit(0);
        });
    });

    var fs = require('fs');

    // Custom models
    var models_dir = path.join(__dirname, '..', 'custom');
    fs.readdirSync(models_dir).forEach(function (file) {
        if (file[0] === '.') return;
        require(models_dir + '/' + file + '/model.js');
    });
};
