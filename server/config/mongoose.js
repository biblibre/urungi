module.exports = function (_, done) {
    const path = require('path');
    const mongoose = require('mongoose');

    if (config.get('db_type') === 'tingoDB') {
        // global.connection = mongoose.connect('tingodb:'+global.tingo_db_path);
        console.log('tingo DB connection');
        global.TUNGUS_DB_OPTIONS = { nativeObjectID: true, searchInArray: true };
        global.connection = mongoose.connect('mongodb://data');
    } else {
        const dbURI = config.get('db');
        console.log('mongo DB connection');
        mongoose.Promise = global.Promise;
        global.connection = mongoose.createConnection(dbURI, { server: { poolSize: 5 } });

        // CONNECTION EVENTS
        // When successfully connected
        connection.on('connected', function () {
            if (typeof done !== 'undefined') {
                done();
            } else {
                console.log('Mongoose connection open to ' + dbURI);
            }
        });

        // If the connection throws an error
        connection.on('error', function (err) {
            console.log('Mongoose default connection error: ' + err);
        });

        // When the connection is disconnected
        connection.on('disconnected', function () {
            console.log('Mongoose default connection disconnected');
        });
    }

    // If the Node process ends, close the Mongoose connection
    process.on('SIGINT', function () {
        connection.close(function () {
            console.log('Mongoose default connection disconnected through app termination');
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
